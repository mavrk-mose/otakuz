export type Product = {
  _id: string;
  name: string;
  price: number;
  image: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
  }[];
  rating: number;
  description: string;
  category: string;
  stock: number;
  variants: null | Array<Variant>; // You can define Variant if applicable
  title: {
    _id: string;
    name: string;
    image: {
      _type: "image";
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
  };
};

export type Title = {
  _id: string;
  name: string;
  image: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
};

export type Variant = {
  name: string;
  price: number;
  stock: number;
};

export interface CartItem extends Product {
  quantity: number;
}

export interface Merchant {
  _id: string;
  businessName: string;
  whatsappNumber: string;
  description: string;
  logo: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  paymentDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  merchantId: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "completed" | "cancelled";
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}
