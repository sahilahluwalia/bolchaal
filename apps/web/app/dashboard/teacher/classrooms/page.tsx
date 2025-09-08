export default function TeacherClassroomsPage() {
  // Mock data - in a real app, this would come from your API
  const classrooms = [
    {
      id: "1",
      name: "Mathematics 101",
      description: "Introduction to Algebra and Geometry",
      studentCount: 25,
      createdAt: "2024-01-15",
      isActive: true,
    },
    {
      id: "2",
      name: "Physics Lab",
      description: "Practical Physics Experiments",
      studentCount: 18,
      createdAt: "2024-01-20",
      isActive: true,
    },
    {
      id: "3",
      name: "Chemistry Basics",
      description: "Fundamental Chemistry Concepts",
      studentCount: 22,
      createdAt: "2024-02-01",
      isActive: false,
    },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classrooms</h1>
            <p className="text-gray-600">Manage your classroom spaces and student enrollments</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Classroom
          </button>
        </div>

        {/* Classroom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {classrooms.map((classroom) => (
            <div key={classroom.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {classroom.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{classroom.description}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span className="truncate">{classroom.studentCount} students</span>
                      </span>
                    </div>
                  </div>
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${
                    classroom.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {classroom.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {classrooms.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No classrooms</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first classroom.</p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Classroom
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
