import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
} from "lucide-react";

export default function CategoryDistribution({
  categoryData,
  countryData,
  yearData,
}) {
  // Define colors for the charts
  const COLORS = [
    "#3182ce",
    "#63b3ed",
    "#4299e1",
    "#2b6cb0",
    "#2c5282",
    "#1e3a8a",
    "#90cdf4",
  ];

  // Calculate total journals for pie chart
  const totalJournals = categoryData.reduce(
    (sum, category) => sum + category.journal_count,
    0
  );

  // Calculate overall statistics
  const totalCountries = countryData.length; // Use countryData.length instead of summing

  const overallAvgJPI = categoryData.length > 0 
    ? categoryData.reduce((sum, category) => sum + (category.average_jpi || 0), 0) / categoryData.length
    : 0;

  // Create overall summary data
  const overallData = {
    category_letter: "All",
    journal_count: totalJournals,
    percentage: 100,
    average_jpi: overallAvgJPI,
    countries_count: totalCountries,
  };

  // Combine category data with overall data at the end for display
  const summaryData = [...categoryData, overallData];

  // Format pie chart data
  const pieData = categoryData.map((category) => ({
    name: `Category ${category.category_letter}`,
    value: category.journal_count,
    percentage: ((category.journal_count / totalJournals) * 100).toFixed(1),
  }));

  // Format data for JPI score by category
  const jpiData = categoryData
    .map((category) => ({
      name: `Category ${category.category_letter}`,
      score: category.average_jpi,
    }))
    .sort((a, b) => b.score - a.score);

  // Format data for trend analysis
  const [categoryByYearData, setCategoryByYearData] = useState([]);

  const [categoryByCountryData, setCategoryByCountryData] = useState([]);

  useEffect(() => {
    // Convert API data to the required format
    const countryFormattedData = countryData.slice(0, 5).map((country) => ({
      country: country.country_name,
      X: Number(country.category_x_count),
      Y: Number(country.category_y_count),
      W: Number(country.category_w_count),
    }));

    const yearFormattedData = yearData.map((year) => ({
      year: year.year,
      X: Number(year.category_x_count),
      Y: Number(year.category_y_count),
      W: Number(year.category_w_count),
    }));

    setCategoryByCountryData(countryFormattedData);
    setCategoryByYearData(yearFormattedData);
  }, []);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4 flex items-center">
            <PieChartIcon className="h-5 w-5 mr-2 text-blue-600" />
            Distribution of Journals by Category
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} journals (${
                      pieData.find((item) => item.name === name)?.percentage
                    }%)`,
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: window.innerWidth < 640 ? "10px" : "15px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average JPI score by category */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4 flex items-center">
            <BarChartIcon className="h-5 w-5 mr-2 text-blue-600" />
            Average JPI Score by Category
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jpiData}
                margin={{
                  top: 10,
                  right: window.innerWidth < 640 ? 10 : 30,
                  left: window.innerWidth < 640 ? 0 : 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: window.innerWidth < 640 ? 10 : 14,
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: window.innerWidth < 640 ? 10 : 14,
                  }}
                  width={window.innerWidth < 640 ? 20 : 40}
                />
                <Tooltip
                  formatter={(value) => [`${value.toFixed(1)}`, "JPI Score"]}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: window.innerWidth < 640 ? "10px" : "15px",
                  }}
                />
                <Bar dataKey="score" name="JPI Score" fill="#3182ce">
                  {jpiData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown by country */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4 flex items-center">
            <BarChartIcon className="h-5 w-5 mr-2 text-blue-600" />
            Category Breakdown by Top Countries
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryByCountryData}
                margin={{
                  top: 5,
                  right: window.innerWidth < 640 ? 10 : 30,
                  left: window.innerWidth < 640 ? 0 : 10,
                  bottom: 25,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="country"
                  angle={-30}
                  fontSize={window.innerWidth < 640 ? 10 : 14}
                  textAnchor="end"
                  interval={0}
                  height={window.innerWidth < 640 ? undefined : 50}
                />
                <YAxis
                  tick={{
                    fontSize: window.innerWidth < 640 ? 10 : 14,
                  }}
                  width={window.innerWidth < 640 ? 35 : 40}
                />
                <Tooltip />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    fontSize: window.innerWidth < 640 ? "10px" : "15px",
                    marginBottom: "20px",
                  }}
                />
                <Bar dataKey="W" name="Category W" stackId="a" fill="#3182ce" />
                <Bar dataKey="X" name="Category X" stackId="a" fill="#63b3ed" />
                <Bar dataKey="Y" name="Category Y" stackId="a" fill="#90cdf4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend analysis */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Category Distribution Trend Over Years
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={categoryByYearData}
                margin={{
                  top: 10,
                  right: window.innerWidth < 640 ? 10 : 30,
                  left: window.innerWidth < 640 ? 0 : 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  tick={{
                    fontSize: window.innerWidth < 640 ? 10 : 14,
                  }}
                />
                <YAxis
                  tick={{
                    fontSize: window.innerWidth < 640 ? 10 : 14,
                  }}
                  width={window.innerWidth < 640 ? 30 : 40}
                />
                <Tooltip />
                <Legend
                  wrapperStyle={{
                    fontSize: window.innerWidth < 640 ? "10px" : "15px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="W"
                  name="Category W"
                  stroke="#3182ce"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="X"
                  name="Category X"
                  stroke="#63b3ed"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Y"
                  name="Category Y"
                  stroke="#90cdf4"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-6 flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-blue-600" />
          Category Distribution Summary
        </h3>

        {/* Desktop Table - Hidden on mobile/tablet */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Journal Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. JPI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Countries
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryData.map((category, index) => (
                <tr
                  key={index}
                  className={
                    index === summaryData.length - 1 
                      ? "bg-blue-50 border-t-2 border-blue-200" 
                      : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }
                >
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    index === summaryData.length - 1 ? "font-medium text-blue-800" : "font-medium text-gray-900"
                  }`}>
                    {index === summaryData.length - 1 ? "All Categories" : `Category ${category.category_letter}`}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    index === summaryData.length - 1 ? "text-blue-800" : "text-gray-500"
                  }`}>
                    {category.journal_count}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    index === summaryData.length - 1 ? "text-blue-800" : "text-gray-500"
                  }`}>
                    {index === summaryData.length - 1 
                      ? "100.0%" 
                      : `${((category.journal_count / totalJournals) * 100).toFixed(1)}%`
                    }
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    index === summaryData.length - 1 ? "text-blue-800" : "text-gray-500"
                  }`}>
                    {category.average_jpi?.toFixed(2) || "N/A"}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    index === summaryData.length - 1 ? " text-blue-800" : "text-gray-500"
                  }`}>
                    {category.countries_count || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Cards - Hidden on desktop */}
        <div className="lg:hidden space-y-4">
          {summaryData.map((category, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-4 border ${
                index === summaryData.length - 1 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className={`${window.innerWidth < 640 ? "text-base" : "text-lg"} font-semibold mb-3 ${
                index === summaryData.length - 1 ? "text-blue-900" : "text-gray-900"
              }`}>
                {index === summaryData.length - 1 ? "All Categories" : `Category ${category.category_letter}`}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase sm:tracking-wider mb-1">
                    Journal Count
                  </div>
                  <div className={`text-lg sm:text-xl font-semibold ${
                    index === summaryData.length - 1 ? "text-blue-800" : "text-gray-900"
                  }`}>
                    {category.journal_count}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase sm:tracking-wider mb-1">
                    Percentage
                  </div>
                  <div className={`${window.innerWidth < 640 ? "text-lg" : "text-xl"} font-semibold ${
                    index === summaryData.length - 1 ? "text-blue-800" : "text-gray-900"
                  }`}>
                    {index === summaryData.length - 1 
                      ? "100.0%" 
                      : `${((category.journal_count / totalJournals) * 100).toFixed(1)}%`
                    }
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase sm:tracking-wider mb-1">
                    Avg. JPI
                  </div>
                  <div className={`${window.innerWidth < 640 ? "text-lg" : "text-xl"} font-semibold ${
                    index === summaryData.length - 1 ? "text-blue-800" : "text-gray-900"
                  }`}>
                    {category.average_jpi?.toFixed(2) || "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase sm:tracking-wider mb-1">
                    Countries
                  </div>
                  <div className={`${window.innerWidth < 640 ? "text-lg" : "text-xl"} font-semibold ${
                    index === summaryData.length - 1 ? "text-blue-800" : "text-gray-900"
                  }`}>
                    {category.countries_count || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}