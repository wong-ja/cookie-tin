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
    year: number;
    budget: number;
    calorieLimit: number;
    items: Expense[];
    isClosed: boolean;
}