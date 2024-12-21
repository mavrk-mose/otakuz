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
};

// Example of a Variant type if needed
export type Variant = {
    name: string;
    price: number;
    stock: number;
};


export interface CartItem extends Product {
    quantity: number;
}