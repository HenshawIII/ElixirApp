'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import supabase from '../../../supabase';

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchProfileAndPosts = async () => {
      setLoading(true);
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('UserProfile')
        .select('*')
        .eq('user_id', userId)
        .single();
      setProfile(profileData);
      // Fetch user posts
      const { data: postsData } = await supabase
        .from('Posts')
        .select('*')
        .eq('author', userId)
        .order('id', { ascending: false });
      setPosts(postsData || []);
      setLoading(false);
    };
    fetchProfileAndPosts();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">User not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card mb-6 flex flex-col items-center p-6">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-400" />
            ) : (
              <span className="text-6xl mb-4">👤</span>
            )}
            <h1 className="text-2xl font-bold mb-2">{profile.username}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</p>
            <p className="text-gray-800 dark:text-gray-200 text-center">{profile.bio || 'No bio yet.'}</p>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Posts</h2>
            {posts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">This user hasn't made any posts yet.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="mb-4 p-4 border rounded flex flex-col md:flex-row gap-4 items-start bg-white dark:bg-gray-800">
                  <h3 className="text-gray-800 dark:text-gray-200 flex-1">{post.Text}</h3>
                  {post.Image && (
                    <img src={post.Image} alt={post.Text} className="max-w-xs rounded-lg border flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
