import { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle, Loader2, X } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';
import JournalDetails from '../components/JournalDetails';
import Navbar from '../components/Navbar';
import CompactJournalCard from '../components/CompactJournalCard';
import JournalGrid from '../components/JournalGrid';

const API_BASE_URL = 'https://hjrs-backend-production.up.railway.app';

export default function JournalLookup() {
  console.log('JournalLookup component rendering');
  
  const [searchType, setSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    console.log('Component mounted');
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedJournal(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/journals/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data);
      setTotalResults(data.total || data.length);

      if (data.length === 0) {
        setError('No journals found matching your search criteria');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJournal = useCallback((journal) => {
    setSelectedJournal(journal);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedJournal(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="/journal-lookup" />

      {/* Main Content */}
      <main className="container mx-auto p-2 sm:px-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 mr-2 text-blue-600" />
              Journal Lookup
            </h2>
            {/* Search Form */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Search by ${searchType}...`}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-48">
                <CustomDropdown
                  value={searchType}
                  onChange={setSearchType}
                  options={[
                    { value: "title", label: "Title" },
                    { value: "issn", label: "ISSN" },
                    { value: "eissn", label: "eISSN" },
                  ]}
                  placeholder="Select search type..."
                  required="true"
                />
              </div>

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Search className="h-5 w-5 mr-2" />
                )}
                Search
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}
          </div>
          {/* Search Results */}
          {searchResults.length > 0 && !selectedJournal && (
            <div className="bg-white border-gray-200 rounded-xl shadow-xl p-4 sm:p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 gap-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Search Results ({totalResults.toLocaleString()} journal
                  {totalResults !== 1 ? "s" : ""} found)
                </h3>
              </div>
              {/* Mobile Card View (< 640px) */}
              <CompactJournalCard searchResults={searchResults} handleSelectJournal={handleSelectJournal}/>

              {/* Tablet View and Desktop View (>= 640px) */}
              <JournalGrid journals={searchResults} handleSelectJournal={handleSelectJournal}/>
            </div>
          )}
          {/* Selected Journal Details */}
          {selectedJournal && (
            <JournalDetails
              journal={selectedJournal}
              onBack={() => setSelectedJournal(null)}
              variant="default"
            />
          )}

        </div>
      </main>
    </div>
  );
};