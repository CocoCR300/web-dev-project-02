import PouchDB from 'pouchdb';
import { get } from '../database';

const DATABASE = new PouchDB("transactions");

export async function getTransactionsByMonth(month: number): Promise<{ week: string, amount: number}[]> {
    const transactions = await get(DATABASE, "date", "", 0, 9999999);

    const monthTransactions = transactions.filter(transaction => {
        const date = new Date((transaction.date as any) as string);
        return date.getMonth() === month;
    });
    
    const weeks = Array.from({ length: 4 }, (_, i) => ({ week: `Semana ${i + 1}`, amount: 0 }));
    monthTransactions.forEach(transaction => {
        const date = new Date((transaction.date as any) as string);
        const weekIndex = Math.floor(date.getDate() / 7);
        if (weekIndex < weeks.length) {
            weeks[weekIndex].amount += transaction.amount;
        }
    });
    return weeks;
}