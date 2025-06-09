import PouchDB from 'pouchdb';
import { get } from '../database';

const DATABASE = new PouchDB("transactions");

export async function getTransactionsByMonth(month: number): Promise<{ week: string, amount: number}[]> {
    let flag = false
    const transactions = await get(DATABASE, "date", "", 0, 9999999);
    //console.log("Transactions fetched:", transactions);

    const monthTransactions = transactions.filter(transaction => {
        const date = new Date((transaction.date as any) as string);
        //console.log(`Transaction date: ${date}, Month: ${date.getMonth()}, Filtered Month: ${month}`);
        return date.getMonth() === month;
    });
    //console.log(`Transactions for month ${month + 1}:`, monthTransactions);
    const weeks = Array.from({ length: 4 }, (_, i) => ({ week: `Semana ${i + 1}`, amount: 0 }));
    monthTransactions.forEach(transaction => {
        const date = new Date((transaction.date as any) as string);
        const weekIndex = Math.floor(date.getDate() / 7);
        if (weekIndex < weeks.length) {
            weeks[weekIndex].amount += transaction.amount;
            if (transaction.amount < 0) {
                flag = true;
            }
        }
    });
    //console.log(weeks)
    //console.log("Transactions for month", weeks);
    return weeks;
}

export async function verifyTransactionsByMonth(month: number): Promise<boolean> {
    const transactions = await getTransactionsByMonth(month);

    return transactions.some(week => week.amount < 0);
}