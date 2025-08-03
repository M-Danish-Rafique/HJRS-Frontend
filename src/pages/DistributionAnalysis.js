import { useState, useEffect } from 'react';
import { 
  BarChart, LineChart, PieChart, Map, Globe, Filter, 
  AlertCircle, Loader2, RefreshCw, ChevronDown, Book 
} from 'lucide-react';
import CountryDistribution from '../components/CountryDistribution';
import CategoryDistribution from '../components/CategoryDistribution';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' 
  : 'https://hjrs-backend-production.up.railway.app';

export default function DistributionAnalysis() {
  const [activeTab, setActiveTab] = useState('country');
  const [countryData, setCountryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');  
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  
  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (activeTab === 'country') {
      fetchCountryData();
    } else {
      fetchCategoryData();
      fetchPublishingYearData();
    }
  }, [activeTab, selectedYear, selectedCategory, selectedCountry]);

  const fetchFilters = async () => {
    try {
      const [yearsResponse, categoriesResponse, countriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reference/publishing-years`, { 
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }),
        fetch(`${API_BASE_URL}/api/reference/categories`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }),
        fetch(`${API_BASE_URL}/api/reference/countries`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
      ]);

      if (!yearsResponse.ok || !categoriesResponse.ok || !countriesResponse.ok) {
        throw new Error('Failed to fetch filters');
      }

      const yearsData = await yearsResponse.json();
      const categoriesData = await categoriesResponse.json();
      const countriesData = await countriesResponse.json();

      // Ensure that years and categories are arrays before setting state
      setYears(Array.isArray(yearsData) ? yearsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setCountries(Array.isArray(countriesData) ? countriesData : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCountryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analysis/country?year=${selectedYear}&category=${selectedCategory}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch country distribution data');
      }
      
      const data = await response.json();
      setCountryData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analysis/category?year=${selectedYear}&country=${selectedCountry}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch category distribution data');
      }
      
      const data = await response.json();
      setCategoryData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPublishingYearData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analysis/publishing-year?country=${selectedCountry}`,
        {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch category distribution data over years');
      }
      
      const data = await response.json();
      setYearData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    if (activeTab === 'country') {
      fetchCountryData();
    } else {
      fetchCategoryData();
      fetchPublishingYearData();
    }
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
                <li><a href="/filtered-search" className="text-blue-100 hover:text-white">Advanced Search</a></li>
                <li><a href="/distribution-analysis" className="text-white font-medium">Distribution Analysis</a></li>
                <li><a href="/performance-prediction" className="text-blue-100 hover:text-white">Performance Prediction</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Journal Distribution Analysis</h2>
              <button 
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Data
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`flex items-center py-2 px-4 ${
                  activeTab === 'country'
                    ? 'text-blue-600 border-b-2 border-blue-500 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('country')}
              >
                <Globe className="h-5 w-5 mr-2" />
                By Country
              </button>
              <button
                className={`flex items-center py-2 px-4 ${
                  activeTab === 'category'
                    ? 'text-blue-600 border-b-2 border-blue-500 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('category')}
              >
                <PieChart className="h-5 w-5 mr-2" />
                By Category
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Publishing Year
                </label>
                <select
                  id="year-filter"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="all">All Years</option>
                  {Array.isArray(years) && years.map(year => (
                    <option key={year.year_id} value={year.year_id}>
                      {year.range_val}
                    </option>
                  ))}
                </select>
              </div>
              
              {activeTab === 'country' && (
                <div>
                  <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Categories</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        Category {category.category_letter}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab !== 'country' && (
                <div>
                  <label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country-filter"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Countries</option>
                    {Array.isArray(countries) && countries.map(country => (
                      <option key={country.country_id} value={country.country_id}>
                        {country.country_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            )}

            {/* Content based on active tab */}
            {!isLoading && !error && (
              <>
                {activeTab === 'country' && Array.isArray(countryData) && countryData.length > 0 && (
                  <CountryDistribution data={countryData} />
                )}
                
                {activeTab === 'category' && Array.isArray(categoryData) && categoryData.length > 0 && (
                  <CategoryDistribution categoryData={categoryData} countryData={countryData} yearData={yearData}/>
                )}
                
                {((activeTab === 'country' && (!Array.isArray(countryData) || countryData.length === 0)) || 
                  (activeTab === 'category' && (!Array.isArray(categoryData) || categoryData.length === 0))) && !isLoading && (
                  <div className="text-center py-12 text-gray-500">
                    No data available for the selected filters
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}