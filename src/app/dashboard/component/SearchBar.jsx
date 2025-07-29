// components/SearchBar.js
import React from 'react';

export default function SearchBar({ searchTerm, setSearchTerm, handleSearch, onAddClick }) {
  return (
    <div className="flex items-center mb-6">
      <div className="relative flex-grow mr-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          className="w-full py-3 pl-10 pr-4 bg-white border-0 rounded-lg"
          placeholder="ຄົ້ນຫາສາມະຊິກ" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      <button 
        className="py-3 px-4 bg-[#0D9488] text-white font-medium rounded-lg ml-auto cursor-pointer"
        onClick={handleSearch}
      >
        ຕົກລົງ
      </button>
      <button 
        className="py-3 px-8 bg-[#65A30D] text-white font-medium rounded-lg ml-4 cursor-pointer"
        onClick={onAddClick}
      >
        + ເພີ່ມ
      </button>
    </div>
  );
}