'use client';

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Sun, Battery, DollarSign, Leaf } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GoogleSolarApi from "./GoogleSolarData";
import Marketplace from "../components/marketplace";

// Simple type definitions
type SolarData = {
    outputs: {
        ac_monthly: number[];
        dc_monthly: number[];
        ac_annual: number;
        solrad_monthly: number[];
        solrad_annual: number;
        capacity_factor: number;
    };
    inputs: {
        system_capacity: string;
        losses: string;
        array_type: string;
        module_type: string;
        tilt: string;
        azimuth: string;
    };
}

interface SolarIrradianceProps {
    address: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ELECTRICITY_RATE = 0.17; // Average US electricity rate per kWh
const SOLAR_PANEL_COST = 3; // Average cost per watt installed

export default function SolarIrradiance({ address }: SolarIrradianceProps) {
    const [solarData, setSolarData] = useState<SolarData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

    const fetchSolarData = async (latitude: number, longitude: number) => {
        const apiKey = 'Rm07DjB9wgUdsizKMJotFDf61Z71KIlzQAknL81r';
        const baseUrl = 'https://developer.nrel.gov/api/pvwatts/v8.json';
        try {
            const params = new URLSearchParams({
                api_key: apiKey,
                lat: latitude.toFixed(4),
                lon: longitude.toFixed(4),
                system_capacity: '4',
                azimuth: '180',
                tilt: '20',
                array_type: '1',
                module_type: '0',
                losses: '14'
            });
            const response = await fetch(`${baseUrl}?${params}`);
            if (response.ok) {
                const data = await response.json();
                setSolarData(data);
            } else {
                throw new Error("Couldn't fetch the data");
            }
        } catch (error) {
            console.error("Error while fetching solar data:", error);
            setError("Failed to fetch solar data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const getCoordinates = async () => {
            setIsLoading(true);
            try {
                const result = await geocodeAddress(address);
                if (result) {
                    setCoordinates(result);
                } else {
                    throw new Error("Couldn't fetch the coordinates");
                }
            } catch (error) {
                console.error("Error while fetching the coordinates: ", error);
                setError("Failed to fetch coordinates");
                setIsLoading(false);
            }
        };
        getCoordinates();
    }, [address]);

    useEffect(() => {
        if (coordinates) {
            fetchSolarData(coordinates[0], coordinates[1]);
        }
    }, [coordinates]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading Data...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
    }

    if (!solarData) {
        return <div className="flex items-center justify-center h-screen">No data available</div>;
    }

    const annualProduction = solarData.outputs.ac_annual;
    const annualSavings = annualProduction * ELECTRICITY_RATE;
    const systemCost = Number(solarData.inputs.system_capacity) * 1000 * SOLAR_PANEL_COST;
    const paybackPeriod = systemCost / annualSavings;
    const co2Reduction = annualProduction * 0.85;

    return (
        <div className="p-6 space-y-6">

            {/* Rate Information */}
            <Alert className="max-w-4xl mx-auto mb-8">
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                    <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <span className="font-medium text-blue-500">Address:</span>
                                <p className="text-sm text-blue-500">
                                    {address}
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Average USA Electricity Rate:</span>
                                <p className="text-sm text-muted-foreground">
                                    ${ELECTRICITY_RATE.toFixed(2)} per kWh
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Solar Panel Cost:</span>
                                <p className="text-sm text-muted-foreground">
                                    ${SOLAR_PANEL_COST.toFixed(2)} per watt installed
                                </p>
                            </div>

                        </div>
                    </div>
                </AlertDescription>
            </Alert>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-5xl lg:text-3xl">
                    Market Place
                </h1>
                <Marketplace />
                <MetricCard
                    icon={<Sun className="h-6 w-6 text-yellow-500" />}
                    title="Annual Production"
                    value={`${Math.round(annualProduction).toLocaleString()} kWh`}
                    description="Yearly energy generated"
                />
                <MetricCard
                    icon={<DollarSign className="h-6 w-6 text-green-500" />}
                    title="Annual Savings"
                    value={`$${Math.round(annualSavings).toLocaleString()}`}
                    description="Estimated cost savings"
                />
                <MetricCard
                    icon={<Battery className="h-6 w-6 text-blue-500" />}
                    title="Payback Period"
                    value={`${paybackPeriod.toFixed(1)} years`}
                    description="Investment recovery time"
                />
                <MetricCard
                    icon={<Leaf className="h-6 w-6 text-green-600" />}
                    title="CO2 Reduction"
                    value={`${Math.round(co2Reduction).toLocaleString()} kg`}
                    description="Annual carbon offset"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MonthlyProductionChart data={solarData} />
                <SolarRadiationChart data={solarData} />
                <EfficiencyChart data={solarData} />
                <MonthlyComparisonChart data={solarData} />
            </div>

            <div className="mt-6 mb-4">
                {coordinates && (
                    <GoogleSolarApi latitude={coordinates[0]} longitude={coordinates[1]} />
                )}
            </div>
        </div>
    );
}

const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
        console.log("Address from params:" + address);
        const encodedAddress = encodeURIComponent(address);
        const GEOCODE_API_KEY = "6726743915073041757636gkw9e180b";
        const response = await fetch(`https://geocode.maps.co/search?q=${encodedAddress}&api_key=${GEOCODE_API_KEY}`);
        const data = await response.json();
        console.log("data: ", data);

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            console.log(`Extracted coordinates: lat=${lat}, lon=${lon}`);
            return [parseFloat(lat), parseFloat(lon)];
        }
        console.log("No coordinates found in the response");
        return null;
    } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
    }
};

type MetricCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
}

const MetricCard = ({ icon, title, value, description }: MetricCardProps) => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
                {icon}
                <div>
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);


const MonthlyProductionChart = ({ data }: { data: SolarData }) => {
    const chartData = data.outputs.ac_monthly.map((value, index) => ({
        month: MONTHS[index],
        production: Math.round(value)
    }));

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Monthly AC System Output</CardTitle>
                <CardDescription className="mb-5">Energy production by month (kWhac)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} width={650} height={300} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', offset: -5 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="production" fill="#8884d8" name="Monthly Production" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const SolarRadiationChart = ({ data }: { data: SolarData }) => {
    const chartData = data.outputs.solrad_monthly.map((value, index) => ({
        month: MONTHS[index],
        radiation: Math.round(value * 100) / 100
    }));

    return (
        <Card>
            <CardHeader className="w-full">
                <CardTitle>Solar Radiation Trend</CardTitle>
                <CardDescription className="mb-5">Daily solar radiation by month (kWh/m²/day)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} width={650} height={300} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Solar Radiation', angle: -90, position: 'insideLeft', offset: -5 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="radiation" stroke="#FF8042" name="Solar Radiation" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const EfficiencyChart = ({ data }: { data: SolarData }) => {
    const chartData = data.outputs.ac_monthly.map((ac, index) => ({
        month: MONTHS[index],
        efficiency: Math.round((ac / data.outputs.dc_monthly[index]) * 100)
    }));

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>System Efficiency</CardTitle>
                <CardDescription className="mb-5">AC/DC conversion efficiency by month (%)</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} width={650} height={300} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <XAxis dataKey="month" />
                        <YAxis
                            domain={[80, 100]}
                            label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft', offset: -5 }}
                        />
                        <Tooltip />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="efficiency" stroke="#82ca9d" name="System Efficiency" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

const MonthlyComparisonChart = ({ data }: { data: SolarData }) => {
    const chartData = data.outputs.ac_monthly.map((ac, index) => ({
        month: MONTHS[index],
        ac: Math.round(ac),
        dc: Math.round(data.outputs.dc_monthly[index])
    }));

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>AC vs DC Production</CardTitle>
                <CardDescription className="mb-5">Monthly comparison of AC and DC output</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} width={650} height={300} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft', offset: -5 }} />
                        <Tooltip />
                        <Legend />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="dc" fill="#82ca9d" name="DC Output" />
                        <Bar dataKey="ac" fill="#8884d8" name="AC Output" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};