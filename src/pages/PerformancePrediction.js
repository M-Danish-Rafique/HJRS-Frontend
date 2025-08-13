import { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
  X,
  TrendingUp,
  BarChart3,
  Brain,
  ArrowLeft,
  Calendar,
  Building,
  Globe,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Navbar from "../components/Navbar";
import CustomDropdown from "../components/CustomDropdown";

const API_BASE_URL = "https://hjrs-backend-production.up.railway.app";

// Journal Details Component with Performance Metrics
const JournalPerformanceDetails = ({
  journal,
  journalRecords,
  onPredict,
  predictionData,
  isLoadingPrediction,
}) => {
  // Process historical data from journal records
  const historicalData = journalRecords
    .sort((a, b) => a.range_val.localeCompare(b.range_val))
    .map((record) => ({
      year: record.range_val,
      jpi: parseFloat(record.jpi) || 0,
      category: record.category_letter,
      publisher: record.publisher_name,
      country: record.country_name,
    }));

  const getCategoryStyle = (category) => {
    switch (category) {
      case "W":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-200";
      case "X":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
      case "Y":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
      case "Z":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case "W":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "X":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Y":
        return "bg-green-100 text-green-800 border-green-300";
      case "Z":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get the prediction object from the response
  const prediction = predictionData?.prediction;

  // Debug logging to see the actual structure
  console.log("predictionData:", predictionData);
  console.log("prediction:", prediction);

  return (
    <div className="space-y-6">
      {/* Journal Basic Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">
          {journal.title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-between gap-4">
          <div className="col-span-1">
            <span className="text-sm font-medium text-gray-600">ISSN:</span>
            <p className="text-gray-800 break-words">{journal.issn || "N/A"}</p>
          </div>
          <div className="col-span-1">
            <span className="text-sm font-medium text-gray-600">eISSN:</span>
            <p className="text-gray-800 break-words">
              {journal.eissn || "N/A"}
            </p>
          </div>
          <div className="col-span-1 lg:col-span-2">
            <span className="text-sm font-medium text-gray-600">
              Subject Area:
            </span>
            <p className="text-gray-800 break-words whitespace-normal">
              {journal.subject_area_name}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Records Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 rounded-xl p-5 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="p-2 bg-slate-100 rounded-lg mr-3">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-slate-600" />
          </div>
          <span className="hidden sm:inline">
            Historical Performance Records
          </span>
          <span className="text-lg font-semibold sm:hidden">Performance Records</span>
        </h4>

        {journalRecords.length > 0 ? (
          <div className="grid gap-4">
            {historicalData.map((record, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0 w-full">
                    <h5 className="text-lg font-semibold text-gray-800 w-full text-center sm:text-left">
                      {record.year}
                    </h5>
                  </div>
                  <div className="flex flex-row items-center justify-center sm:justify-start lg:justify-end gap-2 w-full">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full border ${getCategoryBadgeStyle(
                        record.category
                      )}`}
                    >
                      Category {record.category}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full border border-purple-200">
                      JPI: {record.jpi.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Building className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Publisher:
                      </span>
                      <p className="text-gray-800 text-sm mt-1">
                        {record.publisher || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Globe className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Country:
                      </span>
                      <p className="text-gray-800 text-sm mt-1">
                        {record.country || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No historical records available</p>
          </div>
        )}
      </div>

      {/* JPI Trend Chart */}
      {historicalData.length > 0 && (
        <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <span className="hidden md:inline">
              Journal Prestige Index (JPI) Trend
            </span>
            <span className="md:hidden">JPI Trend</span>
          </h4>
          <div
            className="
                    bg-white rounded-lg shadow-sm
                    px-2 py-2
                    sm:px-4 sm:py-4
                    md:px-6 md:py-6
                    lg:px-8 lg:py-8
                "
          >
            <ResponsiveContainer
              width="100%"
              height={
                window.innerWidth < 640
                  ? 180
                  : window.innerWidth < 1024
                  ? 260
                  : 300
              }
              minWidth={0}
            >
              <LineChart
                data={historicalData}
                margin={
                  window.innerWidth < 640
                    ? { top: 10, right: 10, left: 0, bottom: 10 }
                    : { top: 20, right: 30, left: 0, bottom: 20 }
                }
              >
                <defs>
                  <linearGradient id="jpiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="year"
                  axisLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                  tickLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                  tick={{
                    fill: "#374151",
                    fontSize: 13,
                    fontWeight: 500,
                    dy: 10,
                  }}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                  tickLine={{ stroke: "#6b7280", strokeWidth: 1 }}
                  tick={{
                    fill: "#374151",
                    fontSize: 13,
                    fontWeight: 500,
                    dx: window.innerWidth < 640 ? 0 : -5,
                  }}
                  tickFormatter={(value) => value}
                  width={window.innerWidth < 640 ? 30 : 60}
                />
                <Tooltip
                  formatter={(value) => [value.toFixed(1), "JPI Score"]}
                  labelFormatter={(label) => `Year: ${label}`}
                  contentStyle={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "2px solid #3b82f6",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  labelStyle={{ color: "#1f2937", fontWeight: "600" }}
                />
                <Line
                  type="monotone"
                  dataKey="jpi"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  fill="url(#jpiGradient)"
                  dot={{
                    fill: "#3b82f6",
                    strokeWidth: 3,
                    r: 6,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 8,
                    stroke: "#3b82f6",
                    strokeWidth: 3,
                    fill: "#ffffff",
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                  }}
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                JPI Trajectory
              </div>
              <div className="hidden sm:inline text-gray-400">|</div>
              <div className="hidden sm:inline">
                Higher values indicate better performance
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          Performance Prediction
        </h4>

        {!predictionData && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Get AI-powered predictions for next year's performance metrics
            </p>
            <button
              onClick={onPredict}
              disabled={isLoadingPrediction}
              className="text-sm sm:text-base flex items-center justify-center mx-auto px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoadingPrediction ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Brain className="h-5 w-5 mr-2" />
              )}
              Predict Next Year Performance
            </button>
          </div>
        )}

        {prediction && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
              <h5 className="text-base sm:text-lg font-semibold text-gray-800 mb-6">
                {prediction.predictedYear
                  ? `Predicted Performance for ${prediction.predictedYear}`
                  : "Predicted Performance"}
              </h5>
              {/* Cards for predicted values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                {/* Predicted JPI Card */}
                <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl mt-1.5 font-bold text-purple-700 mb-1">
                      {prediction.predictedJPI || "N/A"}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      Predicted JPI
                    </div>
                  </div>
                </div>

                {/* Predicted Category Card */}
                <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="mb-1">
                      <span
                        className={`px-3 py-1.5 inline-flex text-lg md:text-xl font-bold rounded-lg border ${getCategoryStyle(
                          prediction.predictedCategory
                        )}`}
                      >
                        {prediction.predictedCategory || "N/A"}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      Predicted Category
                    </div>
                  </div>
                </div>

                {/* Confidence Card */}
                <div className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="text-2xl md:text-3xl mt-1.5 font-bold text-emerald-700 mb-1">
                      {typeof prediction.confidence === "number"
                        ? `${(prediction.confidence * 100).toFixed(1)}%`
                        : Number(prediction.confidence)
                        ? `${Number(prediction.confidence) * 100}`
                        : "N/A"}
                      <span className="text-xs ml-0.5">
                        {Number(prediction.confidence) ? `%` : ""}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      Confidence Level
                    </div>
                  </div>
                </div>
              </div>
              {prediction.explanation && (
                <div className="mt-6">
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="flex-grow">
                        <h6 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          Prediction Rationale
                        </h6>
                        <div className="w-full h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base m-0">
                        {prediction.explanation}
                      </p>
                    </div>

                    {/* Optional: Add a subtle footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Generated by AI prediction model
                      </div>
                    </div>
                  </div>
                </div>
              )}{" "}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PerformancePrediction() {
  const [searchType, setSearchType] = useState("title");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allJournalRecords, setAllJournalRecords] = useState([]);
  const [error, setError] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  // Function to group journals by distinct attributes
  const groupJournalsByDistinctAttributes = (journals) => {
    const grouped = {};

    journals.forEach((journal) => {
      const key = `${journal.title}_${journal.issn}_${journal.eissn}_${journal.subject_area_name}`;
      if (!grouped[key]) {
        grouped[key] = journal;
      }
    });

    return Object.values(grouped);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setAllJournalRecords([]);
    setSelectedJournal(null);
    setPredictionData(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/journals/search?type=${searchType}&query=${encodeURIComponent(
          searchQuery
        )}`,
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

      // Store all records for later use
      setAllJournalRecords(data);

      // Group journals by distinct attributes for display
      const distinctJournals = groupJournalsByDistinctAttributes(data);
      setSearchResults(distinctJournals);

      if (distinctJournals.length === 0) {
        setError("No journals found matching your search criteria");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal);
    setPredictionData(null);
  };

  // Get all records for the selected journal
  const getJournalRecords = (selectedJournal) => {
    return allJournalRecords.filter(
      (record) =>
        record.title === selectedJournal.title &&
        record.issn === selectedJournal.issn &&
        record.eissn === selectedJournal.eissn &&
        record.subject_area_name === selectedJournal.subject_area_name
    );
  };

  const handlePredict = async () => {
    if (!selectedJournal) return;

    setIsLoadingPrediction(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/prediction/predict-performance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: selectedJournal.title,
            subject_area: selectedJournal.subject_area_name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get performance prediction");
      }

      const responseData = await response.json();

      // The API returns the data structure with prediction nested inside
      setPredictionData(responseData);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(`Prediction failed: ${err.message}`);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setAllJournalRecords([]);
    setSelectedJournal(null);
    setError(null);
    setPredictionData(null);
  };

  return (
    <div className={`min-h-screen sm:bg-gray-50 ${selectedJournal ? "bg-white" : "bg-gray-50"}`}>
      <Navbar currentPage="/performance-prediction" />

      {/* Main Content */}
      <main className={`container mx-auto sm:px-6 sm:py-8 ${selectedJournal ? "p-0" : "p-2"}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`bg-white sm:rounded-lg sm:shadow-lg p-4 sm:p-6 mb-0 sm:mb-8 ${selectedJournal ? "mt-2 sm:mt-0" : "rounded-lg shadow-lg"}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-600" />
                Performance Prediction
              </h2>
              {selectedJournal && (
                <button
                  onClick={() => setSelectedJournal(null)}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 my-1 mr-2" />
                  <span className="hidden sm:inline">Back to Search</span>
                  <span className="sm:hidden">Back</span>
                </button>
              )}
            </div>

            {!selectedJournal && (
              <>
                {/* Search Form */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-grow">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Search journal by ${searchType}...`}
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
                      required={true}
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
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                      <span className="hidden md:inline">
                        Search Results - Select a Journal for Prediction
                      </span>
                      <span className="text-base sm:text-lg md:hidden">
                        Select a Journal for Prediction
                      </span>
                    </h3>

                    {/* Table view for larger screens (sm and up) */}
                    <div className="hidden sm:block border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ISSN
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                E-ISSN
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subject Area
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {searchResults.map((journal, index) => (
                              <tr
                                key={index}
                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => handleSelectJournal(journal)}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                                  {journal.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {journal.issn || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {journal.eissn || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {journal.subject_area_name || "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Card view for mobile screens (less than 640px) */}
                    <div className="sm:hidden space-y-3">
                      {searchResults.map((journal, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:bg-blue-50 cursor-pointer transition-all"
                          onClick={() => handleSelectJournal(journal)}
                        >
                          <div className="space-y-2">
                            <h4 className="font-medium text-blue-600 hover:text-blue-800 text-sm leading-tight">
                              {journal.title}
                            </h4>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>
                                <span className="font-medium text-gray-700">
                                  ISSN:
                                </span>
                                <div className="text-gray-500">
                                  {journal.issn || "N/A"}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">
                                  E-ISSN:
                                </span>
                                <div className="text-gray-500">
                                  {journal.eissn || "N/A"}
                                </div>
                              </div>
                            </div>

                            {journal.subject_area_name && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">
                                  Subject Area:
                                </span>
                                <div className="text-gray-500 mt-1">
                                  {journal.subject_area_name}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}{" "}
              </>
            )}

            {/* Journal Performance Details and Prediction */}
            {selectedJournal && (
              <JournalPerformanceDetails
                journal={selectedJournal}
                journalRecords={getJournalRecords(selectedJournal)}
                onPredict={handlePredict}
                predictionData={predictionData}
                isLoadingPrediction={isLoadingPrediction}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}