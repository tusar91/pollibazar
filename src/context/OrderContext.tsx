import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

interface OrderContextType {
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTracking: (orderId: string, phone: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  deleteOrder: (orderId: string) => boolean;
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
          // Remove old sample/demo orders created during testing
          const cleanOrders = parsed.filter(
            (o: Order) =>
              !DEMO_ORDER_IDS.has(o.orderId) &&
              o.customer?.phone !== '01819876543' &&
              o.customer?.phone !== '01912554433' &&
              o.customer?.fullName !== 'মোঃ তানভীর হাসান'
          );
          return cleanOrders;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [recentPlacedOrder, setRecentPlacedOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('pb_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  const createOrder = (input: CreateOrderInput): Order => {
    const now = new Date();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = String(Math.floor(1 + Math.random() * 9999)).padStart(4, '0');
    const orderId = `PB-${ymd}-${randomSeq}`;

    const dateStr = now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5);
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
      status: 'placed', // Default status: Order Placed (অর্ডার গ্রহণ করা হয়েছে)
      createdAt: dateStr,
      estimatedDelivery: estDeliveryDate,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setRecentPlacedOrder(newOrder);
    try {
      sessionStorage.setItem('pb_last_order', JSON.stringify(newOrder));
    } catch {}

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

  const updateOrderStatus = (orderId: string, status: OrderStatus): boolean => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
    );
    if (recentPlacedOrder && recentPlacedOrder.orderId === orderId) {
      setRecentPlacedOrder((prev) => (prev ? { ...prev, status } : null));
    }
    return true;
  };

  const deleteOrder = (orderId: string): boolean => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    return true;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
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
    throw new Error('useOrders must be used within a OrderProvider');
  }
  return context;
};
