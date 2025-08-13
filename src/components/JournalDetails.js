import { ArrowLeft } from "lucide-react";

const JournalDetails = ({ journal, onBack, variant = "default" }) => {
  if (!journal) return null;

  const isCompact = variant === "compact";

  const formatSubcategories = (subcategories) => {
    if (!subcategories) return "Not Available";
    const categories = subcategories.split(";").map((cat) => cat.trim()).filter((cat) => cat);
    if (categories.length === 0) return "Not Available";
    if (categories.length === 1) return categories[0];
    return categories.map((category, index) => (
      <span key={index} className="inline-block">
        {category}
        {index < categories.length - 1 && (
          <span className="mx-1 text-gray-400">•</span>
        )}
      </span>
    ));
  };

  const getCategoryStyle = (categoryLetter) => {
    switch (categoryLetter?.toUpperCase()) {
      case "W":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-200 shadow-sm";
      case "X":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 shadow-sm";
      case "Y":
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200 shadow-sm";
      default:
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between px-1 items-center mb-2 sm:mb-6">
        <h3 className="font-semibold text-gray-800 text-lg md:text-xl">
          Journal Details
        </h3>
        <button
          onClick={onBack}
          className="flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to Results</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="border border-blue-100 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        {/* Title Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col xs:flex-row xs:items-start gap-2 xs:gap-3 mb-2">
            <h2 className="font-semibold text-gray-800 leading-tight text-lg sm:text-xl md:text-2xl flex items-center">
              {journal.title}
              <span className={`hidden sm:inline-flex font-semibold border flex-shrink-0 ml-3 px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-lg ${getCategoryStyle(journal.category_letter)}`}>
                <span>{`Category ${journal.category_letter}`}</span>
              </span>
            </h2>
            <span className={`sm:hidden inline-flex font-semibold border flex-shrink-0 self-start px-2.5 py-1 text-xs rounded-lg ${getCategoryStyle(journal.category_letter)}`}>
              <span>{`Category ${journal.category_letter}`}</span>
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 ${isCompact ? "" : "lg:grid-cols-3"}`}>
          {/* Column 1 */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">ISSN</p>
              <p className="font-semibold text-sm sm:text-base">
                {journal.issn || "Not Available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">eISSN</p>
              <p className="font-semibold text-sm sm:text-base">
                {journal.eissn || "Not Available"}
              </p>
            </div>
            <div className="pb-0 sm:pb-2.5">
              <p className="text-sm text-gray-500 sm:mb-1.5">
                <span className="hidden sm:inline">Journal Performance Index (JPI)</span>
                <span className="sm:hidden">JPI</span>
              </p>
              <p className="font-bold text-lg sm:text-xl text-blue-600">
                {journal.jpi || "Not Available"}
              </p>
            </div>

            <div className={`hidden sm:inline ${isCompact ? "" : "lg:hidden"}`}>
              <p className="text-sm text-gray-500 mb-1">Subject Subcategories</p>
              <p className="font-semibold text-sm sm:text-base leading-relaxed">
                {formatSubcategories(journal.subcategories)}
              </p>
            </div>

          </div>

          {/* Column 2 */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Subject Area</p>
              <p className="font-semibold text-sm sm:text-base">
                {journal.subject_area_name || "Not Available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Country</p>
              <p className="font-semibold text-sm sm:text-base">
                {journal.country_name || "Not Available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Year</p>
              <p className="font-semibold text-sm sm:text-base">
                {journal.range_val || "Not Available"}
              </p>
            </div>
            
            <div className={`pb-2 sm:pb-0 ${isCompact ? "hidden sm:inline" : "inline lg:hidden"}`}>
              <p className="text-sm text-gray-500 mt-3 sm:mt-4 mb-1">Publisher</p>
              <p className="font-semibold text-sm sm:text-base break-words">
                {journal.publisher_name || "Not Available"}
              </p>
            </div>
            <div className="inline sm:hidden">
              <p className="text-sm text-gray-500 mt-3 sm:mt-4 mb-1">Subject Subcategories</p>
              <div className="font-semibold text-sm sm:text-base leading-relaxed">
                {formatSubcategories(journal.subcategories)}
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className={`space-y-3 sm:space-y-4 hidden ${isCompact ? "" : "lg:block"}`}>
            <div className="pb-2 sm:pb-0">
              <p className="text-sm text-gray-500 mb-1">Publisher</p>
              <p className="font-semibold text-sm sm:text-base break-words">
                {journal.publisher_name || "Not Available"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Subject Subcategories</p>
              <div className="font-semibold text-sm sm:text-base leading-relaxed">
                {formatSubcategories(journal.subcategories)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetails;