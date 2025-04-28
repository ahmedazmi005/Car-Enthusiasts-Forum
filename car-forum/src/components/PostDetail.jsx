import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import LoadingSpinner from './LoadingSpinner'; // Import the spinner
import RepostedCarSnippet from './RepostedCarSnippet'; // Import the extracted component

// --- SVG Icons ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.13 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const RepostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.091 1.21-.138 2.43-.138 3.662v.513a51.035 51.035 0 0014.676 0v-.513zM19.5 12a51.035 51.035 0 01-14.676 0m14.676 0c.246.03.49.06.73.093a4.006 4.006 0 013.7 3.7 48.656 48.656 0 010 7.324 4.006 4.006 0 01-3.7 3.7c-.24.033-.484.063-.73.093m-14.676 0c-.246-.03-.49-.06-.73-.093a4.006 4.006 0 01-3.7-3.7 48.656 48.656 0 010-7.324 4.006 4.006 0 013.7-3.7c.24-.033.484-.063.73-.093m14.676 0l-3.182 3.182m0 0l-3.182-3.182m3.182 3.182V4.5M4.5 12l3.182-3.182m0 0l3.182 3.182M7.682 8.818V19.5" />
  </svg>
);

const CheckIcon = () => ( // Add Check Icon for Save
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XMarkIcon = () => ( // Add XMark Icon for Cancel
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
// --- End SVG Icons ---

function PostDetail({ cars, onDelete, onUpvote, fetchCars }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [originalSecretKey, setOriginalSecretKey] = useState(''); // Store original post key
  const [editingCommentId, setEditingCommentId] = useState(null); // ID of comment being edited
  const [editingCommentContent, setEditingCommentContent] = useState(''); // Content of comment being edited

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

  const fetchCarAndComments = async () => {
    setLoading(true)
    try {
      // Fetch car details including the secret key and repost_id
      const { data: carData, error: carError } = await supabase
        .from('cars')
        .select('*, secret_key, repost_id') // Ensure repost_id is selected
        .eq('id', id)
        .single()

      if (carError) throw carError
      if (carData) {
          // Include repost_id in the state
          setCar({ ...carData, upvotes: carData.upvotes || 0, flag: carData.flag || 'General', repost_id: carData.repost_id });
          setOriginalSecretKey(carData.secret_key); // Store the secret key
      } else {
          setCar(null);
      }

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('car_id', id)
        .order('created_at', { ascending: false })

      if (commentsError) throw commentsError
      setComments(commentsData || [])

    } catch (error) {
      console.error('Error fetching car details or comments:', error)
      setCar(null) // Reset car state on error
      setComments([]) // Reset comments state on error
      // Optionally navigate away or show an error message
      // navigate('/');
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCarAndComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]) // Depend only on ID

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const commentSecretKey = prompt('Set a secret key for this comment (to edit/delete later):');
    if (!commentSecretKey) {
        alert('Secret key is required to post a comment.');
        return; // Don't proceed if the user cancels or enters nothing
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{ car_id: id, content: newComment, secret_key: commentSecretKey }]) // Add secret_key

      if (error) throw error

      setNewComment('')
      fetchCarAndComments() // Refetch comments after adding
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment.')
    }
  }

  // --- Comment Edit Functions ---
  const handleEditComment = async (comment) => {
    const enteredKey = prompt(`Enter the secret key for comment: "${comment.content.substring(0, 30)}..."`);
    if (enteredKey === null) return; // User cancelled

    // Fetch the comment again to securely get the secret key
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('secret_key')
            .eq('id', comment.id)
            .single();

        if (error) throw error;

        if (data && enteredKey === data.secret_key) {
            setEditingCommentId(comment.id);
            setEditingCommentContent(comment.content);
        } else {
            alert('Incorrect secret key.');
        }
    } catch (error) {
        console.error('Error verifying comment secret key:', error);
        alert('Could not verify secret key.');
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editingCommentContent.trim()) {
        alert("Comment cannot be empty.");
        return;
    }
    try {
        const { error } = await supabase
            .from('comments')
            .update({ content: editingCommentContent })
            .eq('id', commentId);

        if (error) throw error;

        setEditingCommentId(null);
        setEditingCommentContent('');
        fetchCarAndComments(); // Refetch to show updated comment
    } catch (error) {
        console.error('Error updating comment:', error);
        alert('Failed to update comment.');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };
  // --- End Comment Edit Functions ---


  const handleDeleteComment = async (commentId, commentContent) => {
    const enteredKey = prompt(`Enter the secret key to delete comment: "${commentContent.substring(0, 30)}..."`);
    if (enteredKey === null) return; // User cancelled

    try {
        // 1. Verify the secret key
        const { data, error: keyError } = await supabase
            .from('comments')
            .select('secret_key')
            .eq('id', commentId)
            .single();

        if (keyError) throw keyError;

        if (!data || enteredKey !== data.secret_key) {
            alert('Incorrect secret key. Deletion cancelled.');
            return;
        }

        // 2. Delete the comment if key matches
        const { error: deleteError } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)

        if (deleteError) throw deleteError

        fetchCarAndComments() // Refetch comments after deleting
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment.')
    }
  }

  const handleDelete = async () => {
    const enteredKey = prompt('Please enter the secret key to delete this post:');
    if (enteredKey === null) return; // User cancelled prompt

    if (enteredKey !== originalSecretKey) {
        alert('Incorrect Secret Key. Deletion cancelled.');
        return;
    }

    // Confirmation is implicit via the secret key prompt
    // if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await onDelete(id, enteredKey) // Pass the key for validation
      navigate('/')
    } catch (error) {
      console.error('Error deleting post from detail view:', error)
      alert('Failed to delete post.')
    }
  }

  const handleUpvote = async () => {
    if (!car) return;

    const currentUpvotes = car.upvotes || 0;
    const newUpvotes = currentUpvotes + 1;

    // Optimistically update the local state
    setCar({ ...car, upvotes: newUpvotes });

    try {
      // Call the function passed from App.jsx to update the backend and main list
      await onUpvote(car.id);
      // No need to call fetchCarAndComments() here anymore
    } catch (error) {
      // Revert local state if the backend update failed
      console.error("Upvote failed, reverting local state:", error);
      setCar({ ...car, upvotes: currentUpvotes });
      // The alert is handled within the onUpvote function in App.jsx
    }
  };


  if (loading) {
    return <LoadingSpinner />; // Use the spinner component
  }

  if (!car) {
    return <p className="text-gray-600 dark:text-gray-400">Car not found</p>
  }

  return (
    <div className="space-y-8">
      {/* Apply dark mode styles to card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        {/* Display Reposted Content if applicable */}
        {car.repost_id && <RepostedCarSnippet carId={car.repost_id} />}

        <div className="flex justify-between items-start mt-4"> {/* Added mt-4 for spacing after potential repost snippet */}
          <div>
            {/* Apply dark mode text color */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{car.model}</h1>
            {car.flag && (
              <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full border ${getFlagStyle(car.flag)} transition-colors duration-200`}>
                {car.flag}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
             {/* Apply dark mode styles to upvote section */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2 flex items-center transition-colors duration-200">
              <button
                onClick={handleUpvote} // Use the new optimistic handler
                className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 mr-1 transition-colors duration-200"
                title="Upvote this car"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
               {/* Apply dark mode text color */}
              <span className="font-medium text-gray-900 dark:text-gray-100">{car.upvotes || 0}</span>
            </div>
          </div>
        </div>

         {/* Apply dark mode text color */}
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Posted on {new Date(car.created_at).toLocaleDateString()}
        </div>

        {car.image_url && (
          <img
            src={car.image_url}
            alt={car.model}
             // Apply dark mode styles for image background
            className="mt-6 max-h-96 w-full rounded shadow object-contain bg-gray-50 dark:bg-gray-700 transition-colors duration-200"
          />
        )}

        <div className="mt-6">
           {/* Apply dark mode text color */}
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{car.description}</p>
        </div>

         {/* Apply dark mode styles for border */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between items-center space-y-4 sm:space-y-0 transition-colors duration-200">
          {/* Buttons Container - Added items-center */}
          <div className="flex items-center space-x-4">
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="flex items-center text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors duration-200 text-sm font-medium"
            >
              <TrashIcon /> Delete
            </button>

            {/* Edit Link as Button */}
            <Link
              to={`/edit/${car.id}`}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 text-sm font-medium"
            >
              <PencilIcon /> Edit
            </Link>

            {/* Repost Button */}
            <button
              onClick={() => navigate('/create', { state: { repostId: car.id } })}
              className="flex items-center text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200 text-sm font-medium"
            >
              <RepostIcon /> Repost
            </button>
          </div>

           {/* Apply dark mode styles for link text */}
          <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
            Back to all cars
          </Link>
        </div>
      </div>

      {/* Comments Section */}
       {/* Apply dark mode styles to card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
         {/* Apply dark mode text color */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Comments</h2>

        <form onSubmit={handleAddComment} className="mb-6">
          <div className="mb-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
               // Base styles handle dark mode via index.css
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              rows="3"
              required
            ></textarea>
          </div>
          <div className="text-right">
            <button
              type="submit"
               // Apply dark mode styles for button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
            >
              Post Comment
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {/* Corrected Conditional Rendering for Comments */}
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="py-4 border-t border-gray-100 dark:border-gray-700 transition-colors duration-200">
                {editingCommentId === comment.id ? (
                  // --- Edit Mode ---
                  <div>
                    <textarea
                      value={editingCommentContent}
                      onChange={(e) => setEditingCommentContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                      rows="3"
                      required
                    ></textarea>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="flex items-center px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
                      >
                        <CheckIcon /> Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <XMarkIcon /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- Display Mode ---
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                      <div className="flex space-x-2">
                         {/* Edit Button */}
                         <button
                           onClick={() => handleEditComment(comment)} // Pass the whole comment object
                           className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                         >
                           <PencilIcon /> {/* Reuse PencilIcon */}
                         </button>
                         {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteComment(comment.id, comment.content)} // Pass content for prompt
                          className="flex items-center text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                        >
                           <TrashIcon /> {/* Reuse TrashIcon */}
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{comment.content}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail