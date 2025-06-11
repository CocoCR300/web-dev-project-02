import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getTransactionsByMonth } from "../services/History";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const months = [
	"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
	"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const chartConfig = {
	amount: {
		label: "Cantidad"
	}
}

export default function HistoryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(months[0]);
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
        <div className="flex flex-col h-full">
            <div className="flex flex-1 flex-col items-center justify-center">
                <div className="w-full md:w-1/2 mt-5">
					<h2 className="text-xl font-bold text-gray-200 mb-4 text-center">
						Transacciones de {selectedMonth}
					</h2>

                    {selectedMonth && transactionData[selectedMonth] ? (
                        <div className="pb-6 pt-6 rounded-lg shadow">
                            <ChartContainer className="min-h-[350px] w-full" config={ chartConfig }>
                                <AreaChart
                                    data={transactionData[selectedMonth]}
                                    margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="week" tick={{ fill: "#ccc" }} />
                                    <YAxis tick={{ fill: "#ccc" }} />
                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </div>
                    ) : (
                        <div className="md:mr-5 p-6 rounded-lg shadow text-center text-gray-400">
                            <p>Selecciona un mes para ver el gráfico</p>
                        </div>
                    )}
                </div>
            </div>
			<div className="flex justify-center">
				<Select
					value={ selectedMonth }
					onValueChange={ value => setSelectedMonth(value) }>
					<SelectTrigger className="w-max">
						<SelectValue placeholder="Seleccione una categoría" />
					</SelectTrigger>
					<SelectContent>
						{
							months.map((month, index) => {
								const anyTransactions = transactionData[month].some(w => w.amount != 0);
								const total = transactionData[month].map(w => w.amount).reduce((a0, a1, i) => a0 + a1, 0);

								let text: string;
								if (anyTransactions) {
									text = `${month} ($${total})`;
								}
								else {
									text = `${month} (Sin transacciones)`;
								}

								return (
									<SelectItem key={ index } value={ month }>
										{ text }
									</SelectItem>
								);
							})
						}
					</SelectContent>
				</Select>
			</div>
        </div>
    );
}
