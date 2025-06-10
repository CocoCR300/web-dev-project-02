import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { getTransactionsByMonth } from "../services/History";


export default function HistoryPage() {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [transactionData, setTransactionData] = useState<Record<string, any[]>>({});

    useEffect(() => {
        async function fetchTransactions() {
            const data: Record<string, any[]> = {};
            for (let i = 0; i < months.length; i++) {
                const transactions = await getTransactionsByMonth(i);
                data[months[i]] = transactions;
            }
            setTransactionData(data);
            setIsLoading(false);
        }

        fetchTransactions();
    }, []);

    if (isLoading) {
        return <p className="text-gray-400">Cargando transacciones...</p>;
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-4 text-center text-gray-200">
                Historial de Transacciones
            </h1>
            <div className="p-4 flex">
                    <div className="w-1/2">
                        <div className="grid grid-cols-3 gap-4">
                            {months.map((month) => (
                                <div
                                    key={month}
                                    onClick={() => setSelectedMonth(month)}
                                    className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 cursor-pointer text-center text-lg font-medium text-gray-300"
                                >
                                    <span>{month}</span>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {transactionData[month]?.some(week => week.amount > 0) ? "Con transacciones" : "Sin transacciones"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 w-1/2 p-4">
                        {selectedMonth && transactionData[selectedMonth] ? (
                            <div className="bg-gray-800 p-6 rounded-lg shadow">
                                <h2 className="text-xl font-bold text-gray-200 mb-4 text-center">
                                    Transacciones de {selectedMonth}
                                </h2>
                                <AreaChart
                                    width={600}
                                    height={250}
                                    data={transactionData[selectedMonth]}
                                    margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" tick={{ fill: "#ccc" }} />
                                    <YAxis tick={{ fill: "#ccc" }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorAmount)" />
                                </AreaChart>
                            </div>
                        ) : (
                            <div className="bg-gray-800 p-6 rounded-lg shadow text-center text-gray-400">
                                <p>Selecciona un mes para ver el gráfico</p>
                            </div>
                        )}
                    </div>
                </div>
            </>
    );
}