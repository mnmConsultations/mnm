'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoggedInUser, useSignOut } from '../../../lib/hooks/auth.hooks';

const AdminDashboard = () => {
    const router = useRouter();
    const { data: user, isLoading } = useLoggedInUser();
    const { mutate: signOut } = useSignOut();
    const [isMounted, setIsMounted] = useState(false);

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
            <div className="navbar bg-base-100 shadow-lg">
                <div className="flex-1">
                    <h1 className="text-xl font-bold">M&M Consultants - Admin Dashboard</h1>
                </div>
                <div className="flex-none gap-2">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full bg-error text-error-content flex items-center justify-center">
                                {user.firstName?.charAt(0)?.toUpperCase() || 'A'}
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

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome, Admin {user.firstName} {user.lastName}!
                    </h2>
                    <p className="text-base-content/70">
                        Role: <span className="badge badge-error">{user.role.toUpperCase()}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Admin Info Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Your Information</h3>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Role:</strong> {user.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* User Management Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">User Management</h3>
                            <p>Manage users and their permissions.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm">
                                    Manage Users
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Services Management Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Services Management</h3>
                            <p>Manage relocation services and packages.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-secondary btn-sm">
                                    Manage Services
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Analytics</h3>
                            <p>View system analytics and reports.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-accent btn-sm">
                                    View Analytics
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Support Tickets Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Support Tickets</h3>
                            <p>Manage customer support requests.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-info btn-sm">
                                    View Tickets
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Settings Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">System Settings</h3>
                            <p>Configure system-wide settings.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-warning btn-sm">
                                    Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">System Overview</h3>
                    <div className="stats stats-vertical lg:stats-horizontal shadow">
                        <div className="stat">
                            <div className="stat-title">Total Users</div>
                            <div className="stat-value">1</div>
                            <div className="stat-desc">Currently registered</div>
                        </div>
                        
                        <div className="stat">
                            <div className="stat-title">Active Services</div>
                            <div className="stat-value">0</div>
                            <div className="stat-desc">In progress</div>
                        </div>
                        
                        <div className="stat">
                            <div className="stat-title">Support Tickets</div>
                            <div className="stat-value">0</div>
                            <div className="stat-desc">Open tickets</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="alert alert-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.71 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>Admin Dashboard - This is a basic administrative interface. More management features will be added as the platform develops.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
