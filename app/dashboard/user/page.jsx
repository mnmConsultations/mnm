'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoggedInUser, useSignOut } from '../../../lib/hooks/auth.hooks';
import HomeTab from '../../../components/dashboard/HomeTab';
import TasksTab from '../../../components/dashboard/TasksTab';

const UserDashboard = () => {
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
            } else if (user.role === 'admin') {
                router.push('/dashboard/admin');
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

    if (!user) {
        return null; // Will redirect to signin
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Navigation Bar */}
            <div className="navbar bg-base-100 shadow-lg">
                <div className="flex-1">
                    <h1 className="text-xl font-bold">M&M Consultants - User Dashboard</h1>
                </div>
                <div className="flex-none gap-2">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li>
                                <a className="justify-between">
                                    Profile
                                    <span className="badge">Coming Soon</span>
                                </a>
                            </li>
                            <li><a>Settings</a></li>
                            <li><a onClick={handleSignOut}>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                {/* Welcome Section */}
                <div className="mb-6">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome, {user.firstName} {user.lastName}!
                    </h2>
                    <p className="text-base-content/70">
                        Role: <span className="badge badge-primary">{user.role.toUpperCase()}</span>
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="tabs tabs-boxed mb-6 bg-base-100 p-1">
                    <a 
                        className={`tab tab-lg ${activeTab === 'home' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('home')}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </a>
                    <a 
                        className={`tab tab-lg ${activeTab === 'tasks' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Tasks
                    </a>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'home' && <HomeTab user={user} />}
                    {activeTab === 'tasks' && <TasksTab user={user} />}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
