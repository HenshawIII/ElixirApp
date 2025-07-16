'use client'
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from './supabase';
import { Post } from './types';
import Link from 'next/link';
import Lightning from './components/Lightning';
import BlurText from './components/BlurText';
import TiltedCard from './components/TiltCard';
import Particles from './components/Particles';
import { FaHeart } from 'react-icons/fa';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      // Join Posts.author -> UserProfile.user_id, select imageUrl
      const { data, error } = await supabase
        .from('Posts')
        .select('*, UserProfile!inner(imageUrl, user_id,username)')
        .order('id', { ascending: false });
      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }
      console.log("data",data);
      setPosts(data);
    };
    fetchPosts();
  }, []);

  useEffect(()=>{
    const channel = supabase.channel("posts-channel")
    channel.on('postgres_changes',
      {event:"INSERT",schema:"public",table:"Posts"},
      (payload)=>{
        const newPost = payload.new;
        setPosts(prev=>[newPost,...prev])
      }
    ).subscribe((status)=>{
      console.log("subs:",status)
    })
  },[])

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Particles
    particleColors={['#3b82f6', '#3b82f6']}
    particleCount={200}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center">
              <BlurText text="Welcome to Elixir" className="text-5xl font-bold mb-6 text-white drop-shadow-lg" delay={150} animateBy="words" direction="top" />
              <BlurText text="Connect with others and share your thoughts" className="text-lg mb-4 text-white drop-shadow" delay={200} animateBy="words" direction="top" />
              <div className="flex space-x-4 mt-6 justify-center">
                {/* Add your buttons or links here if needed */}
              </div>
            </div>
          </section>

          <section className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">Explore Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Placeholder for featured communities */}
             
             
            </div>
          </section>

         {posts.map((post) => {
    const liked = user && post.likes && post.likes.includes(user.id);
    return (
      <div key={post.id} className="mb-6 p-4 border rounded-lg shadow bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          {post.UserProfile && post.UserProfile.imageUrl && (
            <Link href={`/user/profile/${post.UserProfile.user_id}`}>
              <img
                src={post.UserProfile.imageUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 hover:scale-105 transition-transform"
                style={{ cursor: 'pointer' }}
              />
            </Link>
          )}
          <Link href={`/user/profile/${post.UserProfile.user_id}`} className="hover:underline text-blue-600 font-semibold">
            <h1 className="font-bold text-lg m-0">{post.UserProfile.username}</h1>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <h3 className="text-gray-800 dark:text-gray-200 mt-1 mb-2 flex-1">{post.Text}</h3>
          {post.Image && (
            <TiltedCard
            imageSrc={post.Image}
            altText={""}
            captionText={post.Text}
            containerHeight="300px"
            containerWidth="300px"
            imageHeight="300px"
            imageWidth="300px"
            rotateAmplitude={12}
            scaleOnHover={1.2}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
           overlayContent={"" }
          />
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
  })}

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
      </main>
    
    </div>
  );
}
