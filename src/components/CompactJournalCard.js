const CompactJournalCard = ({ searchResults, handleSelectJournal }) => {
  return (
    <div className="sm:hidden space-y-4">
      {searchResults.map((journal) => (
        <div
          key={journal.journal_id}
          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 cursor-pointer hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-gray-200"
          onClick={() => handleSelectJournal(journal)}
        >
          <div className="space-y-3">
            {/* Title */}
            <div>
              <h4 className="font-medium text-gray-900 text-sm leading-5">
                {journal.title}
              </h4>
            </div>

            {/* Key Info Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full border ${
                  journal.category_letter === "W"
                    ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-amber-200"
                    : journal.category_letter === "X"
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200"
                }`}
              >
                Category {journal.category_letter}
              </span>
              {journal.jpi && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                  JPI: {journal.jpi}
                </span>
              )}
              <span className="text-xs text-gray-600">
                {journal.range_val}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs text-gray-600">
              {(journal.issn || journal.eissn) && (
                <div>
                  <span className="font-medium">ISSN:</span>{" "}
                  {journal.issn || journal.eissn}
                </div>
              )}
              {journal.country_name && (
                <div>
                  <span className="font-medium">Country:</span>{" "}
                  {journal.country_name}
                </div>
              )}
              {journal.subject_area_name && (
                <div className="xs:col-span-2">
                  <span className="font-medium">Subject:</span>{" "}
                  {journal.subject_area_name}
                </div>
              )}
              {journal.publisher_name && (
                <div className="xs:col-span-2">
                  <span className="font-medium">Publisher:</span>{" "}
                  {journal.publisher_name}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompactJournalCard;
