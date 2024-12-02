export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    stock: number;
    quantity?: number;
  }
  
export interface CartItem extends Product {
    quantity: number;
}