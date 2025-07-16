'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import supabase from '../../../supabase';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserProfilePage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

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
        .select('*, UserProfile!inner(imageUrl, user_id, username)')
        .eq('author', userId)
        .order('id', { ascending: false });
      setPosts(postsData || []);
      setLoading(false);
    };
    fetchProfileAndPosts();
  }, [userId]);

  const handleLike = async (post: any) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (post.likes && post.likes.includes(user.id)) return; // Already liked
    setLikeLoading(post.id);
    const newLikes = post.likes ? [...post.likes, user.id] : [user.id];
    const { error } = await supabase
      .from('Posts')
      .update({ likes: newLikes })
      .eq('id', post.id);
    setLikeLoading(null);
    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likes: newLikes } : p
        )
      );
    }
  };

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
              posts.map((post) => {
                const liked = user && post.likes && post.likes.includes(user.id);
                return (
                  <div key={post.id} className="mb-6 p-4 border rounded-lg shadow bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      {post.UserProfile && post.UserProfile.imageUrl && (
                        <img
                          src={post.UserProfile.imageUrl}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 hover:scale-105 transition-transform"
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      <h1 className="font-bold text-lg m-0">{post.UserProfile?.username}</h1>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <h3 className="text-gray-800 dark:text-gray-200 mt-1 mb-2 flex-1">{post.Text}</h3>
                      {post.Image && (
                        <img src={post.Image} alt={post.Text} className="max-w-xs mt-2 rounded-lg border flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className={`focus:outline-none ${liked ? 'text-red-500' : 'text-gray-400'} hover:text-red-400 transition-colors`}
                        onClick={() => handleLike(post)}
                        disabled={likeLoading === post.id}
                        aria-label="Like post"
                      >
                        <FaHeart size={20} />
                      </button>
                      <span className="text-sm text-gray-600">{post.likes ? post.likes.length : 0}</span>
                    </div>
                  </div>
                );
              })
            )}
            {showLoginModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full">
                  <h2 className="text-lg font-semibold mb-4">Login Required</h2>
                  <p className="mb-6">You must be logged in to like posts.</p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowLoginModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowLoginModal(false);
                        router.push('/auth/login');
                      }}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
