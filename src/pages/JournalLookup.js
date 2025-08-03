import { useState, useEffect } from 'react';
import { Search, Book, AlertCircle, Loader2, X } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'https://hjrs-backend-production.up.railway.app';

export default function JournalLookup() {
  console.log('JournalLookup component rendering');
  
  const [searchType, setSearchType] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);

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
      console.log('Search response:', response);
      if (!response.ok) {
        console.log('Search response:', response);
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        console.log('No journals found matching your search criteria');
        setError('No journals found matching your search criteria');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJournal = async (journal) => {
    setIsLoading(true);
    try {
      setSelectedJournal(journal);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 py-6 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Book className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">HEC Journal Recognition System</h1>
            </div>
            <nav>
              <ul className="flex space-x-6">
                <li><a href="/journal-lookup" className="text-white font-medium">Journal Lookup</a></li>
                <li><a href="/filtered-search" className="text-blue-100 hover:text-white">Advanced Search</a></li>
                <li><a href="/distribution-analysis" className="text-blue-100 hover:text-white">Distribution Analysis</a></li>
                <li><a href="/performance-prediction" className="text-blue-100 hover:text-white">Performance Prediction</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Journal Lookup</h2>
            
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
              
              <div>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="title">Title</option>
                  <option value="issn">ISSN</option>
                  <option value="eissn">eISSN</option>
                </select>
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

            {/* Search Results */}
            {searchResults.length > 0 && !selectedJournal && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Search Results</h3>
                {/* Table with horizontal scroll */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISSN</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Area</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {searchResults.map((journal) => (
                          <tr 
                            key={journal.journal_id} 
                            className="hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleSelectJournal(journal)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{journal.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.issn || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {journal.category_letter}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.subject_area_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.range_val}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.publisher_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Journal Details */}
            {selectedJournal && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Journal Details</h3>
                  <button 
                    onClick={() => setSelectedJournal(null)} 
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Back to results
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedJournal.title}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">ISSN</p>
                        <p className="font-medium">{selectedJournal.issn || 'Not Available'}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">eISSN</p>
                        <p className="font-medium">{selectedJournal.eissn || 'Not Available'}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="font-medium">
                          <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                            Category {selectedJournal.category_letter}
                          </span>
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Journal Performance Index (JPI)</p>
                        <p className="font-medium">{selectedJournal.jpi || 'Not Available'}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Subject Subcategories</p>
                        <p className="font-medium">{selectedJournal.subcategories}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Subject Area</p>
                        <p className="font-medium">{selectedJournal.subject_area_name}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Publisher</p>
                        <p className="font-medium">{selectedJournal.publisher_name}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Country</p>
                        <p className="font-medium">{selectedJournal.country_name || 'Not Available'}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Year</p>
                        <p className="font-medium">{selectedJournal.range_val}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}