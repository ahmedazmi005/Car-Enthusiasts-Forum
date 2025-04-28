import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom' // Import useLocation
import { supabase } from '../supabaseClient'
import LoadingSpinner from './LoadingSpinner'; // Import the spinner

// Define flag options centrally (ensure consistency with CreatePost)
const flagOptions = ['General', 'Question', 'Build', 'News', 'Discussion'];

function EditPost({ onSubmit }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation(); // Use location hook
  const [model, setModel] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [image_url, setImageUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [flag, setFlag] = useState(flagOptions[0]);
  const [loading, setLoading] = useState(true);
  const [secretKey, setSecretKey] = useState(''); // Add state for secret key
  const [originalSecretKey, setOriginalSecretKey] = useState(''); // Store original key

  useEffect(() => {
    setLoading(true);
    const fetchPost = async () => {
      try {
        const { data: post, error } = await supabase
          .from('cars')
          .select('*, secret_key') // Fetch the secret key
          .eq('id', id)
          .single()

        if (error) {
          throw error;
        }

        if (post) {
          setModel(post.model)
          setDescription(post.description)
          setImageUrl(post.image_url)
          setFlag(post.flag || flagOptions[0]);
          setOriginalSecretKey(post.secret_key); // Store the fetched secret key
        } else {
          // Handle case where post is not found
          console.warn('Post not found for editing:', id);
          navigate('/'); // Redirect if post doesn't exist
        }
      } catch (error) {
        console.error('Error fetching post for editing:', error)
        navigate('/') // Redirect on error
      } finally {
        setLoading(false);
      }
    }

    fetchPost()
  }, [id, navigate])

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
        alert('Please fill in Model, Description, and the Secret Key to confirm changes.');
        return;
    }

    // Validate secret key
    if (secretKey !== originalSecretKey) {
        alert('Incorrect Secret Key. Changes not saved.');
        return;
    }

    setUploading(true)
    let newImageUrl = image_url // Keep existing image URL by default

    if (imageFile) {
      try {
        if (imageFile.size > 1024 * 1024) {
          throw new Error('Image size is too large. Please use an image smaller than 1MB.')
        }
        const base64Image = await convertToBase64(imageFile)
        newImageUrl = base64Image
        console.log('Image converted to base64')
      } catch (error) {
        console.error('Error processing image:', error)
        alert('Image processing failed: ' + error.message)
        setUploading(false)
        return
      }
    }

    try {
      // Pass the secret key for validation in the backend/App.jsx if needed, though validation happens here
      await onSubmit(id, {
        model,
        description,
        image_url: newImageUrl,
        flag
        // No need to send secret_key in the update payload unless changing it
      }, secretKey) // Pass secret key for potential validation in App.jsx
      setUploading(false)
      navigate(`/post/${id}`) // Navigate back to the post detail page
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post: ' + error.message)
      setUploading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-2xl mx-auto text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Car Details</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Car Model
          </label>
          <input
            type="text"
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            required
          />
        </div>

        <div>
          <label htmlFor="flag" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Post Flag
          </label>
          <select
            id="flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            required
          >
            {flagOptions.map(option => (
              <option key={option} value={option} className="bg-white dark:bg-gray-700">{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            required
          />
        </div>

        <div>
          <label htmlFor="car-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Car Image (optional)
          </label>
          <input
            type="file"
            id="car-image"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 dark:file:bg-red-900 file:text-red-700 dark:file:text-red-300 hover:file:bg-red-100 dark:hover:file:bg-red-800"
          />
          {image_url && (
            <img
              src={image_url}
              alt={model} // Use model state for alt text
              className="mt-2 max-h-40 rounded shadow object-contain bg-gray-50 dark:bg-gray-700 transition-colors duration-200"
            />
          )}
        </div>

        {/* Secret Key Input for Confirmation */}
        <div>
          <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Secret Key (Confirm to Save Changes)
          </label>
          <input
            type="password"
            id="secretKey"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-600 focus:ring-red-600"
            placeholder="Enter the secret key to save"
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter the secret key you created for this post to save your edits.</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/post/${id}`)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
            disabled={uploading}
          >
            {uploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPost