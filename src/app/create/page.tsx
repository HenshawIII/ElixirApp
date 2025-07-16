'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import supabase from '../supabase';
import { toast } from 'react-hot-toast';

const Page = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const uploadImage = async (img: File) => {
    const filePath = `${img.name}-${Date.now()}`;
    const { data, error } = await supabase.storage.from('taskimages').upload(filePath, img);
    if (error) {
      console.error('Image error', error);
      return '';
    }
    const { data: imgdata } = await supabase.storage.from('taskimages').getPublicUrl(filePath);
    return imgdata.publicUrl || '';
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImage(image);
        if (!imageUrl) {
          setError('Image upload failed.');
          setSubmitting(false);
          return;
        }
      }
      const { error: postError } = await supabase.from('Posts').insert([
        {
          Text: text,
          Image: imageUrl,
          author: user.id,
          likes: [],
        },
      ]);
      if (postError) {
        console.log(postError);
        setError(postError.message || 'Failed to create post.');
        toast.error(postError.message || 'Failed to create post.');
        setSubmitting(false);
        return;
      }
      setSuccess('Post created successfully!');
      toast.success('Post created successfully!');
      setText('');
      setImage(null);
      // Optionally redirect or refresh
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      toast.error('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8 p-4 border rounded">
      <div>
        <label htmlFor="text" className="block mb-1 font-medium">Text</label>
        <input
          id="text"
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="input"
          required
        />
      </div>
      <div>
        <label htmlFor="image" className="block mb-1 font-medium">Image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
          className="input"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
    </form>
    {image && <img src={URL.createObjectURL(image)} alt="Uploaded" className="w-full h-auto" />}
    </>
  );
};

export default Page;