import { useState, useEffect } from 'react';
import { Search, Book, AlertCircle, Loader2, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'https://hjrs-backend-production.up.railway.app';

export default function FilteredJournalSearch() {
  const [filters, setFilters] = useState({
    country: [],
    year: [],
    category: [],
    subjectArea: [],
    subjectSubcategories: [],
    publisher: [],
    minJpi: '',
    maxJpi: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    years: [],
    categories: [],
    subjectAreas: [],
    subjectSubcategories: [],
    publishers: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    // Count active filters
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === 'minJpi' || key === 'maxJpi') {
        return value !== '' ? acc + 1 : acc;
      }
      return Array.isArray(value) && value.length > 0 ? acc + 1 : acc;
    }, 0);
    setActiveFiltersCount(count);
  }, [filters]);

  const loadFilterOptions = async () => {
    try {
      // Load filter options from your backend endpoints
      const [countriesRes, yearsRes, categoriesRes, subjectAreasRes, publishersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reference/countries`),
        fetch(`${API_BASE_URL}/api/reference/publishing-years`),
        fetch(`${API_BASE_URL}/api/reference/categories`),
        fetch(`${API_BASE_URL}/api/reference/subject-areas`),
        fetch(`${API_BASE_URL}/api/reference/publishers`)
      ]);

      setFilterOptions({
        countries: countriesRes.ok ? await countriesRes.json() : [],
        years: yearsRes.ok ? await yearsRes.json() : [],
        categories: categoriesRes.ok ? await categoriesRes.json() : [],
        subjectAreas: subjectAreasRes.ok ? await subjectAreasRes.json() : [],
        publishers: publishersRes.ok ? await publishersRes.json() : [],
        subjectSubcategories: [] // Will use same subject areas for subcategories
      });
    } catch (err) {
      console.error('Error loading filter options:', err);
      // Set default empty arrays on error
      setFilterOptions({
        countries: [],
        years: [],
        categories: [],
        subjectAreas: [],
        publishers: [],
        subjectSubcategories: []
      });
    }
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'minJpi' || filterName === 'maxJpi') {
      // Handle JPI range inputs (single values)
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    } else {
      // Handle multi-select filters - convert to string for consistency
      const stringValue = String(value);
      setFilters(prev => {
        const currentValues = prev[filterName] || [];
        const newValues = currentValues.includes(stringValue)
          ? currentValues.filter(v => v !== stringValue)
          : [...currentValues, stringValue];
        
        return {
          ...prev,
          [filterName]: newValues
        };
      });
    }

    // Set subcategories options to all subject areas since they refer to the same table
    if (filterName === 'subjectArea') {
      setFilterOptions(prev => ({
        ...prev,
        subjectSubcategories: prev.subjectAreas
      }));
    }
  };

  const loadSubcategories = async (subjectAreaId) => {
    // Since subcategories refer to the same SubjectArea table,
    // we'll use the already loaded subject areas
    setFilterOptions(prev => ({
      ...prev,
      subjectSubcategories: prev.subjectAreas
    })    );
  };

  const FilterInput = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );

  const ResultsPerPageSelector = () => (
    <div className="flex items-center space-x-2 text-sm">
      <span className="text-gray-700">Show:</span>
      <select
        value={resultsPerPage}
        onChange={(e) => {
          setResultsPerPage(Number(e.target.value));
          setCurrentPage(1);
          if (searchResults.length > 0) {
            handleSearch(1);
          }
        }}
        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
      <span className="text-gray-700">per page</span>
    </div>
  );

  const handleSearch = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    if (page === 1) {
      setSearchResults([]);
      setSelectedJournal(null);
    }

    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'minJpi' || key === 'maxJpi') {
          if (value !== '') {
            queryParams.append(key, value);
          }
        } else if (Array.isArray(value) && value.length > 0) {
          queryParams.append(key, value.join(','));
        }
      });

      // Add pagination parameters
      queryParams.append('page', page.toString());
      queryParams.append('limit', resultsPerPage.toString());

      const response = await fetch(
        `${API_BASE_URL}/api/journals/filtered-search?${queryParams}`,
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
      
      // Assuming backend returns { results: [...], total: number, page: number }
      setSearchResults(data.results || data);
      setTotalResults(data.total || data.length);
      setCurrentPage(page);
      
      if ((data.results || data).length === 0) {
        setError('No journals found matching your search criteria');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal);
  };

  const clearAllFilters = () => {
    setFilters({
      country: [],
      year: [],
      category: [],
      subjectArea: [],
      subjectSubcategories: [],
      publisher: [],
      minJpi: '',
      maxJpi: ''
    });
    setSearchResults([]);
    setSelectedJournal(null);
    setError(null);
    setCurrentPage(1);
    setTotalResults(0);
  };

  const FilterMultiSelect = ({ label, values, onChange, options, placeholder }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
              e.target.value = ""; // Reset select after selection
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">{placeholder}</option>
          {Array.isArray(options) && options.map((option) => (
            <option 
              key={option.country_id || option.year_id || option.category_id || option.subject_area_id || option.publisher_id} 
              value={option.country_id || option.year_id || option.category_id || option.subject_area_id || option.publisher_id}
              disabled={values.includes(option.country_id || option.year_id || option.category_id || option.subject_area_id || option.publisher_id)}
            >
              {option.country_name || option.range_val || option.category_letter || option.subject_area_name || option.publisher_name}
            </option>
          ))}
        </select>
        
        {/* Selected items display */}
        {values.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {values.map((value) => {
              const option = options.find(opt => {
                const optionId = opt.country_id || opt.year_id || opt.category_id || opt.subject_area_id || opt.publisher_id;
                return String(optionId) === String(value);
              });
              
              const displayName = option ? 
                (option.country_name || option.range_val || option.category_letter || option.subject_area_name || option.publisher_name) : 
                `Unknown (${value})`;
              
              return (
                <span
                  key={value}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {displayName}
                  <button
                    type="button"
                    onClick={() => onChange(value)}
                    className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSearch(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handleSearch(page) : null}
                disabled={page === '...' || page === currentPage || isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                } disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handleSearch(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
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
                <li><a href="/journal-lookup" className="text-blue-100 hover:text-white">Journal Lookup</a></li>
                <li><a href="/filtered-search" className="text-white font-medium">Advanced Search</a></li>
                <li><a href="/distribution-analysis" className="text-blue-100 hover:text-white">Distribution Analysis</a></li>
                <li><a href="/performance-prediction" className="text-blue-100 hover:text-white">Performance Prediction</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Filter className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-800">Advanced Journal Search</h2>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {isFiltersExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show Filters
                    </>
                  )}
                </button>
              </div>
            </div>

            {isFiltersExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                <FilterMultiSelect
                  label="Country"
                  values={filters.country}
                  onChange={(value) => handleFilterChange('country', value)}
                  options={filterOptions.countries}
                  placeholder="Select countries..."
                />

                <FilterMultiSelect
                  label="Year"
                  values={filters.year}
                  onChange={(value) => handleFilterChange('year', value)}
                  options={filterOptions.years}
                  placeholder="Select years..."
                />

                <FilterMultiSelect
                  label="Category"
                  values={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  options={filterOptions.categories}
                  placeholder="Select categories..."
                />

                <FilterMultiSelect
                  label="Subject Area"
                  values={filters.subjectArea}
                  onChange={(value) => handleFilterChange('subjectArea', value)}
                  options={filterOptions.subjectAreas}
                  placeholder="Select subject areas..."
                />

                <FilterMultiSelect
                  label="Subject Subcategories"
                  values={filters.subjectSubcategories}
                  onChange={(value) => handleFilterChange('subjectSubcategories', value)}
                  options={filterOptions.subjectSubcategories.length > 0 ? filterOptions.subjectSubcategories : filterOptions.subjectAreas}
                  placeholder="Select subcategories..."
                />

                <FilterMultiSelect
                  label="Publisher"
                  values={filters.publisher}
                  onChange={(value) => handleFilterChange('publisher', value)}
                  options={filterOptions.publishers}
                  placeholder="Select publishers..."
                />

                <FilterInput
                  label="Min JPI"
                  value={filters.minJpi}
                  onChange={(value) => handleFilterChange('minJpi', value)}
                  placeholder="Minimum JPI..."
                  type="number"
                />

                <FilterInput
                  label="Max JPI"
                  value={filters.maxJpi}
                  onChange={(value) => handleFilterChange('maxJpi', value)}
                  placeholder="Maximum JPI..."
                  type="number"
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => handleSearch(1)}
                disabled={isLoading || activeFiltersCount === 0}
                className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Search className="h-5 w-5 mr-2" />
                )}
                Search Journals
              </button>
            </div>
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
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">
                  Search Results ({totalResults.toLocaleString()} journal{totalResults !== 1 ? 's' : ''} found)
                </h3>
                <ResultsPerPageSelector />
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISSN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JPI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Area</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResults.map((journal) => (
                        <tr 
                          key={journal.journal_id} 
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectJournal(journal)}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-blue-600 hover:text-blue-800">
                            <div className="max-w-xs truncate">{journal.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.issn || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {journal.category_letter}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{journal.jpi || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate">{journal.subject_area_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.country_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{journal.range_val}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate">{journal.publisher_name}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                <PaginationControls />
              </div>
            </div>
          )}

          {/* Selected Journal Details */}
          {selectedJournal && (
            <div className="bg-white rounded-lg shadow-lg p-6">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Journal Performance Index (JPI)</p>
                      <p className="font-medium text-lg text-blue-600">{selectedJournal.jpi || 'Not Available'}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Subject Area</p>
                      <p className="font-medium">{selectedJournal.subject_area_name}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Country</p>
                      <p className="font-medium">{selectedJournal.country_name || 'Not Available'}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Publisher</p>
                      <p className="font-medium">{selectedJournal.publisher_name}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Year</p>
                      <p className="font-medium">{selectedJournal.range_val}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Subject Subcategories</p>
                      <p className="font-medium">{selectedJournal.subcategories || 'Not Available'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}