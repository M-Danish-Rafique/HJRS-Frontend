import React, { useState } from 'react';
import { Search, Filter, BookOpen, Globe, Calendar, Building2 } from 'lucide-react';

const JournalGrid = ({ journals, handleSelectJournal}) => {
  // Helper functions
  const getCategoryStyle = (categoryLetter) => {
    switch (categoryLetter?.toUpperCase()) {
      case "W":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-200";
      case "X":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
      case "Y":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200";
      default:
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
    }
  };

  const formatSubcategories = (subcategories) => {
    if (!subcategories) return "Not Available";
    const categories = subcategories.split(";").map(cat => cat.trim()).filter(cat => cat);
    if (categories.length === 0) return "Not Available";
    if (categories.length === 1) return categories[0];
    return categories.join(" • ");
  };

  const getJPIColor = (jpi) => {
    const value = parseFloat(jpi);
    if (value >= 64) return "text-green-600 bg-green-50";
    if (value >= 25) return "text-blue-600 bg-blue-50";
    return "text-orange-600 bg-orange-50";
  };

  return (
    <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 gap-6">
      {journals.map((journal) => (
        <div
          key={journal.journal_id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 flex flex-col h-full"
          onClick={() => handleSelectJournal(journal)}
        >
          {/* Card Header */}
          <div className="p-6 pb-4 flex-grow">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryStyle(journal.category_letter)}`}>
                Category {journal.category_letter}
              </span>
              <div className={`px-2 py-1 rounded-md text-sm font-semibold ${getJPIColor(journal.jpi)}`}>
                JPI: {journal.jpi}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {journal.title}
            </h3>
            
            <p className="text-sm text-blue-600 font-medium mb-1">
              {journal.subject_area_name}
            </p>
            
            <p className="text-xs text-gray-500 line-clamp-2">
              {formatSubcategories(journal.subcategories)}
            </p>
          </div>

          {/* Card Body */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">ISSN</p>
                <p className="font-medium">{journal.issn || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">eISSN</p>
                <p className="font-medium">{journal.eissn || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Card Footer - This will stick to the bottom */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                {journal.country_name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {journal.range_val}
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs text-gray-600">
              <Building2 className="h-3 w-3 mr-1" />
              <span className="truncate">{journal.publisher_name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JournalGrid;