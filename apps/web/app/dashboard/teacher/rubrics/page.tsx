export default function TeacherRubricsPage() {
  // Mock data - in a real app, this would come from your API
  const rubrics = [
    {
      id: "1",
      title: "Mathematics Problem Solving",
      classroom: "Mathematics 101",
      criteriaCount: 4,
      isActive: true,
      createdAt: "2024-01-15",
      lastUsed: "2024-01-20",
    },
    {
      id: "2",
      title: "Physics Lab Report",
      classroom: "Physics Lab",
      criteriaCount: 6,
      isActive: true,
      createdAt: "2024-01-18",
      lastUsed: "2024-01-22",
    },
    {
      id: "3",
      title: "Chemistry Experiment",
      classroom: "Chemistry Basics",
      criteriaCount: 5,
      isActive: false,
      createdAt: "2024-02-01",
      lastUsed: "2024-02-05",
    },
  ];

  const criteria = [
    { name: "Understanding", weight: 30 },
    { name: "Accuracy", weight: 25 },
    { name: "Presentation", weight: 20 },
    { name: "Creativity", weight: 15 },
    { name: "Effort", weight: 10 },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rubrics</h1>
            <p className="text-gray-600">Create and manage evaluation rubrics for your assignments</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Rubric
          </button>
        </div>

        {/* Rubrics List */}
        <div className="space-y-6">
          {rubrics.map((rubric) => (
            <div key={rubric.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {rubric.title}
                    </h3>
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${
                      rubric.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {rubric.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="truncate">{rubric.classroom}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{rubric.criteriaCount} criteria</span>
                    </span>
                  </div>

                  {/* Sample Criteria Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Criteria Preview:</h4>
                    <div className="flex flex-wrap gap-2">
                      {criteria.slice(0, 3).map((criterion, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                        >
                          {criterion.name} ({criterion.weight}%)
                        </span>
                      ))}
                      {criteria.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md">
                          +{criteria.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:min-w-[200px]">
                  <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 transition-colors">
                    Edit Rubric
                  </button>
                  <button className="flex-1 px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                    Use in Assignment
                  </button>
                  <button className="px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {rubrics.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rubrics</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first evaluation rubric to get started.</p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Rubric
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
