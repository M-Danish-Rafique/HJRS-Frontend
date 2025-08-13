import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react";
import CustomDropdown from "../components/CustomDropdown";
import JournalDetails from "../components/JournalDetails";
import Navbar from "../components/Navbar";
import CompactJournalCard from "../components/CompactJournalCard";
import JournalGrid from "../components/JournalGrid";

const API_BASE_URL = "https://hjrs-backend-production.up.railway.app";

export default function FilteredJournalSearch() {
  const [filters, setFilters] = useState({
    country: [],
    year: [],
    category: [],
    subjectArea: [],
    subjectSubcategories: [],
    publisher: [],
    minJpi: "",
    maxJpi: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    years: [],
    categories: [],
    subjectAreas: [],
    subjectSubcategories: [],
    publishers: [],
  });

  // Updated publisher search state - no longer need loading or API calls
  const [publisherSearch, setPublisherSearch] = useState("");
  const [showPublisherSuggestions, setShowPublisherSuggestions] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Sorting state
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Refs for navigation
  const resultsRef = useRef(null);
  const tableRef = useRef(null);

  // Scroll to results section
  const scrollToResultsSection = useCallback(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  // Scroll to top of table
  const scrollToTableTop = useCallback(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  // Memoize active filters count to prevent unnecessary re-renders
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === "minJpi" || key === "maxJpi") {
        return value !== "" ? acc + 1 : acc;
      }
      return Array.isArray(value) && value.length > 0 ? acc + 1 : acc;
    }, 0);
  }, [filters]);

  // Memoize filtered publishers based on search query
  const filteredPublishers = useMemo(() => {
    if (!publisherSearch) {
      return [];
    }

    const searchLower = publisherSearch.toLowerCase();

    return filterOptions.publishers
      .filter((publisher) =>
        publisher.publisher_name.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => {
        const aName = a.publisher_name.toLowerCase();
        const bName = b.publisher_name.toLowerCase();
        return aName.indexOf(searchLower) - bName.indexOf(searchLower);
      })
      .slice(0, 100); // Limit to 100 suggestions for performance
  }, [publisherSearch, filterOptions.publishers]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = useCallback(async () => {
    try {
      // Load all filter options including publishers at startup
      const [
        countriesRes,
        yearsRes,
        categoriesRes,
        subjectAreasRes,
        publishersRes,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reference/countries`),
        fetch(`${API_BASE_URL}/api/reference/publishing-years`),
        fetch(`${API_BASE_URL}/api/reference/categories`),
        fetch(`${API_BASE_URL}/api/reference/subject-areas`),
        fetch(`${API_BASE_URL}/api/reference/publishers`), // Fetch all publishers at once
      ]);

      setFilterOptions({
        countries: countriesRes.ok ? await countriesRes.json() : [],
        years: yearsRes.ok ? await yearsRes.json() : [],
        categories: categoriesRes.ok ? await categoriesRes.json() : [],
        subjectAreas: subjectAreasRes.ok ? await subjectAreasRes.json() : [],
        publishers: publishersRes.ok ? await publishersRes.json() : [], // Load all publishers
        subjectSubcategories: [], // Will use same subject areas for subcategories
      });
    } catch (err) {
      console.error("Error loading filter options:", err);
      // Set default empty arrays on error
      setFilterOptions({
        countries: [],
        years: [],
        categories: [],
        subjectAreas: [],
        publishers: [],
        subjectSubcategories: [],
      });
    }
  }, []);

  const handleFilterChange = useCallback(
    (filterName, value) => {
      if (filterName === "minJpi" || filterName === "maxJpi") {
        // Handle JPI range inputs with validation
        let numValue = value === "" ? "" : Number(value);

        // Validate range 0-100
        if (numValue !== "" && (numValue < 0 || numValue > 100)) {
          return; // Don't update if outside valid range
        }

        // Additional validation for min/max relationship
        if (filterName === "minJpi" && filters.maxJpi !== "") {
          if (numValue !== "" && numValue > Number(filters.maxJpi)) {
            return; // Don't update if min > max
          }
        }

        if (filterName === "maxJpi" && filters.minJpi !== "") {
          if (numValue !== "" && numValue < Number(filters.minJpi)) {
            return; // Don't update if max < min
          }
        }

        setFilters((prev) => ({
          ...prev,
          [filterName]: value,
        }));
      } else {
        // Handle multi-select filters - convert to string for consistency
        const stringValue = String(value);
        setFilters((prev) => {
          const currentValues = prev[filterName] || [];
          const newValues = currentValues.includes(stringValue)
            ? currentValues.filter((v) => v !== stringValue)
            : [...currentValues, stringValue];

          return {
            ...prev,
            [filterName]: newValues,
          };
        });
      }

      // Set subcategories options to all subject areas since they refer to the same table
      if (filterName === "subjectArea") {
        setFilterOptions((prev) => ({
          ...prev,
          subjectSubcategories: prev.subjectAreas,
        }));
      }
    },
    [filters.minJpi, filters.maxJpi]
  );

  const loadSubcategories = useCallback(async (subjectAreaId) => {
    // Since subcategories refer to the same SubjectArea table,
    // we'll use the already loaded subject areas
    setFilterOptions((prev) => ({
      ...prev,
      subjectSubcategories: prev.subjectAreas,
    }));
  }, []);

  const handlePublisherSelect = useCallback(
    (publisher) => {
      // Add to selected publishers
      handleFilterChange("publisher", publisher.publisher_id);

      // Clear search and hide suggestions
      setPublisherSearch("");
      setShowPublisherSuggestions(false);
    },
    [handleFilterChange]
  );

  // Handle publisher search input change - now just updates local state
  const handlePublisherSearchChange = useCallback((e) => {
    const value = e.target.value;
    setPublisherSearch(value);
    setShowPublisherSuggestions(true); // Show suggestions only if 2+ characters
  }, []);

  // Handle sorting change
  const handleSortChange = useCallback((value) => {
    if (!value) {
      setSortBy("");
      setSortOrder("asc");
      return;
    }

    const [field, order] = value.split("_");
    setSortBy(field);
    setSortOrder(order);
  }, []);

  // Memoized components to prevent unnecessary re-renders
  const FilterInput = useCallback(
    ({ label, value, onChange, placeholder, type = "text" }) => (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={type === "number" ? "0" : undefined}
          max={type === "number" ? "100" : undefined}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
        />
        {type === "number" && (
          <p className="text-xs text-gray-500">
            Value must be between 0 and 100
          </p>
        )}
      </div>
    ),
    []
  );

  const handlePublisherRemove = useCallback(
    (publisherId) => {
      handleFilterChange("publisher", publisherId);
    },
    [handleFilterChange]
  );

  const ResultsPerPageSelector = useMemo(
    () => () =>
      (
        <div className="flex items-center justify-end space-x-2 max-[325px]:space-x-1 sm:space-x-3 text-sm">
          <span className="text-gray-700 font-medium hidden xs:inline">
            Show:
          </span>
          <CustomDropdown
            value={resultsPerPage}
            onChange={(value) => {
              setResultsPerPage(Number(value));
              setCurrentPage(1);
              if (searchResults.length > 0) {
                handleSearch(1);
              }
            }}
            options={[
              { value: 10, label: "10" },
              { value: 25, label: "25" },
              { value: 50, label: "50" },
              { value: 100, label: "100" },
            ]}
            className="w-16 sm:w-20"
            padding="px-2 py-1.5 sm:px-3 sm:py-1.5"
            textSize="text-xs sm:text-sm md:text-base"
          />
          <span className="text-gray-700 text-xs md:text-sm inline">
            per page
          </span>
        </div>
      ),
    [resultsPerPage, searchResults.length]
  );

  // Sorting dropdown component
  const SortingSelector = useMemo(
    () => () =>
      (
        <div className="flex items-center justify-end max-[350px]:space-x-1 space-x-2 sm:space-x-3 text-sm">
          <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
          <span className="text-gray-700 font-medium hidden xs:inline">
            Sort by:
          </span>
          <span className="text-gray-700 font-medium xs:hidden text-sm max-[335px]:text-xs">
            Sort:
          </span>
          <CustomDropdown
            value={sortBy && sortOrder ? `${sortBy}_${sortOrder}` : ""}
            onChange={handleSortChange}
            options={[
              { value: "", label: "Default" },
              { value: "jpi_asc", label: "JPI: Low to High" },
              { value: "jpi_desc", label: "JPI: High to Low" },
              { value: "year_asc", label: "Publishing Year: Oldest First" },
              { value: "year_desc", label: "Publishing Year: Latest First" },
            ]}
            className="min-w-[120px] xs:min-w-[160px] sm:min-w-[200px]"
            padding="px-2 py-1.5 sm:px-3 sm:py-1.5"
            textSize="text-xs sm:text-sm md:text-base"
          />
        </div>
      ),
    [sortBy, sortOrder, handleSortChange]
  );
  const handleSearch = useCallback(
    async (page = 1, shouldScrollToResults = false) => {
      setIsLoading(true);
      setError(null);
      if (page === 1) {
        setSearchResults([]);
        setSelectedJournal(null);
      }

      try {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (key === "minJpi" || key === "maxJpi") {
            if (value !== "") {
              queryParams.append(key, value);
            }
          } else if (Array.isArray(value) && value.length > 0) {
            queryParams.append(key, value.join(","));
          }
        });

        // Add pagination parameters
        queryParams.append("page", page.toString());
        queryParams.append("limit", resultsPerPage.toString());

        // Add sorting parameters
        if (sortBy) {
          queryParams.append("sortBy", sortBy);
          queryParams.append("sortOrder", sortOrder);
        }

        const response = await fetch(
          `${API_BASE_URL}/api/journals/filtered-search?${queryParams}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();

        // Assuming backend returns { results: [...], total: number, page: number }
        setSearchResults(data.results || data);
        setTotalResults(data.total || data.length);
        setCurrentPage(page);
        setIsFiltersExpanded(false); // Collapse filters after search

        if ((data.results || data).length === 0) {
          setError("No journals found matching your search criteria");
        } else {
          // Scroll to results section after successful search
          if (shouldScrollToResults && page === 1) {
            setTimeout(() => {
              scrollToResultsSection();
            }, 100);
          } else if (page > 1) {
            // Scroll to table top when navigating pages
            setTimeout(() => {
              scrollToTableTop();
            }, 100);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [
      filters,
      resultsPerPage,
      sortBy,
      sortOrder,
      scrollToResultsSection,
      scrollToTableTop,
    ]
  );

  const handleSelectJournal = useCallback((journal) => {
    setSelectedJournal(journal);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      country: [],
      year: [],
      category: [],
      subjectArea: [],
      subjectSubcategories: [],
      publisher: [],
      minJpi: "",
      maxJpi: "",
    });
    setSearchResults([]);
    setSelectedJournal(null);
    setError(null);
    setCurrentPage(1);
    setTotalResults(0);
    setPublisherSearch("");
    setShowPublisherSuggestions(false);
    setSortBy("");
    setSortOrder("asc");
  }, []);

  const FilterMultiSelect = useMemo(
    () =>
      ({ label, values, onChange, options, placeholder }) =>
        (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <div className="relative">
              <CustomDropdown
                value=""
                onChange={(v) => {
                  if (v) {
                    onChange(v);
                  }
                }}
                options={
                  Array.isArray(options)
                    ? options.map((option) => ({
                        value: String(
                          option.country_id ||
                            option.year_id ||
                            option.category_id ||
                            option.subject_area_id ||
                            option.publisher_id
                        ),
                        label:
                          option.country_name ||
                          option.range_val ||
                          option.category_letter ||
                          option.subject_area_name ||
                          option.publisher_name,
                      }))
                    : []
                }
                placeholder={placeholder}
              />

              {/* Selected items display */}
              {values.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {values.map((value) => {
                    const option = options.find((opt) => {
                      const optionId =
                        opt.country_id ||
                        opt.year_id ||
                        opt.category_id ||
                        opt.subject_area_id ||
                        opt.publisher_id;
                      return String(optionId) === String(value);
                    });

                    const displayName = option
                      ? option.country_name ||
                        option.range_val ||
                        option.category_letter ||
                        option.subject_area_name ||
                        option.publisher_name
                      : `Unknown (${value})`;

                    return (
                      <span
                        key={value}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm"
                      >
                        {displayName}
                        <button
                          type="button"
                          onClick={() => onChange(value)}
                          className="ml-2 h-5 w-5 rounded-full inline-flex items-center justify-center text-blue-500 hover:bg-blue-200 hover:text-blue-700 transition-colors duration-150"
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
        ),
    []
  );

  const PaginationControls = useMemo(
    () => () => {
      const getPageNumbers = (isMobile = false) => {
        const pages = [];
        const maxVisible = isMobile ? 3 : 5; // Fewer pages on mobile

        if (totalPages <= maxVisible) {
          for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          if (isMobile) {
            // Mobile: Show current page and one on each side
            if (currentPage <= 2) {
              pages.push(1, 2, 3);
              if (totalPages > 3) {
                pages.push("...");
                pages.push(totalPages);
              }
            } else if (currentPage >= totalPages - 1) {
              pages.push(1);
              if (totalPages > 4) pages.push("...");
              for (let i = Math.max(totalPages - 2, 1); i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              pages.push(1);
              if (currentPage > 2) pages.push("...");
              pages.push(currentPage);
              if (currentPage < totalPages - 1) pages.push("...");
              pages.push(totalPages);
            }
          } else {
            // Desktop: Original logic
            if (currentPage <= 3) {
              for (let i = 1; i <= 4; i++) pages.push(i);
              pages.push("...");
              pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
              pages.push(1);
              pages.push("...");
              for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              pages.push("...");
              for (let i = currentPage - 1; i <= currentPage + 1; i++)
                pages.push(i);
              pages.push("...");
              pages.push(totalPages);
            }
          }
        }
        return pages;
      };

      const handlePageChange = (page) => {
        handleSearch(page);
      };

      if (totalPages <= 1) return null;

      return (
        <div className="bg-gray-50 border-t mt-3 sm:mt-5 md:mt-7 border-gray-200">
          {/* Desktop/Tablet View (≥ 640px) */}
          <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            {/* Results info */}
            <div className="flex items-center text-xs sm:text-sm text-gray-700">
              <span>
                Showing {(currentPage - 1) * resultsPerPage + 1} to{" "}
                {Math.min(currentPage * resultsPerPage, totalResults)} of{" "}
                {totalResults.toLocaleString()} results
              </span>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                Prev
              </button>

              <div className="flex space-x-0.5 sm:space-x-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof page === "number" ? handlePageChange(page) : null
                    }
                    disabled={
                      page === "..." || page === currentPage || isLoading
                    }
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                      page === currentPage
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                    } disabled:cursor-not-allowed`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          </div>

          {/* Mobile View (< 640px) */}
          <div className="sm:hidden px-3 py-3 space-y-3">
            {/* Results info - simplified for mobile */}
            <div className="text-center text-sm 1 max-[375px]:text-xs text-gray-600">
              Page {currentPage} of {totalPages} (
              {totalResults.toLocaleString()} total)
            </div>

            {/* Pagination controls - stacked layout */}
            <div className="flex items-center justify-between">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="flex items-center px-3 py-2 max-[400px]:px-2 max-[400px]:py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <svg
                  className="w-4 h-4 mr-1 max-[375px]:my-0.5 max-[400px]:mr-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className=" hidden min-[375px]:inline">Prev</span>
              </button>

              {/* Page numbers - mobile optimized */}
              <div className="flex items-center space-x-1 max-[375px]:space-x-0.5">
                {getPageNumbers(true).map((page, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof page === "number" ? handlePageChange(page) : null
                    }
                    disabled={
                      page === "..." || page === currentPage || isLoading
                    }
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-all duration-200 ${
                      page === currentPage
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"
                    } disabled:cursor-not-allowed`}
                  >
                    {page === "..." ? "…" : page}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="flex items-center px-3 py-2 max-[400px]:px-2 max-[400px]:py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <span className=" hidden min-[375px]:inline">Next</span>
                <svg
                  className="w-4 h-4 ml-1 max-[375px]:my-0.5 max-[400px]:ml-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Quick jump to first/last on mobile (only show if not on first/last page) */}
            {totalPages > 5 &&
              (currentPage > 3 || currentPage < totalPages - 2) && (
                <div className="flex justify-center space-x-2">
                  {currentPage > 3 && (
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={isLoading}
                      className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      First
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
      );
    },
    [
      currentPage,
      totalPages,
      resultsPerPage,
      totalResults,
      isLoading,
      handleSearch,
    ]
  );
  // Effect to re-search when sorting changes
  useEffect(() => {
    if (searchResults.length > 0) {
      handleSearch(1);
    }
  }, [sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="/filtered-search" />

      {/* Main Content */}
      <main className="container mx-auto p-2 sm:px-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-2 sm:mb-8">
            <div className="mb-2 sm:mb-6 mt-2 sm:mt-0 ">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                  <Filter className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 mr-2 text-blue-600" />
                  Advanced Journal Search
                </h2>

                {/* Desktop: Both buttons in same row */}
                <div className="hidden sm:flex items-center space-x-0">
                  {/* Active filters count */}
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="group flex items-center px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-800 text-xs sm:text-sm font-medium rounded-2xl border border-blue-200 transition-all duration-200"
                    >
                      <span>
                        {activeFiltersCount} filter
                        {activeFiltersCount !== 1 ? "s" : ""} active
                      </span>
                      <X className="h-3 w-3 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 group-hover:text-blue-900 transition-colors" />
                    </button>
                  )}

                  {/* Show/Hide filters button */}
                  <button
                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                    className="flex items-center px-2 py-1.5 md:px-3 md:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50"
                  >
                    {isFiltersExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Hide Filters
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Show Filters
                      </>
                    )}
                  </button>
                </div>

                {/* Show only when width > 345px */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="sm:hidden max-[360px]:hidden group flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-800 text-xs font-medium rounded-full border border-blue-200 transition-all duration-200"
                  >
                    <span className="inline">
                      {activeFiltersCount} filter
                      {activeFiltersCount !== 1 ? "s" : ""}
                    </span>
                    <X className="h-3 w-3 ml-1.5 group-hover:text-blue-900 transition-colors" />
                  </button>
                )}
              </div>

              {/* Mobile: Show/Hide button in separate row */}
              <div className="sm:hidden flex justify-end">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="sm:hidden min-[360px]:hidden group flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-800 text-xs font-medium rounded-full border border-blue-200 transition-all duration-200"
                  >
                    <span className="inline">
                      {activeFiltersCount} filter
                      {activeFiltersCount !== 1 ? "s" : ""}
                    </span>
                    <X className="h-3 w-3 ml-1.5 group-hover:text-blue-900 transition-colors" />
                  </button>
                )}

                <button
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className="flex items-center px-2 py-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors rounded-lg hover:bg-blue-50"
                >
                  {isFiltersExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Hide Filters</span>
                      <span className="xs:hidden">Hide</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      <span className="hidden xs:inline">Show Filters</span>
                      <span className="xs:hidden">Show</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {isFiltersExpanded && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <FilterMultiSelect
                    label="Country"
                    values={filters.country}
                    onChange={(value) => handleFilterChange("country", value)}
                    options={filterOptions.countries}
                    placeholder="Select countries..."
                  />

                  <FilterMultiSelect
                    label="Year"
                    values={filters.year}
                    onChange={(value) => handleFilterChange("year", value)}
                    options={filterOptions.years}
                    placeholder="Select years..."
                  />

                  <FilterMultiSelect
                    label="Category"
                    values={filters.category}
                    onChange={(value) => handleFilterChange("category", value)}
                    options={filterOptions.categories}
                    placeholder="Select categories..."
                  />

                  <FilterMultiSelect
                    label="Subject Area"
                    values={filters.subjectArea}
                    onChange={(value) =>
                      handleFilterChange("subjectArea", value)
                    }
                    options={filterOptions.subjectAreas}
                    placeholder="Select subject areas..."
                  />

                  <FilterMultiSelect
                    label="Subject Subcategories"
                    values={filters.subjectSubcategories}
                    onChange={(value) =>
                      handleFilterChange("subjectSubcategories", value)
                    }
                    options={
                      filterOptions.subjectSubcategories.length > 0
                        ? filterOptions.subjectSubcategories
                        : filterOptions.subjectAreas
                    }
                    placeholder="Select subcategories..."
                  />

                  {/* Enhanced Publisher Autocomplete Component */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Publisher
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={publisherSearch}
                        onChange={handlePublisherSearchChange}
                        placeholder="Search publishers..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md text-base"
                        onFocus={() => setShowPublisherSuggestions(true)}
                        onBlur={() => {
                          // Delay hiding to allow click on suggestions
                          setTimeout(
                            () => setShowPublisherSuggestions(false),
                            200
                          );
                        }}
                      />

                      {/* Enhanced Suggestions dropdown */}
                      {showPublisherSuggestions &&
                        filteredPublishers.length > 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                            <div className="p-2">
                              {filteredPublishers.map((publisher) => (
                                <button
                                  key={publisher.publisher_id}
                                  type="button"
                                  onClick={() =>
                                    handlePublisherSelect(publisher)
                                  }
                                  disabled={filters.publisher.includes(
                                    String(publisher.publisher_id)
                                  )}
                                  className="w-full px-3 py-2.5 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-transparent hover:border-blue-100"
                                >
                                  <div className="text-sm text-gray-800 font-medium truncate">
                                    {publisher.publisher_name}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Enhanced no results message */}
                      {showPublisherSuggestions &&
                        publisherSearch.length >= 2 &&
                        filteredPublishers.length === 0 && (
                          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3">
                            <div className="text-sm text-gray-500 text-center">
                              No publishers found matching "{publisherSearch}"
                            </div>
                          </div>
                        )}

                      {/* Enhanced selected publishers display */}
                      {filters.publisher.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {filters.publisher.map((value) => {
                            const publisher = filterOptions.publishers.find(
                              (pub) =>
                                String(pub.publisher_id) === String(value)
                            );

                            const displayName = publisher
                              ? publisher.publisher_name
                              : `Unknown (${value})`;

                            return (
                              <span
                                key={value}
                                className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm"
                              >
                                <span className="truncate max-w-[120px] sm:max-w-none">
                                  {displayName}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handlePublisherRemove(value)}
                                  className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full inline-flex items-center justify-center text-blue-500 hover:bg-blue-200 hover:text-blue-700 transition-colors duration-150"
                                >
                                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <FilterInput
                    label="Min JPI"
                    value={filters.minJpi}
                    onChange={(value) => handleFilterChange("minJpi", value)}
                    placeholder="Minimum JPI..."
                    type="number"
                  />

                  <FilterInput
                    label="Max JPI"
                    value={filters.maxJpi}
                    onChange={(value) => handleFilterChange("maxJpi", value)}
                    placeholder="Maximum JPI..."
                    type="number"
                  />
                </div>
                <div className="flex justify-center sm:justify-end mt-4 max-[425px]:w-full">
                  <button
                    onClick={() => handleSearch(1, true)}
                    disabled={isLoading || activeFiltersCount === 0}
                    className="flex items-center justify-center px-5 py-2.5 sm:px-7 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm sm:text-base rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 max-[425px]:w-full"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    )}
                    Search Journals
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 mb-6 text-sm text-red-800 rounded-xl bg-red-50 border border-red-200 shadow-sm">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && !selectedJournal && (
            <div
              ref={resultsRef}
              className="bg-white border-gray-200 rounded-xl shadow-xl p-4 sm:p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 gap-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Search Results ({totalResults.toLocaleString()} journal
                  {totalResults !== 1 ? "s" : ""} found)
                </h3>
                <div className="flex flex-row items-center justify-end gap-2 max-[325px]:gap-0 max-[335px]:gap-1 sm:gap-4">
                  <SortingSelector />
                  <ResultsPerPageSelector />
                </div>
              </div>
              {/* Mobile Card View (< 640px) */}
              <CompactJournalCard searchResults={searchResults} handleSelectJournal={handleSelectJournal}/>

              {/* Tablet View and Desktop View (>= 640px) */}
              <JournalGrid journals={searchResults} handleSelectJournal={handleSelectJournal}/>

              {/* Optional Desktop View (>= 1024px) */}
              {/* <div className="hidden lg:block">
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            JPI
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Country
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Year
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Publisher
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {searchResults.map((journal) => (
                          <tr
                            key={journal.journal_id}
                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200"
                            onClick={() => handleSelectJournal(journal)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              <div className="max-w-48 truncate">
                                {journal.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {journal.issn || journal.eissn || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <span
                                className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full border ${
                                  journal.category_letter === "W"
                                    ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-200"
                                    : journal.category_letter === "X"
                                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
                                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                Category {journal.category_letter}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-medium">
                              {journal.jpi || "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {journal.country_name || "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {journal.range_val}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              <div className="max-w-xs truncate">
                                {journal.publisher_name}
                              </div>
                            </td>
                          </tr>                          
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div> */}

              {/* Pagination Controls */}
              <PaginationControls />
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
}