import { Link } from 'react-router-dom'
import { useState } from 'react' // Removed useEffect as it wasn't used

// Simple Sun and Moon Icons (can be replaced with SVGs)
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591" />
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);


function Navbar({ searchTerm, onSearch, darkMode, toggleDarkMode }) { // Receive props
  const [search, setSearch] = useState(searchTerm)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(search)
  }

  return (
    // Apply dark mode styles to Navbar
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4">
          <Link to="/" className="flex items-center text-xl font-bold text-gray-800 dark:text-gray-100 space-x-2 mb-4 md:mb-0">
            <span role="img" aria-label="car">🚗</span>
            <span>Car Enthusiasts Forum</span>
          </Link>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="w-full md:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cars by model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  // Apply dark mode styles to input
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 transition-colors duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {/* Hidden submit button for accessibility/enter key submission */}
                <button type="submit" className="hidden">Search</button>
              </div>
            </form>

            {/* Create Post Link */}
            <Link
              to="/create"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full md:w-auto text-center transition-colors duration-200"
            >
              Share Your Car
            </Link>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar