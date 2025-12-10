import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    email: string;
    role: 'buyer' | 'seller';
    displayName: string;
    photoBase64: string; // The profile image
    createdAt: Timestamp;
}

export interface Product {
    id?: string; // Optional because it's the doc ID
    sellerId: string; // Reference to user
    name: string;
    description: string;
    price: number;
    imageBase64: string; // Product image
    category: string;
    createdAt: Timestamp;
}
