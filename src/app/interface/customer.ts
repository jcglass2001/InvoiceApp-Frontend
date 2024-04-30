import { Invoice } from "./invoice";

export interface Customer {
    id: number;
    name: string;
    email: string;
    address: string;
    phone: number;
    status: string;
    type: string;
    imageUrl: string;
    invoices?: Invoice[];
}
