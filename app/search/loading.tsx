export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
              <div>
                <div className="h-6 w-48 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-20 h-10 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar Loading */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse"></div>
            <div className="w-20 h-12 bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Results Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1 h-8 bg-gray-700 rounded"></div>
                <div className="flex-1 h-8 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
