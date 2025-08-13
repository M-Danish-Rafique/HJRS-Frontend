import { useState } from 'react';
import { Book, Menu } from 'lucide-react';

export default function Navbar({ currentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/journal-lookup', label: 'Journal Lookup' },
    { href: '/filtered-search', label: 'Advanced Search' },
    { href: '/distribution-analysis', label: 'Distribution Analysis' },
    { href: '/performance-prediction', label: 'Performance Prediction' }
  ];

  const isActivePage = (href) => {
    return currentPage === href;
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-indigo-900 py-4 lg:py-6 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 flex-shrink">
            <Book className="h-5 w-5 lg:h-6 lg:w-6 xl:h-8 xl:w-8 text-white flex-shrink-0" />
            <h1 className="text-base lg:text-lg xl:text-xl font-bold text-white whitespace-nowrap">
              <span className="hidden sm:inline">HEC Journal Recognition System</span>
              <span className="sm:hidden">HEC JRS</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block flex-shrink-0">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a 
                    href={item.href} 
                    className={`text-sm xl:text-base whitespace-nowrap transition-colors ${
                      isActivePage(item.href)
                        ? 'text-white font-medium'
                        : 'text-blue-100 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 transition-colors flex-shrink-0"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-blue-700">
            <nav className="pt-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a 
                      href={item.href} 
                      className={`block px-3 py-2 rounded-md transition-colors ${
                        isActivePage(item.href)
                          ? 'text-white font-medium bg-blue-700'
                          : 'text-blue-100 hover:text-white hover:bg-blue-700'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}