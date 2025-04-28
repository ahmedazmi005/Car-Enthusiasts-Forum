import { Link } from 'react-router-dom'
import LoadingSpinner from './LoadingSpinner'; // Import the spinner
import RepostedCarSnippet from './RepostedCarSnippet'; // Import the repost snippet component

// Function to get flag style based on type (using Tailwind dark variants)
const getFlagStyle = (flag) => {
  const base = 'border';
  switch(flag) {
    case 'Question':
      return `${base} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700`;
    case 'Build':
      return `${base} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700`;
    case 'News':
      return `${base} bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700`;
    case 'Discussion':
      return `${base} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700`;
    default: // General
      return `${base} bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600`;
  }
}

function Home({ 
  cars, 
  onUpvote, 
  loading, 
  sortOption, 
  onSortChange,
  flagFilter, 
  onFlagFilterChange 
}) {
  const flagOptions = ['All', 'General', 'Question', 'Build', 'News', 'Discussion'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        {/* Apply dark mode text color */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span role="img" aria-label="car">🚗</span> Shared Cars
        </h1>
        
        <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-4 sm:items-center">
          {/* Sort Dropdown */}
          <div>
            <label htmlFor="sort-options" className="sr-only">Sort by</label>
            <div className="flex items-center space-x-2">
              {/* Apply dark mode text color */}
              <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
              <select
                id="sort-options"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                // Base styles already handle dark mode via index.css
                className="border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="upvotes">Most upvotes</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Flag Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
           {/* Apply dark mode text color */}
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Filter by:</span>
          {flagOptions.map(option => (
            <button
              key={option}
              onClick={() => onFlagFilterChange(option)}
              // Apply dark mode styles for filter buttons
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out 
                ${flagFilter === option 
                  ? 'bg-red-600 text-white' // Active state remains the same
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {/* Conditional Rendering with Spinner */}
      {loading ? (
        <LoadingSpinner /> // Use the spinner component
      ) : !Array.isArray(cars) ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center transition-colors duration-200">
          <p className="text-gray-600 dark:text-gray-400">Error loading data. Please try again later.</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center transition-colors duration-200">
          <p className="text-gray-600 dark:text-gray-400">No cars found that match your search criteria.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try a different search or be the first to share a car!</p>
        </div>
      ) : (
        // Map over cars only if loading is false and cars is a non-empty array
        cars.map(car => (
          <div key={car.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 transition-colors duration-200"> {/* Adjusted padding */}
            {/* Conditionally render the repost snippet if it's a repost */}
            {car.repost_id && <RepostedCarSnippet carId={car.repost_id} />}
            
            {/* Simplified post layout */}
            <div className={`flex items-center space-x-4 ${car.repost_id ? 'mt-4' : ''}`}> {/* Ensure items are centered vertically */}
              {/* Upvote Section */}
              <div className="flex flex-col items-center space-y-1"> {/* Reduced space */}
                <button
                  onClick={() => onUpvote(car.id)}
                   // Apply dark mode styles for button
                  className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200"
                  title="Upvote this car"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5" // Slightly smaller icon
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                 {/* Apply dark mode text color */}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{car.upvotes || 0}</span>
              </div>

              {/* Title, Time, and Flag Section */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/post/${car.id}`}
                    // Apply dark mode styles for link
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-500 transition-colors duration-200"
                  >
                    {car.model}
                  </Link>
                  {/* Display the flag */}
                  {car.flag && (
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full border ${getFlagStyle(car.flag)} transition-colors duration-200`}>
                      {car.flag}
                    </span>
                  )}
                </div>
                {/* Apply dark mode text color */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Posted on {new Date(car.created_at).toLocaleDateString()}
                </p>
                {/* View Discussion Link */}
                <Link 
                  to={`/post/${car.id}`}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1 block"
                >
                  View Discussion
                </Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Home