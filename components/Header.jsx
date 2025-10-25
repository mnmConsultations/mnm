/**
 * Header Component
 * 
 * Main navigation header with authentication integration
 * Responsive design with mobile menu
 * 
 * Features:
 * - Desktop navigation with all main pages
 * - Mobile hamburger menu with slide-down navigation
 * - User authentication state display
 * - User dropdown menu with dashboard access and logout
 * - Sticky positioning for persistent navigation
 * 
 * Navigation Links:
 * - Home, Services, Packages, About Us, FAQ
 * - Conditional: Dashboard (authenticated users only)
 * 
 * Authentication Integration:
 * - useLoggedInUser hook: Fetches current user data
 * - useSignOut hook: Handles logout functionality
 * - Shows user avatar with first initial when logged in
 * - Displays Sign In/Get in touch buttons when logged out
 * 
 * User Avatar Dropdown:
 * - Shows user's full name
 * - Dashboard link
 * - Logout button
 * 
 * Mobile Menu:
 * - Toggles with hamburger icon
 * - Full navigation stack
 * - Separate Sign In/Sign Up buttons
 * - Smooth animation on open
 * 
 * Styling:
 * - Dark blue theme (bg-blue-950)
 * - Sticky header (z-50)
 * - DaisyUI dropdown components
 * - Lucide icons for UI elements
 */
"use client"

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";
import { useLoggedInUser, useSignOut } from "../lib/hooks/auth.hooks";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: user, isLoading } = useLoggedInUser();
  const { mutate: signOut } = useSignOut();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-blue-950 shadow-sm sticky top-0 z-50">
      <div className=" max-w-7xl mx-auto px-4 flex justify-between items-center py-4">
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/MnMLogo-removebg-preview.png"
            alt="M&M Consultations Logo"
            className="h-10 md:h-13"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="nav-link text-white">
            Home
          </Link>
          <Link href="/services" className="nav-link text-white">
            Services
          </Link>
          <Link href="/packages" className="nav-link text-white">
            Packages
          </Link>
          <Link href="/about" className="nav-link text-white">
            About Us
          </Link>
          <Link href="/faq" className="nav-link text-white">
            FAQ
          </Link>
          {/* <Link href="/resources" className="nav-link text-white">Resources</Link> */}
          {/* <Link href="/blog" className="nav-link text-white">Blog</Link> */}
          {/* <Link href="/contact" className="nav-link text-white">
            Contact
          </Link> */}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {!isLoading && user ? (
            <div className="flex items-center space-x-4">
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-8 rounded-full bg-white text-blue-950 flex items-center justify-center">
                    {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  <li className="menu-title">
                    <span>{user.firstName} {user.lastName}</span>
                  </li>
                  <li>
                    <Link href="/dashboard">
                      <User size={16} />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <a onClick={handleSignOut}>
                      <LogOut size={16} />
                      Logout
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/signin" className="btn btn-ghost text-white">
                Sign In
              </Link>
              <Link href="/contact" className="btn text-neutrals">
                Get in touch
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-[#1a2a47]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#0c1425] border-t border-[#2a3a57] py-4 animate-fade-in">
          <nav className=" flex flex-col space-y-4">
            <Link
              href="/"
              className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
            >
              Services
            </Link>
            <Link
              href="/packages"
              className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
            >
              Packages
            </Link>
            <Link
              href="/about"
              className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
            >
              About Us
            </Link>
            <Link
              href="/faq"
              className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
            >
              FAQ
            </Link>
            
            {!isLoading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded flex items-center"
                >
                  <User size={16} className="mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded flex items-center text-left w-full"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
                >
                  Sign Up
                </Link>
              </>
            )}
            
            {/* <Link
              href="/resources"
              className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
            >
              Resources
            </Link>
            <Link
              href="/blog"
              className="nav-link px-4 py-2 hover:bg-[#1a2a47] text-white rounded"
            >
              Blog
            </Link> */}
            <Link
              href="/contact"
              className="btn px-4 py-2 m-2 hover:bg-[#1a2a47] text-neutral rounded"
            >
              Get in touch
            </Link>
            {/* <Link
              href="/agent-portal"
              className="nav-link-active px-4 py-2 hover:bg-[#1a2a47] text-[#a9c1e5] rounded"
            >
              Agent Portal
            </Link>
            <Link
              href="/checklist"
              className="px-4 py-2 bg-[#4e6690] text-white hover:bg-[#6d84ae] text-center rounded"
            >
              Start Your Checklist
            </Link> */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
