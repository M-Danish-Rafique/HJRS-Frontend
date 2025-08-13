import { Routes, Route } from 'react-router-dom'
import JournalLookup from './pages/JournalLookup'
import DistributionAnalysis from './pages/DistributionAnalysis'
import FilteredJournalSearch from './pages/FilteredJournalSearch'
import PerformancePrediction from './pages/PerformancePrediction';

function App() {
  console.log('App component rendering');
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<JournalLookup />} />
        <Route path="/journal-lookup" element={<JournalLookup />} />
        <Route path="/filtered-search" element={<FilteredJournalSearch />} />
        <Route path="/distribution-analysis" element={<DistributionAnalysis />} />
        <Route path="/performance-prediction" element={<PerformancePrediction />} />

      </Routes>
    </div>
  )
}

export default App;
