import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    speed: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle crewmate creation here
    console.log('Creating crewmate:', formData)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <nav className="fixed left-0 top-0 h-full w-48 bg-gray-800 p-4">
        <div className="space-y-4">
          <button className="text-white hover:text-gray-300">Create a Crewmate!</button>
          <button className="text-white hover:text-gray-300">Crewmate Gallery</button>
        </div>
      </nav>

      <main className="ml-48">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Create a New Crewmate</h1>
          
          <div className="flex justify-center mb-8">
            <img src="/crewmates.png" alt="Crewmates" className="h-24" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-700 p-6 rounded-lg">
                <label className="block text-xl mb-2">Name:</label>
                <input
                  type="text"
                  placeholder="Enter crewmate's name"
                  className="w-full bg-gray-600 rounded p-2 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="bg-gray-700 p-6 rounded-lg">
                <label className="block text-xl mb-2">Speed (mph):</label>
                <input
                  type="number"
                  placeholder="Enter speed in mph"
                  className="w-full bg-gray-600 rounded p-2 text-white"
                  value={formData.speed}
                  onChange={(e) => setFormData({...formData, speed: e.target.value})}
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              >
                Create Crewmate
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
