import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Globe, FileText } from "lucide-react";
import CustomDropdown from "./CustomDropdown";

export default function CountryDistribution({ data, selectedCategoryId, selectedCategoryLetter }) {
  const [topCountriesCount, setTopCountriesCount] = useState(10);

  // Process data for the top countries chart
  const topCountries = [...data]
    .sort((a, b) => b.journal_count - a.journal_count)
    .slice(0, topCountriesCount);

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 mb-8">
        {/* Top Countries by Journal Count */}
        <div className="bg-white px-6 py-5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-start sm:justify-between flex-col sm:flex-row items-start sm:items-center mb-4 gap-3 sm:gap-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 flex items-center w-full sm:w-auto">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
              <span className="text-base sm:text-lg">
                Top Countries by Journal Count
              </span>
            </h3>
            <div className="flex items-center w-full sm:w-auto justify-end">
              <label
                htmlFor="country-count"
                className="text-xs sm:text-sm text-gray-600 mr-2 whitespace-nowrap"
              >
                Show:
              </label>
              <div className="min-w-[80px] sm:min-w-[140px]">
                <CustomDropdown
                  value={topCountriesCount}
                  onChange={(v) => setTopCountriesCount(Number(v))}
                  options={[
                    { value: 5, label: "Top 5" },
                    { value: 10, label: "Top 10" },
                    { value: 15, label: "Top 15" },
                    { value: 20, label: "Top 20" },
                  ]}
                  placeholder="Select..."
                  padding="px-2 py-1 sm:px-3 sm:py-1.5"
                  textSize="text-xs sm:text-sm md:text-base"
                />
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCountries.slice(0, topCountriesCount)}
                margin={{
                  top: 5,
                  right: window.innerWidth < 640 ? 5 : 30,
                  left: window.innerWidth < 640 ? 0 : 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="country_name"
                  tick={{
                    fontSize:
                      window.innerWidth < 640
                        ? 8
                        : window.innerWidth < 1020
                        ? 11
                        : 13,
                    angle: -45,
                    textAnchor: "end",
                  }}
                  interval={0} // Forces all labels to show
                  height={window.innerWidth < 640 ? 60 : 70}
                />
                <YAxis
                  tick={{
                    fontSize:
                      window.innerWidth < 640
                        ? 8
                        : window.innerWidth < 1020
                        ? 10
                        : 13,
                  }}
                  width={window.innerWidth < 640 ? 30 : 40}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="journal_count"
                  name="Journal Count"
                  fill="#4299e1"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Summary Statistics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-6 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-base sm:text-lg">
              Journal Distribution Summary
            </span>
          </h3>

          {/* Desktop Table - Hidden on mobile/tablet */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total Countries
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Countries with at least one journal
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Top Country
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.length > 0
                      ? data.sort(
                          (a, b) => b.journal_count - a.journal_count
                        )[0].country_name
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.length > 0
                      ? `${
                          data.sort(
                            (a, b) => b.journal_count - a.journal_count
                          )[0].journal_count
                        } journals`
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Average Journals per Country
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.length > 0
                      ? (
                          data.reduce(
                            (sum, item) => sum + item.journal_count,
                            0
                          ) / data.length
                        ).toFixed(2)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Based on countries with at least one journal
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {selectedCategoryId === "all" 
                      ? "Countries with W Category" 
                      : `Countries with Category ${selectedCategoryLetter}`
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      let categoryKey = `category_w_count`;

                      if (selectedCategoryId !== "all") {
                        categoryKey = `category_${selectedCategoryLetter.toLowerCase()}_count`;
                      }
                      
                      return data.filter((item) => {
                        return item[categoryKey] && item[categoryKey] > 0;
                      }).length;
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {selectedCategoryId === "all" 
                      ? "Countries with at least one journal in W category"
                      : `Countries with at least one Category ${selectedCategoryLetter} journal`
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards - Hidden on desktop */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Total Countries
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {data.length}
              </div>
              <div className="text-sm text-gray-600">
                Countries with at least one journal
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Top Country
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {data.length > 0
                  ? data.sort(
                      (a, b) => b.journal_count - a.journal_count
                    )[0].country_name
                  : "-"}
              </div>
              <div className="text-sm text-gray-600">
                {data.length > 0
                  ? `${
                      data.sort(
                        (a, b) => b.journal_count - a.journal_count
                      )[0].journal_count
                    } journals`
                  : "-"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Average Journals per Country
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {data.length > 0
                  ? (
                      data.reduce(
                        (sum, item) => sum + item.journal_count,
                        0
                      ) / data.length
                    ).toFixed(2)
                  : "-"}
              </div>
              <div className="text-sm text-gray-600">
                Based on countries with at least one journal
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {selectedCategoryId === "all" 
                  ? "Countries with W Category" 
                  : `Countries with Category ${selectedCategoryLetter}`
                }
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                {(() => {
                      let categoryKey = `category_w_count`;

                      if (selectedCategoryId !== "all") {
                        categoryKey = `category_${selectedCategoryLetter.toLowerCase()}_count`;
                      }
                      
                      return data.filter((item) => {
                        return item[categoryKey] && item[categoryKey] > 0;
                      }).length;
                })()}
              </div>
              <div className="text-sm text-gray-600">
                {selectedCategoryId === "all" 
                  ? "Countries with at least one journal in W category"
                  : `Countries with at least one Category ${selectedCategoryLetter} journal`
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}