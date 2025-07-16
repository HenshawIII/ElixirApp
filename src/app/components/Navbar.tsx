'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import supabase from '../supabase';
import { useState } from 'react';

const Navbar = () => {
  const { user, loading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutModal(false);
  };

  return (
    <nav className="bg-transparent shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-500">
              Elixir
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href={user ? "/create" : "/auth/signup"} className="btn-secondary btn">
              {user ? "Create Post" : "Signup"}
            </Link>
            
            {user ? (
              <>
                <Link href="/profile" className="btn-secondary btn">
                  Profile
                </Link>
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="btn-primary btn"
                >
                  Logout
                </button>
                {showLogoutModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full">
                      <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
                      <p className="mb-6">Are you sure you want to log out?</p>
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowLogoutModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleLogout}
                        >
                          Yes, Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link href="/auth/login" className="btn-primary btn">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
