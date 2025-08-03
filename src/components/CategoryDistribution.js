import { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';

export default function CategoryDistribution({ categoryData, countryData, yearData }) {
  // Define colors for the charts
  const COLORS = ['#3182ce', '#63b3ed', '#4299e1', '#2b6cb0', '#2c5282', '#1e3a8a', '#90cdf4'];
  
  // Calculate total journals for pie chart
  const totalJournals = categoryData.reduce((sum, category) => sum + category.journal_count, 0);
  
  // Format pie chart data
  const pieData = categoryData.map(category => ({
    name: `Category ${category.category_letter}`,
    value: category.journal_count,
    percentage: ((category.journal_count / totalJournals) * 100).toFixed(1)
  }));
  
  // Format data for JPI score by category
  const jpiData = categoryData.map(category => ({
    name: `Category ${category.category_letter}`,
    score: category.average_jpi
  })).sort((a, b) => b.score - a.score);
  
  // Format data for trend analysis
  const [categoryByYearData, setCategoryByYearData] = useState([]);

  const [categoryByCountryData, setCategoryByCountryData] = useState([]);
  
  useEffect(() => {
    // Convert API data to the required format
    const countryFormattedData = countryData.slice(0, 5).map((country) => ({
      country: country.country_name,
      X: Number(country.category_x_count),
      Y: Number(country.category_y_count),
      W: Number(country.category_w_count)
    }));

    const yearFormattedData = yearData.map((year) => ({
      year: year.year,
      X: Number(year.category_x_count),
      Y: Number(year.category_y_count),
      W: Number(year.category_w_count)
    }));

    setCategoryByCountryData(countryFormattedData);
    setCategoryByYearData(yearFormattedData);
  }, []);
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
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
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            <PieChartIcon className="h-5 w-5 inline-block mr-2 text-blue-600" />
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} journals (${pieData.find(item => item.name === name)?.percentage}%)`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average JPI score by category */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            <BarChartIcon className="h-5 w-5 inline-block mr-2 text-blue-600" />
            Average JPI Score by Category
          </h3>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jpiData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(2)}`, 'JPI Score']}
                />
                <Legend />
                <Bar dataKey="score" name="JPI Score" fill="#3182ce">
                  {jpiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            <BarChartIcon className="h-5 w-5 inline-block mr-2 text-blue-600" />
            Category Breakdown by Top Countries
          </h3>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryByCountryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" angle={-30} fontSize={14} textAnchor="end" interval={0} height={50} /> 
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} /> {/* 👈 move legend up */}
                <Bar dataKey="W" name="Category W" stackId="a" fill="#3182ce" />
                <Bar dataKey="X" name="Category X" stackId="a" fill="#63b3ed" />
                <Bar dataKey="Y" name="Category Y" stackId="a" fill="#90cdf4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend analysis */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            <TrendingUp className="h-5 w-5 inline-block mr-2 text-blue-600" />
            Category Distribution Trend Over Years
          </h3>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={categoryByYearData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="W" name="Category W" stroke="#3182ce" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="X" name="Category X" stroke="#63b3ed" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Y" name="Category Y" stroke="#90cdf4" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          <PieChartIcon className="h-5 w-5 inline-block mr-2 text-blue-600" />
          Category Distribution Summary
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Journal Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. JPI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Countries</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((category, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Category {category.category_letter}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.journal_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {((category.journal_count / totalJournals) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.average_jpi?.toFixed(2) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.countries_count || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}