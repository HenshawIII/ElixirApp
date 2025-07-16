'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import supabase from '../supabase';
import { toast } from 'react-hot-toast';
import { FaHeart } from 'react-icons/fa';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [image, setImage] = useState<File | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [success, setSuccess] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  useEffect(() => {
    if (!user && !loading) {
      router.push('/auth/login');
    }
    // setBio(user?.bio || '');
  }, [user, loading, router]);

  useEffect(()=>{
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('UserProfile')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (!error) setBio(data?.bio || '');
      if (data?.imageUrl) setImage(data.imageUrl);
      if (data?.username) setUsername(data.username);
      setUserProfile(data);
    };
    fetchUserProfile();
  },[user])

  useEffect(() => {
    if (!user) return;
    const fetchUserPosts = async () => {
      const { data, error } = await supabase
        .from('Posts')
        .select('*, UserProfile!inner(imageUrl, user_id, username)')
        .eq('author', user.id)
        .order('id', { ascending: false });
      if (!error) setPosts(data);
    };
    fetchUserPosts();
  }, [user]);

  const handleLogout = () => {
    supabase.auth.signOut();
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = user?.imageUrl || '';
    if (image) {
      // Upload image to Supabase Storage
      const filePath = `${user.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('taskimages').upload(filePath, image);
      if (!uploadError) {
        const { data: urlData } = await supabase.storage.from('taskimages').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }
    }
    const { error } = await supabase
      .from('UserProfile')
      .update({ bio, imageUrl })
      .eq('user_id', user.id);
    if (!error) {
      setSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Optionally refresh user data here
      setUserProfile((prev:any)=> ({ ...prev, bio, imageUrl }));
    
    } else {
      toast.error(error.message);
    }
  };

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

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden">
                {isEditing && image ? (
                  typeof image === 'string' ? (
                    <img src={image} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
                  ) : (
                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-32 h-32 object-cover rounded-full" />
                  )
                ) : userProfile?.imageUrl ? (
                  <img src={userProfile.imageUrl} alt="Profile" className="w-32 h-32 object-cover rounded-full" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-2">{userProfile?.username}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Member since {new Date(userProfile?.created_at).toLocaleDateString()}
                </p>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="mb-4 space-y-2">
                    <textarea
                      className="input mb-2"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others about yourself"
                      rows={3}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                      className="input"
                    />
                    <div className="flex space-x-2">
                      <button type="submit" className="btn btn-primary">Save</button>
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setBio(userProfile?.bio || '');
                          setImage(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="mb-4">
                      {userProfile?.bio || 'No bio yet. Click Edit Profile to add one.'}
                    </p>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  </>
                )}
                {success && <div className="text-green-600 mt-2">{success}</div>}
              </div>
            </div>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
            {posts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">You have not made any posts yet.</p>
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

          {/* <button onClick={handleLogout} className="btn btn-primary mt-4">Logout</button> */}
        </div>
      </main>
      
    </div>
  );
}
