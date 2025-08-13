import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option...", 
  className = "",
  padding = "px-4 py-3",
  textSize = "text-base",
  disabled = false,
  label = null,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const getOptionValue = (option) => option?.value ?? option?.id ?? option;
  const getOptionLabel = (option) => option?.label ?? option?.name ?? option;

  const selectedLabel = (() => {
    if (!Array.isArray(options)) return "";
    const match = options.find((opt) => getOptionValue(opt) === value);
    return match ? getOptionLabel(match) : "";
  })();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full ${padding} ${textSize} text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className={selectedLabel ? 'text-gray-800' : 'text-gray-400'}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {Array.isArray(options) && options.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              const isSelected = value === optionValue;
              return (
                <button
                  key={String(optionValue)}
                  type="button"
                  onClick={() => {
                    onChange(optionValue);
                    setIsOpen(false);
                  }}
                  className={`w-full ${textSize} px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {optionLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown; 