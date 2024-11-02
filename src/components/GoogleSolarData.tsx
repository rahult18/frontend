import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sun, Leaf, DollarSign, Battery } from 'lucide-react';

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

interface SolarPanel {
    center: LatLng;
    orientation: 'LANDSCAPE' | 'PORTRAIT';
    yearlyEnergyDcKwh: number;
    segmentIndex: number;
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
            } catch (err) {
                setError('Error fetching solar data. Please try again.');
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

    // Prepare data for roof segment chart
    const roofSegmentData = roofSegmentStats.map((segment, index) => ({
        name: `Segment ${index + 1}`,
        area: segment.stats.areaMeters2,
        sunshine: segment.stats.sunshineQuantiles[5],
    }));

    // Prepare data for solar panel configurations chart
    const panelConfigData = solarPanelConfigs.map((config, index) => ({
        name: `Config ${index + 1}`,
        panels: config.panelsCount,
        energy: config.yearlyEnergyDcKwh,
    }));

    // Define colors for the charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            {/* Building Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Building Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <p className="text-lg font-semibold">Building Information</p>
                            <p>Name: {buildingInsights.name}</p>
                            <p>Postal Code: {buildingInsights.postalCode}</p>
                            <p>Administrative Area: {buildingInsights.administrativeArea}</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">Solar Potential</p>
                            <p>Max Panel Count: {solarPotential.maxArrayPanelsCount}</p>
                            <p>Max Array Area: {solarPotential.maxArrayAreaMeters2.toFixed(2)} m²</p>
                            <p>Max Sunshine Hours/Year: {solarPotential.maxSunshineHoursPerYear}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Roof Segment Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            
            <Card>
                <CardHeader className='w-full'>
                    <CardTitle>Roof Segment Analysis</CardTitle>
                    <CardDescription>
                        Total Roof Area: {totalRoofArea.toFixed(2)} m² | Total Sunshine Hours: {totalSunshineHours.toFixed(2)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={roofSegmentData} width={650} height={300} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="area" fill="#8884d8" name="Area (m²)" />
                            <Bar dataKey="sunshine" fill="#82ca9d" name="Sunshine Hours" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Solar Panel Configurations */}
            <Card>
                <CardHeader className='w-full'>
                    <CardTitle>Solar Panel Configurations</CardTitle>
                    <CardDescription>
                        Best Configuration: {bestPanelConfig.panelsCount} panels | Energy: {bestPanelConfig.yearlyEnergyDcKwh.toFixed(2)} kWh/year
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={panelConfigData} width={650} height={300} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="panels" fill="#8884d8" name="Panels" />
                            <Bar dataKey="energy" fill="#82ca9d" name="Energy (kWh/year)" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            </div>
            {/* Financial Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Financial Analysis</CardTitle>
                    <CardDescription>
                        Best Savings (Year 20): {bestFinancialAnalysis.cashPurchaseSavings?.savings?.savingsYear20?.currencyCode}{' '}
                        {bestFinancialAnalysis.cashPurchaseSavings?.savings?.savingsYear20?.units.toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {financialAnalyses.map((analysis, index) => (
                            <div key={index}>
                                <p className="text-lg font-semibold">Analysis {index + 1}</p>
                                <p>Monthly Bill: {analysis.monthlyBill.currencyCode} {analysis.monthlyBill.units}</p>
                                {analysis.financialDetails && (
                                    <div className="mt-2">
                                        <p>Initial AC kWh/Year: {analysis.financialDetails.initialAcKwhPerYear.toFixed(2)}</p>
                                        <p>
                                            Remaining Lifetime Utility Bill: {analysis.financialDetails.remainingLifetimeUtilityBill.currencyCode}{' '}
                                            {analysis.financialDetails.remainingLifetimeUtilityBill.units}
                                        </p>
                                        <p>
                                            Federal Incentive: {analysis.financialDetails.federalIncentive.currencyCode}{' '}
                                            {analysis.financialDetails.federalIncentive.units}
                                        </p>
                                        <p>Solar Percentage: {analysis.financialDetails.solarPercentage.toFixed(2)}%</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default GoogleSolarApi;