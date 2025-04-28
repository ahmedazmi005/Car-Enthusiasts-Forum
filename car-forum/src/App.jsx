import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import CreatePost from './components/CreatePost'
import PostDetail from './components/PostDetail'
import EditPost from './components/EditPost'
import { supabase } from './supabaseClient'

function App() {
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState('newest') // 'newest', 'oldest', 'upvotes'
  const [searchTerm, setSearchTerm] = useState('')
  const [flagFilter, setFlagFilter] = useState('All')
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    // Check saved preference, or system preference, default to light
    return savedMode === 'true' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Effect to apply the dark mode class to <html> and save preference
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch cars from Supabase
  const fetchCars = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*') // '*' already selects all columns, including repost_id if it exists
      
      console.log('Fetched data:', data)
      
      if (error) {
        console.error('Error fetching cars:', error)
        setCars([])
        setFilteredCars([])
      } else if (data) {
        const processedData = data.map(car => ({
          ...car,
          upvotes: car.upvotes || 0,
          flag: car.flag || 'General', // Ensure flag has a default value
          repost_id: car.repost_id || null // Ensure repost_id is included
        }))
        
        setCars(processedData)
        applySortAndFilter(processedData, sortOption, searchTerm, flagFilter)
      }
    } catch (e) {
      console.error('Exception when fetching cars:', e)
      setCars([])
      setFilteredCars([])
    } finally {
      setLoading(false)
    }
  }

  // Apply sorting and filtering
  const applySortAndFilter = (carsData, sort, search, flag) => {
    if (!Array.isArray(carsData)) {
      console.error('Invalid cars data for filtering', carsData)
      setFilteredCars([])
      return
    }
    
    let result = [...carsData]
    console.log('Initial data for filtering:', result.length, 'cars')
    
    // Apply search filter
    if (search) {
      result = result.filter(car => 
        car.model && car.model.toLowerCase().includes(search.toLowerCase())
      )
      console.log('After search filter:', result.length, 'cars')
    }

    // Apply flag filter
    if (flag && flag !== 'All') {
      result = result.filter(car => car.flag === flag)
      console.log('After flag filter:', result.length, 'cars')
    }
    
    // Apply sorting
    try {
      switch (sort) {
        case 'newest':
          result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          break
        case 'oldest':
          result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          break
        case 'upvotes':
          result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
          break
        default:
          result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
    } catch (e) {
      console.error('Error while sorting:', e)
    }
    
    console.log('Final filtered data:', result.length, 'cars')
    setFilteredCars(result)
  }

  // Handle sort change
  const handleSortChange = (option) => {
    setSortOption(option)
    applySortAndFilter(cars, option, searchTerm, flagFilter)
  }
  
  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
    applySortAndFilter(cars, sortOption, term, flagFilter)
  }

  // Handle flag filter change
  const handleFlagFilterChange = (flag) => {
    setFlagFilter(flag)
    applySortAndFilter(cars, sortOption, searchTerm, flag)
  }

  useEffect(() => {
    fetchCars()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Initial fetch

  // Upvote a car
  const upvoteCar = async (carId) => {
    try {
      // Find the index in both arrays
      const carIndex = cars.findIndex(c => c.id === carId);
      const filteredCarIndex = filteredCars.findIndex(c => c.id === carId);
      if (carIndex === -1) return;

      const currentUpvotes = cars[carIndex].upvotes || 0;
      const newUpvotes = currentUpvotes + 1;

      // Optimistically update the UI first
      const updatedCars = [...cars];
      updatedCars[carIndex] = { ...updatedCars[carIndex], upvotes: newUpvotes };
      setCars(updatedCars);

      if (filteredCarIndex !== -1) {
        const updatedFilteredCars = [...filteredCars];
        updatedFilteredCars[filteredCarIndex] = { ...updatedFilteredCars[filteredCarIndex], upvotes: newUpvotes };
        // Re-apply sorting to the filtered list if needed, especially if sorting by upvotes
        applySortAndFilter(updatedFilteredCars, sortOption, searchTerm, flagFilter);
        // setFilteredCars(updatedFilteredCars); // applySortAndFilter handles setting filteredCars
      } else {
        // If not in filtered list, just update the main list
         applySortAndFilter(updatedCars, sortOption, searchTerm, flagFilter);
      }

      // Then, update the database
      const { error } = await supabase
        .from('cars')
        .update({ upvotes: newUpvotes })
        .eq('id', carId)
        
      if (error) {
        console.error('Error upvoting car:', error);
        // Revert UI changes on error
        alert('Failed to upvote. Please try again.');
        const revertedCars = [...cars];
        revertedCars[carIndex] = { ...revertedCars[carIndex], upvotes: currentUpvotes };
        setCars(revertedCars);

        if (filteredCarIndex !== -1) {
          const revertedFilteredCars = [...filteredCars];
          revertedFilteredCars[filteredCarIndex] = { ...revertedFilteredCars[filteredCarIndex], upvotes: currentUpvotes };
          applySortAndFilter(revertedFilteredCars, sortOption, searchTerm, flagFilter);
          // setFilteredCars(revertedFilteredCars);
        } else {
           applySortAndFilter(revertedCars, sortOption, searchTerm, flagFilter);
        }
        return;
      }
      
      // No need to call fetchCars() anymore
      // fetchCars()
    } catch (e) {
      console.error('Exception when upvoting:', e)
      // Consider reverting UI changes here as well if needed
      alert('An error occurred while upvoting.');
    }
  }

  // Delete a car - now requires secret key validation
  const deleteCar = async (carId, secretKey) => {
    try {
      // 1. Fetch the car to get its actual secret key
      const { data: car, error: fetchError } = await supabase
        .from('cars')
        .select('secret_key')
        .eq('id', carId)
        .single();

      if (fetchError) {
        console.error('Error fetching car for deletion validation:', fetchError);
        alert('Could not verify secret key. Deletion failed.');
        return;
      }

      if (!car) {
        alert('Car not found. Deletion failed.');
        return;
      }

      // 2. Compare the provided key with the stored key
      if (car.secret_key !== secretKey) {
        alert('Incorrect secret key. Deletion failed.');
        return; // Stop deletion if keys don't match
      }

      // 3. Proceed with deletion if keys match
      const { error: deleteError } = await supabase.from('cars').delete().eq('id', carId)

      if (deleteError) {
        console.error('Error deleting car:', deleteError)
        alert('Failed to delete car after key verification.');
        return
      }

      fetchCars() // Refresh the list
    } catch (e) {
      console.error('Exception when deleting:', e)
      alert('An unexpected error occurred during deletion.');
    }
  }

  // Edit a car - validation now happens in EditPost component, but could add server-side check here too
  const editCar = async (carId, updatedCar, secretKey) => { // Receive secretKey
    // Optional: Add server-side validation here as well for extra security
    // Similar fetch and compare logic as in deleteCar could be added
    // For now, assuming validation primarily happens in EditPost.jsx
    try {
      const { error } = await supabase.from('cars').update(updatedCar).eq('id', carId)

      if (error) {
        console.error('Error updating car:', error)
        alert('Failed to update car.'); // Provide user feedback
        return
      }

      fetchCars() // Refresh the list
    } catch (e) {
      console.error('Exception when editing:', e)
      alert('An unexpected error occurred during editing.');
    }
  }

  // Add a car (called from CreatePost) - Ensure secret_key is included
  const addCar = async (car) => {
    // The `car` object from CreatePost now includes `secret_key`
    try {
      console.log('Adding new car with secret key:', car)
      const { data, error } = await supabase.from('cars').insert([car])

      if (error) {
        console.error('Error adding car:', error)
        alert('Failed to add car.'); // Provide user feedback
        return
      }

      console.log('Add result:', data)
      fetchCars() // Refresh the list
    } catch (e) {
      console.error('Exception when adding car:', e)
      alert('An unexpected error occurred while adding the car.');
    }
  }

  return (
    <Router>
      {/* Apply dark mode background to the main container */}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Navbar
          searchTerm={searchTerm}
          onSearch={handleSearch}
          darkMode={darkMode} // Pass state
          toggleDarkMode={toggleDarkMode} // Pass handler
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    cars={filteredCars}
                    onUpvote={upvoteCar}
                    loading={loading}
                    sortOption={sortOption}
                    onSortChange={handleSortChange}
                    flagFilter={flagFilter}
                    onFlagFilterChange={handleFlagFilterChange}
                  />
                }
              />
              <Route
                path="/create"
                element={<CreatePost onSubmit={addCar} />} // addCar now handles secret_key
              />
              <Route
                path="/post/:id"
                element={
                  <PostDetail
                    cars={cars}
                    onDelete={deleteCar} // deleteCar now requires secret key
                    onUpvote={upvoteCar}
                    fetchCars={fetchCars}
                  />
                }
              />
              <Route
                path="/edit/:id"
                element={
                  <EditPost
                    onSubmit={editCar} // editCar now receives secret key
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App