'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import supabase from '../supabase';
import { useState } from 'react';
import { FaBars, FaTimes, FaPlus } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

const navLinkClasses =
  'block md:inline px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-800 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400';
const activeLinkClasses =
  'underline underline-offset-4';

const Navbar = () => {
  const { user, loading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    setSidebarOpen(false);
  };

  const navLinks = (
    <>
      <Link
        href={user ? "/create" : "/auth/signup"}
        className={
          navLinkClasses +
          (pathname === (user ? "/create" : "/auth/signup") ? ' ' + activeLinkClasses : '')
        }
        onClick={() => setSidebarOpen(false)}
      >
        {user ? (
          <span className="flex items-center gap-2">
           Create <FaPlus className="inline-block" /> 
          </span>
        ) : (
          'Signup'
        )}
      </Link>
      {user ? (
        <>
          <Link
            href="/profile"
            className={
              navLinkClasses + (pathname === "/profile" ? ' ' + activeLinkClasses : '')
            }
            onClick={() => setSidebarOpen(false)}
          >
            Profile
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className={
              navLinkClasses +
              ' text-left md:text-center bg-red-50 dark:bg-red-900 hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200'
            }
            style={{ width: '100%' }}
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          href="/auth/login"
          className={
            navLinkClasses + (pathname === "/auth/login" ? ' ' + activeLinkClasses : '')
          }
          onClick={() => setSidebarOpen(false)}
        >
          Login
        </Link>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-transparent shadow-sm hidden md:block">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-500">
                Elixir
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              {navLinks}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-transparent shadow-sm">
        <Link href="/" className="text-2xl font-bold text-blue-500">
          Elixir
        </Link>
        <button onClick={() => setSidebarOpen(true)} className="text-2xl focus:outline-none">
          <FaBars />
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-2xl font-bold text-blue-500" onClick={() => setSidebarOpen(false)}>
            Elixir
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-2xl focus:outline-none">
            <FaTimes />
          </button>
        </div>
        <div className="flex flex-col space-y-2 px-4 py-6">
          {navLinks}
        </div>
      </aside>

      {/* Logout Modal */}
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
  );
};

export default Navbar;
