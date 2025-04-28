import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom' // Import useLocation

// Define flag options centrally
const flagOptions = ['General', 'Question', 'Build', 'News', 'Discussion'];

function CreatePost({ onSubmit }) {
  const navigate = useNavigate()
  const location = useLocation(); // Get location object

  const [model, setModel] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [flag, setFlag] = useState(flagOptions[0]);
  const [secretKey, setSecretKey] = useState('');
  // Pre-fill repostId from location state if available
  const [repostId, setRepostId] = useState(location.state?.repostId || '');

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0])
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Add validation for secret key
    if (!model.trim() || !description.trim() || !secretKey.trim()) {
        alert('Please fill in Model, Description, and Secret Key.');
        return;
    }

    // Optional: Add validation if repostId is entered but not a valid format (e.g., number)
    // Remove parseInt for UUIDs. Basic check if it's not empty.
    const repostIdValue = repostId.trim() ? repostId.trim() : null;
    // Optional: Add more robust UUID validation here if needed, but Supabase will validate on insert.
    // if (repostId.trim() && !isValidUUID(repostId.trim())) { // Example validation function
    //     alert('Invalid Repost ID format. Please enter a valid UUID or leave it blank.');
    //     return;
    // }

    setUploading(true)
    let image_url = null

    if (imageFile) {
      try {
        if (imageFile.size > 1024 * 1024) {
          throw new Error('Image size is too large. Please use an image smaller than 1MB.')
        }
        const base64Image = await convertToBase64(imageFile)
        image_url = base64Image
        console.log('Image converted to base64')
      } catch (error) {
        console.error('Error processing image:', error)
        alert('Image processing failed: ' + error.message)
        setUploading(false)
        return
      }
    }

    try {
      await onSubmit({
        model,
        description,
        image_url,
        flag,
        secret_key: secretKey,
        repost_id: repostIdValue // Include repost ID (null if empty)
      })
      // No need to reset state here as we navigate away
      setUploading(false)
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post: ' + error.message)
      setUploading(false)
    }
  }

  return (
    // Apply dark mode styles to container (though App.jsx handles main bg)
    <div className="max-w-2xl mx-auto text-gray-900 dark:text-gray-100">
       {/* Apply dark mode text color */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create New Car Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
           {/* Apply dark mode text color */}
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Car Model
          </label>
          <input
            type="text"
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
             // Base styles handle dark mode via index.css
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            placeholder="E.g., Toyota Camry 2023"
            required
          />
        </div>

        <div>
           {/* Apply dark mode text color */}
          <label htmlFor="flag" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Post Flag
          </label>
          <select
            id="flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
             // Base styles handle dark mode via index.css
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            required
          >
            {flagOptions.map(option => (
              // Add dark mode background for options if needed, though browser default might suffice
              <option key={option} value={option} className="bg-white dark:bg-gray-700">{option}</option>
            ))}
          </select>
        </div>

        <div>
           {/* Apply dark mode text color */}
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
             // Base styles handle dark mode via index.css
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            placeholder="Write a detailed description of the car..."
            required
          />
        </div>

        <div>
           {/* Apply dark mode text color */}
          <label htmlFor="car-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Car Image (optional)
          </label>
          <input
            type="file"
            id="car-image"
            accept="image/*"
            onChange={handleImageChange}
             // Base styles handle dark mode via index.css, but add specific text color
            className="mt-1 block w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 dark:file:bg-red-900 file:text-red-700 dark:file:text-red-300 hover:file:bg-red-100 dark:hover:file:bg-red-800"
          />
           {/* Apply dark mode text color */}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Max file size: 1MB</p>
        </div>

        {/* Secret Key Input */}
        <div>
          <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Secret Key (for editing/deleting)
          </label>
          <input
            type="password" // Use password type to mask input
            id="secretKey"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            placeholder="Enter a secret key"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Remember this key! You'll need it to edit or delete this post.</p>
        </div>

        {/* Repost ID Input (Optional) */}
        <div>
          <label htmlFor="repostId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Repost Original Post ID (Optional)
          </label>
          <input
            type="text" // Change back to text for UUID
            id="repostId"
            value={repostId}
            onChange={(e) => setRepostId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            placeholder="Enter UUID of the post you are reposting (or click Repost button on a post)"
            readOnly={!!location.state?.repostId} // Make read-only if pre-filled
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">If you are reposting another car, enter its ID here or use the Repost button on the post.</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
             // Apply dark mode styles for button text
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
             // Apply dark mode styles for button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
            disabled={uploading}
          >
            {uploading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost