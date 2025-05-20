"use client"

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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

        <div className="hidden md:block">
          <button className="btn text-neutrals">
            <Link href="/contact">Get in touch</Link>
          </button>
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
