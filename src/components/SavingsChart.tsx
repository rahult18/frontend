import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SavingsChartProps {
    monthlyBill: number;
    solarSavings: number;
    installationCost: number;
}

const generateChartData = (monthlyBill: number, solarSavings: number, installationCost: number) => {
    const data = [];
    let withoutSolar = 0;
    let withSolar = installationCost;
    const annualBill = monthlyBill * 12;
    const annualSavings = solarSavings / 20; // Assuming solarSavings is total over 20 years
    const costIncreaseFactor = 1.022; // 2.2% annual increase
    const discountRate = 1.04; // 4% annual discount rate

    for (let year = 0; year <= 20; year++) {
        withoutSolar += annualBill * Math.pow(costIncreaseFactor, year) / Math.pow(discountRate, year);
        withSolar += (annualBill - annualSavings) * Math.pow(costIncreaseFactor, year) / Math.pow(discountRate, year);
        data.push({
            year,
            withoutSolar: Math.round(withoutSolar),
            withSolar: Math.round(withSolar),
        });
    }

    return data;
};

export const SavingsChart: React.FC<SavingsChartProps> = ({ monthlyBill, solarSavings, installationCost }) => {
    const data = generateChartData(monthlyBill, solarSavings, installationCost);

    return (
        <Card className="w-full mt-6">
            <CardHeader>
                <CardTitle>20-Year Cost Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={data}
                        width={1200}
                        height={400}
                        margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            label={{ value: 'Years', position: 'insideLeft', offset: -5 }}
                            tickMargin={10}
                        />
                        <YAxis
                            label={{ value: 'Cumulative Cost ($)', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                            labelFormatter={(label) => `Year ${label}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line
                            type="monotone"
                            dataKey="withoutSolar"
                            name="Without Solar"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="withSolar"
                            name="With Solar"
                            stroke="#82ca9d"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};