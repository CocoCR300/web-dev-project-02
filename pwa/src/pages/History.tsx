import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getTransactionsByMonth } from "../services/History";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";


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
            <div className="p-4 flex flex-col md:flex-row">
                <div className="w-full md:w-1/2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {
							months.map((month) => {
								const anyTransactions = transactionData[month].some(w => w.amount != 0);
								const total = transactionData[month].map(w => w.amount).reduce((a0, a1, i, arr) => a0 + a1, 0);
								return (
									<div
										key={month}
										onClick={() => setSelectedMonth(month)}
										className="cursor-pointer hover:scale-105 transition-transform duration-200 h-auto w-40 md:w-50">
                                        <Card className="md:my-2 md:mx-8">
                                            <CardHeader>
                                                <CardTitle>{month}</CardTitle>
                                                <CardDescription>{anyTransactions ? `$${total} en transacciones` : "Sin transacciones"}</CardDescription>
                                            </CardHeader>
                                        </Card>
									</div>
								);
							})
						}
                    </div>
                </div>

                <div className=" w-full md:w-1/2 mt-5">
                    {selectedMonth && transactionData[selectedMonth] ? (
                        <div className="p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold text-gray-200 mb-4 text-center">
                                Transacciones de {selectedMonth}
                            </h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart
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
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="md:mr-5 p-6 rounded-lg shadow text-center text-gray-400">
                            <p>Selecciona un mes para ver el gráfico</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
