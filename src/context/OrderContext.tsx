import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Order, OrderCustomer, OrderItem, OrderStatus, PaymentMethod } from '../types';

interface CreateOrderInput {
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentNumber?: string;
  trxId?: string;
  orderId?: string;
  id?: string;
  status?: OrderStatus;
  createdAt?: string;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: (silent?: boolean) => Promise<void>;
  createOrder: (input: CreateOrderInput) => Order;
  savePlacedOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTracking: (orderId: string, phone: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  recentPlacedOrder: Order | null;
  setRecentPlacedOrder: (order: Order | null) => void;
}

const ORDERS_STORAGE_KEY = 'pollibazar_orders';

// Old sample/demo order IDs to purge from development
const DEMO_ORDER_IDS = new Set(['PB-20261008-0001', 'PB-20261007-0042', 'PB-20261005-0103']);

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY) || localStorage.getItem('pollibazar_orders_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (o: Order) =>
              !DEMO_ORDER_IDS.has(o.orderId) &&
              o.customer?.phone !== '01819876543' &&
              o.customer?.phone !== '01912554433' &&
              o.customer?.fullName !== 'মোঃ তানভীর হাসান'
          );
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  const [recentPlacedOrder, setRecentPlacedOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('pb_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save orders to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  // Synchronize orders from backend API
  const fetchOrders = useCallback(async (silent = false) => {
    const token = localStorage.getItem('pb_session_token') || '';
    const isAdmin = localStorage.getItem('pollibazar_admin_auth') === 'true';

    // Only authorized admin / moderator can call GET /api/orders
    if (!token && !isAdmin) return;

    if (!silent) setIsLoading(true);

    try {
      let res = await fetch('/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      // Fallback to /api/admin/orders if /api/orders was not found
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/admin/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
      }

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.success && Array.isArray(data.data)) {
          // Normalize status if needed
          const serverOrders: Order[] = data.data.map((o: any) => ({
            ...o,
            orderId: o.orderId || o.id || '',
            status: o.status === 'pending' ? 'placed' : o.status,
            customer: o.customer || {
              fullName: o.customer_name || 'গ্রাহক',
              phone: o.customer_phone || '',
              district: o.district || '',
              area: o.area || '',
              address: o.delivery_address || '',
            },
            items: Array.isArray(o.items) ? o.items : [],
          }));

          setOrders(serverOrders);
          try {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(serverOrders));
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Notice: backend orders fetch error:', e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Fetch orders on mount if admin session is present
  useEffect(() => {
    const token = localStorage.getItem('pb_session_token');
    const isAdmin = localStorage.getItem('pollibazar_admin_auth') === 'true';
    if (token || isAdmin) {
      fetchOrders(true);
    }
  }, [fetchOrders]);

  const savePlacedOrder = (newOrder: Order) => {
    setOrders((prev) => {
      const filtered = prev.filter((o) => o.orderId !== newOrder.orderId);
      return [newOrder, ...filtered];
    });
    setRecentPlacedOrder(newOrder);
    try {
      sessionStorage.setItem('pb_last_order', JSON.stringify(newOrder));
    } catch {}
  };

  const createOrder = (input: CreateOrderInput): Order => {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');
    const orderId = input.orderId || `PB-${ymd}-${randomSeq}`;

    const dateStr = input.createdAt || (now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5));
    const estDeliveryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const newOrder: Order = {
      orderId,
      customer: input.customer,
      items: input.items,
      subtotal: input.subtotal,
      deliveryCharge: input.deliveryCharge,
      discount: input.discount,
      total: input.total,
      paymentMethod: input.paymentMethod,
      paymentNumber: input.paymentNumber,
      trxId: input.trxId,
      status: input.status || 'placed',
      createdAt: dateStr,
      estimatedDelivery: estDeliveryDate,
    };

    savePlacedOrder(newOrder);
    return newOrder;
  };

  const getOrderById = (orderId: string): Order | undefined => {
    const clean = orderId.trim().toUpperCase();
    return orders.find((o) => o.orderId.toUpperCase() === clean);
  };

  const getOrderByTracking = (orderId: string, phone: string): Order | undefined => {
    const cleanId = orderId.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/[-+ ]/g, '');
    return orders.find((o) => {
      const oPhone = o.customer.phone.replace(/[-+ ]/g, '');
      const matchId = o.orderId.toUpperCase() === cleanId;
      const matchPhone = oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone);
      return matchId && matchPhone;
    });
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    // 1. Optimistically update local state
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
    );
    if (recentPlacedOrder && recentPlacedOrder.orderId === orderId) {
      setRecentPlacedOrder((prev) => (prev ? { ...prev, status } : null));
    }

    // 2. Persist to server API & D1
    const token = localStorage.getItem('pb_session_token') || '';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        console.warn(`Server returned ${res.status} when updating order status`);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Network error updating order status on server:', e);
      return false;
    }
  };

  const deleteOrder = async (orderId: string): Promise<boolean> => {
    // 1. Optimistically remove from state
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));

    // 2. Send DELETE to server API & D1
    const token = localStorage.getItem('pb_session_token') || '';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      return res.ok;
    } catch (e) {
      console.warn('Network error deleting order on server:', e);
      return false;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        fetchOrders,
        createOrder,
        savePlacedOrder,
        getOrderById,
        getOrderByTracking,
        updateOrderStatus,
        deleteOrder,
        recentPlacedOrder,
        setRecentPlacedOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
