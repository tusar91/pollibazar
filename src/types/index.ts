export interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  count: number;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string; // slug
  categoryName: string;
  price: number;
  oldPrice?: number;
  discount?: number; // percentage
  image: string;
  gallery: string[];
  unit: string; // যেমন: ১ কেজি, ৫০০ গ্রাম, ১ লিটার, ১ প্যাকেট
  shortDescription: string;
  description: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isAvailable: boolean;
  featured: boolean;
  newArrival: boolean;
  bestSeller?: boolean;
  origin?: string; // যেমন: দিনাজপুর, কুষ্টিয়া, সুন্দরবন, মানিকগঞ্জ
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export type OrderStatus =
  | 'placed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email?: string;
  district: string;
  area: string; // উপজেলা / এলাকা
  address: string;
  postCode?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  orderId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentNumber?: string;
  trxId?: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery?: string;
}

export interface FilterState {
  category: string;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest' | 'rating';
  onlyInStock: boolean;
  onlyDiscounted: boolean;
}
