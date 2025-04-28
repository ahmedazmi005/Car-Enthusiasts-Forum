import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Component to display a reposted car snippet
function RepostedCarSnippet({ carId }) {
  const [repostedCar, setRepostedCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepostedCar = async () => {
      if (!carId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('id, model, created_at')
          .eq('id', carId)
          .single();
        if (error) throw error;
        setRepostedCar(data);
      } catch (error) {
        console.error('Error fetching reposted car:', error);
        setRepostedCar(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRepostedCar();
  }, [carId]);

  if (loading) return <div className="text-sm text-gray-500 dark:text-gray-400">Loading reposted content...</div>;
  if (!repostedCar) return null; // Don't render if no repost or fetch failed

  return (
    // Use the same background as the main card for consistency
    <div className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        Reposting from:
      </p>
      <Link to={`/post/${repostedCar.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{repostedCar.model}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Posted on {new Date(repostedCar.created_at).toLocaleDateString()}
        </p>
      </Link>
    </div>
  );
}

export default RepostedCarSnippet;
