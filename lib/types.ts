export interface Expense {
    id: string;
    name: string;
    amount: number;
    timestamp: number;
}

export interface TinSession {
    id: string;
    holidayName: string;
    year: number;
    budget: number;
    items: Expense[];
    isClosed: boolean;
}