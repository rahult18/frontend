'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface AddressSearchProps {
  onSubmit: (address: string) => void;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onSubmit }) => {
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError('Please enter an address');
      return;
    }
    setError('');
    onSubmit(searchInput);
  };

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter your address"
          className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none shadow-lg pr-16"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default AddressSearch;