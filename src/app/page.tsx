'use client';

import React, { useState } from 'react';
import { Sun } from 'lucide-react';
import AddressSearch from '../components/AddressSearch';
import SolarDashboard from "../components/SolarDashboard";

const App: React.FC = () => {
  const [address, setAddress] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAddressSubmit = (searchAddress: string) => {
    setAddress(searchAddress);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {!showDashboard ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Sun className="h-16 w-16 text-yellow-500 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Solar Savings Insights
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Discover your home's solar potential and estimated savings with our advanced solar calculator
            </p>
          </div>
          <AddressSearch onSubmit={handleAddressSubmit} />
        </div>
      ) : (
        <SolarDashboard address={address} />
      )}
    </div>
  );
};

export default App;