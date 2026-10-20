import type { SanityImage } from "./common";

export type Variant = {
  name: string;
  price: number;
  stock: number;
};

export type Title = {
  _id: string;
  name: string;
  image: SanityImage;
};

export type Product = {
  _id: string;
  name: string;
  price: number;
  image: SanityImage[];
  rating: number;
  description: string;
  category: string;
  stock: number;
  variants: Variant[] | null;
  title: Title;
};

export type CartItem = Product & {
  quantity: number;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type OrderStatus = "pending" | "completed" | "cancelled";

export type Order = {
  _id: string;
  merchantId: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  createdAt: string;
  updatedAt: string;
};
