# ML Research Paper Web App

A modern React-based web application for analyzing and searching research papers with machine learning insights.

## Features

- **Journal Lookup**: Search and find research papers by journal names
- **Filtered Journal Search**: Advanced filtering capabilities for research papers
- **Distribution Analysis**: Visual analytics showing category and country distributions
- **Modern UI**: Built with React and Tailwind CSS for a responsive design
- **Interactive Charts**: Data visualization using Recharts library

## Technologies Used

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 6.22.1
- **Charts**: Recharts 2.15.3
- **Icons**: Lucide React 0.330.0
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ml-research-paper-webapp.git
cd ml-research-paper-webapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CategoryDistribution.js
│   └── CountryDistribution.js
├── pages/              # Main application pages
│   ├── DistributionAnalysis.js
│   ├── FilteredJournalSearch.js
│   └── JournalLookup.js
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## Features Overview

### Journal Lookup
Search for research papers by journal names with real-time results.

### Filtered Journal Search
Advanced search functionality with multiple filtering options for research papers.

### Distribution Analysis
Interactive visualizations showing:
- Category distribution of research papers
- Geographic distribution by country
- Statistical insights and trends

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Create React App
- Styled with Tailwind CSS
- Charts powered by Recharts
- Icons from Lucide React 