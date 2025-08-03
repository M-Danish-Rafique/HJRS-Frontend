import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Globe, FileText } from 'lucide-react';

export default function CountryDistribution({ data }) {
  const [topCountriesCount, setTopCountriesCount] = useState(10);
  // const [mapView, setMapView] = useState(false);
  
  // Colors for the charts
  // const colors = ['#3182ce', '#63b3ed', '#4299e1', '#2b6cb0', '#2c5282'];
  
  // Process data for the top countries chart
  const topCountries = [...data]
    .sort((a, b) => b.journal_count - a.journal_count)
    .slice(0, topCountriesCount);
  
  // Process data for category breakdown by country
  // const topCountriesForCategoryBreakdown = [...data]
  //   .sort((a, b) => b.journal_count - a.journal_count)
  //   .slice(0, 5);
  
  return (
    <div>
      <div className="grid grid-cols-1 gap-8 mb-8">{/*lg:grid-cols-2 */}
        {/* Top Countries by Journal Count */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              <Globe className="h-5 w-5 inline-block mr-2 text-blue-600" />
              Top Countries by Journal Count
            </h3>
            <div className="flex items-center">
              <label htmlFor="country-count" className="text-sm text-gray-600 mr-2">Show:</label>
              <select
                id="country-count"
                value={topCountriesCount}
                onChange={(e) => setTopCountriesCount(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
          </div>

          <div className="h-80 flex items-center justify-center">            
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCountries.slice(0, topCountriesCount)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="country_name" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="journal_count" name="Journal Count" fill="#4299e1" />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            <FileText className="h-5 w-5 inline-block mr-2 text-blue-600" />
            Journal Distribution Summary
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total Countries</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Countries with at least one journal</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Top Country</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.length > 0 ? data.sort((a, b) => b.journal_count - a.journal_count)[0].country_name : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.length > 0 ? `${data.sort((a, b) => b.journal_count - a.journal_count)[0].journal_count} journals` : '-'}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Average Journals per Country</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.length > 0 ? (data.reduce((sum, item) => sum + item.journal_count, 0) / data.length).toFixed(2) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Based on countries with at least one journal</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Countries with Category X</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {data.filter(item => item.category_x_count > 0).length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Countries with at least one Category X journal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}