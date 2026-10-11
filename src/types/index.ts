import { MenuItem, DealItem, MenuCategory, DealCategory } from '../data/menuData.ts';
import { DeliveryZone } from '../data/deliveryZones.ts';

export type { DeliveryZone, MenuItem, DealItem, MenuCategory, DealCategory };

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  size?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  default_address?: string;
  default_landmark?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark?: string;
  notes?: string;
  delivery_zone_id?: string;
  delivery_zone_name?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: 'Unpaid (COD)' | 'Paid on Delivery' | 'Cancelled';
  order_status: 'Pending' | 'Accepted' | 'Preparing' | 'Out for delivery' | 'Delivered' | 'Rejected';
  created_at: string;
  items: Array<{
    id: string;
    menu_item_id?: string;
    item_name: string;
    unit_price: number;
    quantity: number;
    item_subtotal: number;
  }>;
}

export interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface BusinessConfig {
  appName: string;
  location: string;
  supabaseConfigured: boolean;
  businessSettings: {
    deliveryFee: number;
    minOrderAmount: number;
    storeOpen: boolean;
    address: string;
    phone: string;
  };
}
