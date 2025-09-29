'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoggedInUser, useSignOut } from '../../../lib/hooks/auth.hooks';

const UserDashboard = () => {
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

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">
                        Welcome, {user.firstName} {user.lastName}!
                    </h2>
                    <p className="text-base-content/70">
                        Role: <span className="badge badge-primary">{user.role.toUpperCase()}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* User Info Card */}
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

                    {/* Services Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Your Services</h3>
                            <p>Access your relocation services and track progress.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary btn-sm">
                                    View Services
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Support</h3>
                            <p>Get help with your relocation process.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-secondary btn-sm">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Documents Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Documents</h3>
                            <p>Manage your relocation documents.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-accent btn-sm">
                                    View Documents
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appointments Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Appointments</h3>
                            <p>Schedule and manage your appointments.</p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-info btn-sm">
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title">Relocation Progress</h3>
                            <p>Track your relocation journey.</p>
                            <div className="progress-bar mt-4">
                                <progress className="progress progress-primary w-full" value="25" max="100"></progress>
                                <p className="text-sm mt-2">25% Complete</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>This is a basic dashboard. More features will be added as we develop the platform further.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
