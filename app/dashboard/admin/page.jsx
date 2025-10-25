/**
 * Admin Dashboard Page
 * /dashboard/admin
 * 
 * Admin-only dashboard for content and user management
 * Protected route requiring admin role authentication
 * 
 * Features:
 * - Tab-based interface (Home/Content)
 * - User management (Home tab)
 * - Task & Category management (Content tab)
 * - Logout functionality
 * - Link back to main website
 * 
 * Tabs:
 * 1. Home Tab (AdminHomeTab):
 *    - User search and package management
 *    - Paid user count display
 *    - User package editing with confirmation
 * 
 * 2. Content Tab (AdminContentTab):
 *    - Category management (CRUD, reordering)
 *    - Task management (CRUD, reordering)
 *    - Batch operations support
 * 
 * Authentication & Authorization:
 * - useLoggedInUser hook fetches current user
 * - Redirects to /auth/signin if not logged in
 * - Redirects to /dashboard/user if non-admin
 * - Only renders for admin role users
 * 
 * Hydration Protection:
 * - isMounted state prevents SSR/client mismatch
 * - Loading spinner during auth check
 * 
 * Navigation:
 * - Logo links to homepage
 * - "Back to Website" button in navbar
 * - User avatar dropdown with logout
 * - Admin badge (error color) on avatar
 * 
 * State Management:
 * - activeTab: Controls which tab content displays
 * - DaisyUI tabs for UI
 * 
 * Security:
 * - Server-side auth also required (middleware)
 * - Client-side check prevents unauthorized UI access
 * - Role verification on every admin API call
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoggedInUser, useSignOut } from '../../../lib/hooks/auth.hooks';
import AdminHomeTab from '../../../components/dashboard/admin/AdminHomeTab';
import AdminContentTab from '../../../components/dashboard/admin/AdminContentTab';

const AdminDashboard = () => {
    const router = useRouter();
    const { data: user, isLoading } = useLoggedInUser();
    const { mutate: signOut } = useSignOut();
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Only check authentication after component is mounted and query is not loading
        if (isMounted && !isLoading) {
            if (!user) {
                router.push('/auth/signin');
            } else if (user.role !== 'admin') {
                router.push('/dashboard/user');
            }
        }
    }, [user, isLoading, router, isMounted]);

    const handleSignOut = () => {
        signOut();
    };

    if (!isMounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Navigation Bar */}
            <header className="bg-blue-950 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <img
                            src="/MnMLogo-removebg-preview.png"
                            alt="M&M Consultations Logo"
                            className="h-10 md:h-13"
                        />
                    </Link>
                    
                    <div className="flex-none gap-2">
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full bg-white text-blue-950 flex items-center justify-center">
                                    {user.firstName?.charAt(0)?.toUpperCase() || 'A'}
                                </div>
                            </div>
                            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                                <li className="menu-title">
                                    <span>{user.firstName} {user.lastName}</span>
                                </li>
                                <li><a onClick={handleSignOut}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome, Admin {user.firstName} {user.lastName}!
                    </h2>
                </div>

                {/* Tabs Navigation */}
                <div className="tabs tabs-boxed mb-6">
                    <a 
                        className={`tab tab-lg ${activeTab === 'home' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        Home
                    </a>
                    <a 
                        className={`tab tab-lg ${activeTab === 'content' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('content')}
                    >
                        Content Management
                    </a>
                </div>

                {/* Tab Content */}
                {activeTab === 'home' && <AdminHomeTab />}
                {activeTab === 'content' && <AdminContentTab />}
            </div>
        </div>
    );
};

export default AdminDashboard;
