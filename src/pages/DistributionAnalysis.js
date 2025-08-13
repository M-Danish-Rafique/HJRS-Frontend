import { useState, useEffect } from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  Map,
  Globe,
  Filter,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import CountryDistribution from "../components/CountryDistribution";
import CategoryDistribution from "../components/CategoryDistribution";
import CustomDropdown from "../components/CustomDropdown";
import Navbar from "../components/Navbar";

const API_BASE_URL = "https://hjrs-backend-production.up.railway.app";

export default function DistributionAnalysis() {
  const [activeTab, setActiveTab] = useState("country");
  const [countryData, setCountryData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("all");

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (activeTab === "country") {
      fetchCountryData();
    } else {
      fetchCategoryData();
      fetchPublishingYearData();
    }
  }, [activeTab, selectedYear, selectedCategory, selectedCountry]);

  const fetchFilters = async () => {
    try {
      const [yearsResponse, categoriesResponse, countriesResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/reference/publishing-years`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/reference/categories`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/reference/countries`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
        ]);

      if (
        !yearsResponse.ok ||
        !categoriesResponse.ok ||
        !countriesResponse.ok
      ) {
        throw new Error("Failed to fetch filters");
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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch country distribution data");
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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch category distribution data");
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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch category distribution data over years"
        );
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
    if (activeTab === "country") {
      fetchCountryData();
    } else {
      fetchCategoryData();
      fetchPublishingYearData();
    }
  };

  // Helper function to get category letter from category_id
  const getCategoryLetter = (categoryId) => {
    if (categoryId === "all") return "All";
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.category_letter : "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="/distribution-analysis" />

      {/* Main Content */}
      <main className="container mx-auto p-2 sm:px-4 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-0 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center sm:mt-0 mb-6 gap-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
                Journal Distribution Analysis
              </h2>{" "}
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center justify-end text-sm text-blue-600 hover:text-blue-800"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh Data
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
              <button
                className={`flex items-center py-2 px-2 sm:px-4 whitespace-nowrap ${
                  activeTab === "country"
                    ? "text-blue-600 border-b-2 border-blue-500 font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("country")}
              >
                <Globe className="h-5 w-5 mr-2" />
                  <span className="text-base">By Country</span>
              </button>

              <button
                className={`flex items-center py-2 px-2 sm:px-4 whitespace-nowrap ${
                  activeTab === "category"
                    ? "text-blue-600 border-b-2 border-blue-500 font-medium"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("category")}
              >
                <PieChart className="h-5 w-5 mr-2" />
                <span className="text-base">By Category</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
              <div className="w-full sm:w-48 min-w-48">
                <CustomDropdown
                  label="Publishing Year"
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={[
                    { value: "all", label: "All Years" },
                    ...(Array.isArray(years)
                      ? years.map((year) => ({
                          value: year.year_id,
                          label: year.range_val,
                        }))
                      : []),
                  ]}
                  placeholder="Select year..."
                  padding="px-3 py-2 sm:px-4 sm:py-3"
                  textSize="text-base"
                />
              </div>

              {activeTab === "country" && (
                <div className="w-full sm:w-48 min-w-48">
                  <CustomDropdown
                    label="Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={[
                      { value: "all", label: "All Categories" },
                      ...(Array.isArray(categories)
                        ? categories.map((category) => ({
                            value: category.category_id,
                            label: `Category ${category.category_letter}`,
                          }))
                        : []),
                    ]}
                    placeholder="Select category..."
                    padding="px-3 py-2 sm:px-4 sm:py-3"
                    textSize="text-base"
                  />
                </div>
              )}

              {activeTab !== "country" && (
                <div className="w-full sm:w-48 min-w-48">
                  <CustomDropdown
                    label="Country"
                    value={selectedCountry}
                    onChange={setSelectedCountry}
                    options={[
                      { value: "all", label: "All Countries" },
                      ...(Array.isArray(countries)
                        ? countries.map((country) => ({
                            value: country.country_id,
                            label: country.country_name,
                          }))
                        : []),
                    ]}
                    placeholder="Select country..."
                    padding="px-3 py-2 sm:px-4 sm:py-3"
                    textSize="text-base"
                  />
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
                {activeTab === "country" &&
                  Array.isArray(countryData) &&
                  countryData.length > 0 && (
                    <CountryDistribution 
                      data={countryData} 
                      selectedCategoryId={selectedCategory}
                      selectedCategoryLetter={getCategoryLetter(selectedCategory)}
                    />
                  )}

                {activeTab === "category" &&
                  Array.isArray(categoryData) &&
                  categoryData.length > 0 && (
                    <CategoryDistribution
                      categoryData={categoryData}
                      countryData={countryData}
                      yearData={yearData}
                    />
                  )}

                {((activeTab === "country" &&
                  (!Array.isArray(countryData) || countryData.length === 0)) ||
                  (activeTab === "category" &&
                    (!Array.isArray(categoryData) ||
                      categoryData.length === 0))) &&
                  !isLoading && (
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