import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sun, Home, Battery, PiggyBank, BarChart2, TrendingUp, DollarSign, Percent, Zap } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { SavingsChart } from './SavingsChart';

interface LatLng {
    latitude: number;
    longitude: number;
}

interface Date {
    year: number;
    month: number;
    day: number;
}

interface SizeAndSunshineStats {
    areaMeters2: number;
    sunshineQuantiles: number[];
    groundAreaMeters2: number;
}

interface RoofSegmentSizeAndSunshineStats {
    pitchDegrees: number;
    azimuthDegrees: number;
    stats: SizeAndSunshineStats;
    center: LatLng;
    boundingBox: {
        sw: LatLng;
        ne: LatLng;
    };
    planeHeightAtCenterMeters: number;
}

interface SolarPanelConfig {
    panelsCount: number;
    yearlyEnergyDcKwh: number;
    roofSegmentSummaries: {
        pitchDegrees: number;
        azimuthDegrees: number;
        panelsCount: number;
        yearlyEnergyDcKwh: number;
        segmentIndex: number;
    }[];
}

interface FinancialAnalysis {
    monthlyBill: {
        currencyCode: string;
        units: string;
    };
    panelConfigIndex: number;
    financialDetails?: {
        initialAcKwhPerYear: number;
        remainingLifetimeUtilityBill: {
            currencyCode: string;
            units: string;
        };
        federalIncentive: {
            currencyCode: string;
            units: string;
        };
        solarPercentage: number;
        percentageExportedToGrid: number;
    };
}

interface BuildingInsightsResponse {
    name: string;
    center: LatLng;
    imageryDate: Date;
    postalCode: string;
    administrativeArea: string;
    statisticalArea: string;
    regionCode: string;
    solarPotential: {
        maxArrayPanelsCount: number;
        maxArrayAreaMeters2: number;
        maxSunshineHoursPerYear: number;
        carbonOffsetFactorKgPerMwh: number;
        panelCapacityWatts: number;
        panelHeightMeters: number;
        panelWidthMeters: number;
        panelLifetimeYears: number;
        wholeRoofStats: SizeAndSunshineStats;
        roofSegmentStats: RoofSegmentSizeAndSunshineStats[];
        solarPanelConfigs: SolarPanelConfig[];
        financialAnalyses: FinancialAnalysis[];
    };
    imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
    imageryProcessedDate: Date;
}

interface FinancialAnalysis {
    monthlyBill: {
        currencyCode: string;
        units: string;
    };
    panelConfigIndex: number;
    financialDetails?: {
        initialAcKwhPerYear: number;
        remainingLifetimeUtilityBill: {
            currencyCode: string;
            units: string;
        };
        federalIncentive: {
            currencyCode: string;
            units: string;
        };
        solarPercentage: number;
        percentageExportedToGrid: number;
    };
    cashPurchaseSavings?: {
        savings?: {
            savingsYear20?: {
                currencyCode: string;
                units: number;
            };
        };
    };
}

interface GoogleSolarApiProps {
    latitude: number;
    longitude: number;
}

const GoogleSolarApi: React.FC<GoogleSolarApiProps> = ({ latitude, longitude }) => {
    const [buildingInsights, setBuildingInsights] = useState<BuildingInsightsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBuildingInsights = async () => {
            try {
                const API_KEY = "AIzaSyCqnkVJrdMYcAKP9zMUXTMossg4WLlNlkk";
                const response = await fetch(
                    `https://solar.googleapis.com/v1/buildingInsights:findClosest?key=${API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch solar data');
                }

                const data: BuildingInsightsResponse = await response.json();
                setBuildingInsights(data);
            } catch (error) {
                setError('Error fetching solar data. Please try again. ' + error);
            } finally {
                setLoading(false);
            }
        };

        fetchBuildingInsights();
    }, [latitude, longitude]);

    if (loading) {
        return <div>Loading solar data...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!buildingInsights) {
        return <div>No solar data available.</div>;
    }

    const { solarPotential } = buildingInsights;
    const { roofSegmentStats, solarPanelConfigs, financialAnalyses } = solarPotential;

    // Calculate total roof area and total sunshine
    const totalRoofArea = roofSegmentStats.reduce((sum, segment) => sum + segment.stats.areaMeters2, 0);
    const totalSunshineHours = roofSegmentStats.reduce((sum, segment) => sum + segment.stats.sunshineQuantiles[5], 0);

    // Find the best solar panel configuration
    const bestPanelConfig = solarPanelConfigs.reduce((best, config) => {
        return config.yearlyEnergyDcKwh > best.yearlyEnergyDcKwh ? config : best;
    }, solarPanelConfigs[0]);

    // Find the best financial analysis
    const bestFinancialAnalysis = financialAnalyses.reduce((best, analysis) => {
        const savingsYear20 = analysis.cashPurchaseSavings?.savings?.savingsYear20?.units || 0;
        const bestSavingsYear20 = best.cashPurchaseSavings?.savings?.savingsYear20?.units || 0;
        return savingsYear20 > bestSavingsYear20 ? analysis : best;
    }, financialAnalyses[0]);


    const roofSegmentData = roofSegmentStats.map((segment, index) => ({
        name: `Segment ${index + 1}`,
        value: segment.stats.areaMeters2,
        pitchDegrees: segment.pitchDegrees,
        azimuthDegrees: segment.azimuthDegrees,
    }));

    // Prepare data for solar panel configurations chart
    const panelConfigData = solarPanelConfigs.map((config, index) => ({
        name: `Config ${index + 1}`,
        panels: config.panelsCount,
        energy: config.yearlyEnergyDcKwh,
    }));

    // Define colors for the charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

    const monthlyBill = 150; // Example monthly electricity bill
    const solarSavings = 30000; // Example total savings over 20 years
    const installationCost = 15000; // Example installation cost

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BarChart2 className="mr-2" size={24} /> Overall Solar Potential
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="font-semibold">Max Panel Count</p>
                                <p className="text-2xl">{solarPotential.maxArrayPanelsCount}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Max Array Area</p>
                                <p className="text-2xl">{solarPotential.maxArrayAreaMeters2.toFixed(2)} m²</p>
                            </div>
                            <div>
                                <p className="font-semibold">Max Sunshine Hours/Year</p>
                                <p className="text-2xl">{solarPotential.maxSunshineHoursPerYear}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Home className="mr-2" size={24} /> Building Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>{buildingInsights.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Postal Code</TableCell>
                                    <TableCell>{buildingInsights.postalCode}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Administrative Area</TableCell>
                                    <TableCell>{buildingInsights.administrativeArea}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Max Panel Count</TableCell>
                                    <TableCell>{solarPotential.maxArrayPanelsCount}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Max Array Area</TableCell>
                                    <TableCell>{solarPotential.maxArrayAreaMeters2.toFixed(2)} m²</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Max Sunshine Hours/Year</TableCell>
                                    <TableCell>{solarPotential.maxSunshineHoursPerYear}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='w-full'>
                        <CardTitle className="flex items-center">
                            <Sun className="mr-2" size={24} /> Roof Segment Analysis
                        </CardTitle>
                        <CardDescription>
                            Total Roof Area: {totalRoofArea.toFixed(2)} m² | Total Sunshine Hours: {totalSunshineHours.toFixed(2)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart width={650} height={300}>
                                <Pie
                                    data={roofSegmentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    innerRadius={0}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {roofSegmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='w-full'>
                        <CardTitle className="flex items-center">
                            <Battery className="mr-2" size={24} /> Solar Panel Configuration
                        </CardTitle>
                        <CardDescription>
                            Best Configuration: {bestPanelConfig.panelsCount} panels | Energy: {bestPanelConfig.yearlyEnergyDcKwh.toFixed(2)} kWh/year
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={panelConfigData} height={300} width={650}>
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                <Tooltip />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar yAxisId="left" dataKey="panels" fill="#8884d8" name="Panels" />
                                <Bar yAxisId="right" dataKey="energy" fill="#82ca9d" name="Energy (kWh/year)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PiggyBank className="mr-2" size={24} /> Best Financial Analysis
                        </CardTitle>
                        <CardDescription>
                            Best Savings (Year 20): {bestFinancialAnalysis.cashPurchaseSavings?.savings?.savingsYear20?.currencyCode}{' '}
                            {bestFinancialAnalysis.cashPurchaseSavings?.savings?.savingsYear20?.units.toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="flex items-center">
                                        <DollarSign className="mr-2" size={16} /> Monthly Bill
                                    </TableCell>
                                    <TableCell>
                                        {bestFinancialAnalysis.monthlyBill.currencyCode} {bestFinancialAnalysis.monthlyBill.units}
                                    </TableCell>
                                </TableRow>
                                {bestFinancialAnalysis.financialDetails && (
                                    <>
                                        <TableRow>
                                            <TableCell className="flex items-center">
                                                <Zap className="mr-2" size={16} /> Initial AC kWh/Year
                                            </TableCell>
                                            <TableCell>{bestFinancialAnalysis.financialDetails.initialAcKwhPerYear.toFixed(2)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="flex items-center">
                                                <TrendingUp className="mr-2" size={16} /> Remaining Lifetime Utility Bill
                                            </TableCell>
                                            <TableCell>
                                                {bestFinancialAnalysis.financialDetails.remainingLifetimeUtilityBill.currencyCode}{' '}
                                                {bestFinancialAnalysis.financialDetails.remainingLifetimeUtilityBill.units}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="flex items-center">
                                                <DollarSign className="mr-2" size={16} /> Federal Incentive
                                            </TableCell>
                                            <TableCell>
                                                {bestFinancialAnalysis.financialDetails.federalIncentive.currencyCode}{' '}
                                                {bestFinancialAnalysis.financialDetails.federalIncentive.units}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="flex items-center">
                                                <Percent className="mr-2" size={16} /> Solar Percentage
                                            </TableCell>
                                            <TableCell>{bestFinancialAnalysis.financialDetails.solarPercentage.toFixed(2)}%</TableCell>
                                        </TableRow>
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <SavingsChart
                monthlyBill={monthlyBill}
                solarSavings={solarSavings}
                installationCost={installationCost}
            />
        </div>
    );
};

export default GoogleSolarApi;