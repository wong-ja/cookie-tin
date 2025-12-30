export interface Expense {
    id: string;
    name: string;
    amount: number;
    calories?: number;
    timestamp: number;
}

export interface TinSession {
    id: string;
    holidayName: string;
    customName?: string;
    date: string;
    budget: number;
    calorieLimit: number;
    currency: string;
    items: Expense[];
    customBg?: string;
    timestamp: number;
    isClosed: boolean;
}