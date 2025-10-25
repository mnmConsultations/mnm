/**
 * Home Tab Component (User Dashboard)
 * 
 * Welcome screen with progress overview and notifications
 * First view users see when accessing dashboard
 * 
 * Features:
 * - Overall relocation progress display
 * - Per-category progress breakdown (4 categories)
 * - User profile card with package information and expiry status
 * - Real-time notifications center with pagination (15 per page)
 * - Quick actions section
 * 
 * Layout:
 * - 70/30 split on desktop (main content / sidebar)
 * - Responsive single column on mobile
 * 
 * Progress Section:
 * - Overall progress bar with percentage
 * - 4 category progress bars:
 *   - Before Arrival (info blue)
 *   - Upon Arrival (success green)
 *   - First Weeks (warning yellow)
 *   - Ongoing (secondary purple)
 * 
 * User Profile Card:
 * - Centered profile picture with user initials
 * - User name and email
 * - Current package badge (Free/Essential/Premium)
 * - Package expiry date and status (Active/Expired)
 * - Edit profile button
 * 
 * Notifications Center:
 * - Auto-generated notifications from admin actions (task/category changes)
 * - Custom notifications from admin
 * - Read/unread status based on lastNotificationReadAt
 * - Pagination (15 notifications per page)
 * - 7-day TTL (auto-expire after 7 days)
 * - Smart grouping (multiple edits merged into single notification)
 * - Priority-based display order
 * - Action links for actionable notifications
 * - Empty state for no notifications
 * 
 * Props:
 * @param {object} user - Current logged-in user
 * @param {object} cachedData - Pre-fetched progress (notifications fetched separately)
 * @param {boolean} isLoading - Loading state
 * @param {function} onRefresh - Callback to refresh data
 * 
 * Caching:
 * - Uses parent's cached data for progress
 * - Fetches notifications independently with pagination
 */
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const HomeTab = ({ user, cachedData, isLoading, onRefresh }) => {
    const userProgress = cachedData?.userProgress;
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const notificationsPerPage = 15;

    useEffect(() => {
        fetchNotifications(1);
    }, []);

    const fetchNotifications = async (page = 1) => {
        try {
            setIsLoadingNotifications(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const offset = (page - 1) * notificationsPerPage;
            const response = await fetch(
                `/api/dashboard/notifications?limit=${notificationsPerPage}&offset=${offset}`,
                { headers }
            );
            
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.data.notifications || []);
                setUnreadCount(data.data.unreadCount || 0);
                setTotalNotifications(data.data.totalCount || 0);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    const totalPages = Math.ceil(totalNotifications / notificationsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchNotifications(newPage);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
            {/* Main Section - 70% */}
            <div className="xl:col-span-7 space-y-6">
                {/* Progress Bar Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl lg:text-2xl mb-4">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Your Relocation Progress
                        </h2>
                        
                        {/* Overall Progress */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-base lg:text-lg font-semibold">Overall Progress</span>
                                <span className="text-base lg:text-lg font-bold text-primary">
                                    {userProgress?.overallProgress || 0}%
                                </span>
                            </div>
                            <progress 
                                className="progress progress-primary w-full h-3 lg:h-4" 
                                value={userProgress?.overallProgress || 0} 
                                max="100"
                            ></progress>
                        </div>

                        {/* Category Progress */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Before Arrival</span>
                                        <span className="text-sm font-bold">
                                            {userProgress?.categoryProgress?.beforeArrival || 0}%
                                        </span>
                                    </div>
                                    <progress 
                                        className="progress progress-info w-full h-2" 
                                        value={userProgress?.categoryProgress?.beforeArrival || 0} 
                                        max="100"
                                    ></progress>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Upon Arrival</span>
                                        <span className="text-sm font-bold">
                                            {userProgress?.categoryProgress?.uponArrival || 0}%
                                        </span>
                                    </div>
                                    <progress 
                                        className="progress progress-success w-full h-2" 
                                        value={userProgress?.categoryProgress?.uponArrival || 0} 
                                        max="100"
                                    ></progress>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">First Weeks</span>
                                        <span className="text-sm font-bold">
                                            {userProgress?.categoryProgress?.firstWeeks || 0}%
                                        </span>
                                    </div>
                                    <progress 
                                        className="progress progress-warning w-full h-2" 
                                        value={userProgress?.categoryProgress?.firstWeeks || 0} 
                                        max="100"
                                    ></progress>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium">Ongoing</span>
                                        <span className="text-sm font-bold">
                                            {userProgress?.categoryProgress?.ongoing || 0}%
                                        </span>
                                    </div>
                                    <progress 
                                        className="progress progress-secondary w-full h-2" 
                                        value={userProgress?.categoryProgress?.ongoing || 0} 
                                        max="100"
                                    ></progress>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications and Updates Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title text-lg lg:text-xl">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Notifications & Updates
                            </h2>
                            {unreadCount > 0 && (
                                <span className="badge badge-primary badge-lg">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        
                        {isLoadingNotifications ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="loading loading-spinner loading-lg"></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            <>
                                <div className="space-y-3">
                                    {notifications.map((notification) => (
                                        <div 
                                            key={notification._id} 
                                            className={`alert ${
                                                notification.type === 'success' ? 'alert-success' :
                                                notification.type === 'warning' ? 'alert-warning' :
                                                notification.type === 'error' ? 'alert-error' :
                                                notification.type === 'update' ? 'alert-info' :
                                                'alert-info'
                                            } ${!notification.isRead ? 'border-l-4 border-primary shadow-md' : 'opacity-80'}`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-sm lg:text-base">{notification.title}</h4>
                                                            {!notification.isRead && (
                                                                <div className="badge badge-primary badge-sm">New</div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs lg:text-sm opacity-90">{notification.message}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <p className="text-xs opacity-70">
                                                                {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                            {notification.priority === 'high' && (
                                                                <span className="badge badge-error badge-xs">High Priority</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {notification.actionUrl && (
                                                    <div className="mt-2">
                                                        <a 
                                                            href={notification.actionUrl} 
                                                            className="btn btn-sm btn-outline"
                                                        >
                                                            Take Action
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-6">
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, idx) => {
                                                const page = idx + 1;
                                                // Show first page, last page, current page, and pages around current
                                                if (
                                                    page === 1 ||
                                                    page === totalPages ||
                                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={page}
                                                            className={`btn btn-sm ${
                                                                currentPage === page ? 'btn-primary' : 'btn-ghost'
                                                            }`}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                } else if (
                                                    page === currentPage - 2 ||
                                                    page === currentPage + 2
                                                ) {
                                                    return <span key={page} className="px-2">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>
                                        
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                
                                <div className="text-center text-xs text-base-content/50 mt-4">
                                    Showing {((currentPage - 1) * notificationsPerPage) + 1}-{Math.min(currentPage * notificationsPerPage, totalNotifications)} of {totalNotifications} notifications
                                    <span className="ml-2">• Auto-delete after 7 days</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="flex flex-col items-center">
                                    <svg className="w-12 h-12 lg:w-16 lg:h-16 text-success mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    <h3 className="text-base lg:text-lg font-semibold text-success mb-2">You're All Caught Up!</h3>
                                    <p className="text-sm lg:text-base text-base-content/70">No new notifications at this time.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Section - 30% */}
            <div className="xl:col-span-3 space-y-6">
                {/* User Profile Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex flex-col items-center text-center">
                            <div className="avatar mb-4">
                                <div className="w-20 lg:w-24 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl lg:text-3xl font-bold mx-auto">
                                    {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            </div>
                            <h3 className="text-base lg:text-lg font-bold">{user.firstName} {user.lastName}</h3>
                            <p className="text-xs lg:text-sm text-base-content/70 mb-2 break-all">{user.email}</p>
                            
                            {/* Package Information */}
                            <div className="mt-2 mb-3 w-full">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs lg:text-sm text-base-content/70">Plan:</span>
                                        <span className={`badge ${
                                            user.package === 'free' ? 'badge-ghost' :
                                            user.package === 'essential' ? 'badge-info' :
                                            'badge-success'
                                        }`}>
                                            {user.package?.toUpperCase() || 'FREE'}
                                        </span>
                                    </div>
                                    
                                    {user.packageExpiresAt && (
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs text-base-content/60">
                                                Expires: {new Date(user.packageExpiresAt).toLocaleDateString()}
                                            </span>
                                            <span className={`text-xs font-medium ${
                                                new Date(user.packageExpiresAt) > new Date() 
                                                    ? 'text-success' 
                                                    : 'text-error'
                                            }`}>
                                                {new Date(user.packageExpiresAt) > new Date() 
                                                    ? '✓ Active' 
                                                    : '✗ Expired'
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="divider my-2"></div>
                            
                            <Link href="/dashboard/user/profile" className="btn btn-outline btn-sm w-full">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Package Details Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title text-base">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Your Package
                        </h3>
                        
                        <div className="space-y-3">
                            {/* Package Name and Badge */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-bold text-gray-800 text-sm lg:text-base">
                                        {user.package === 'essential' ? 'Essential Package' : 
                                         user.package === 'premium' ? 'Premium Package' : 
                                         'Free Plan'}
                                    </h4>
                                    {user.package === 'essential' && (
                                        <span className="badge badge-sm badge-info">Most Popular</span>
                                    )}
                                </div>
                                <p className="text-xs lg:text-sm text-base-content/70">
                                    {user.package === 'essential' ? 'Core services for a smooth transition to Germany' : 
                                     user.package === 'premium' ? 'Comprehensive support for a worry-free experience' : 
                                     'Limited access to basic features'}
                                </p>
                            </div>
                            
                            {/* Package Price */}
                            {user.package !== 'free' && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs lg:text-sm text-base-content/70">Package Value:</span>
                                    <span className="font-bold text-primary text-base lg:text-xl">
                                        {user.package === 'essential' ? '₹25,000' : '₹40,000'}
                                    </span>
                                </div>
                            )}
                            
                            {/* Included Features */}
                            {user.package !== 'free' && (
                                <div>
                                    <h5 className="font-semibold text-gray-800 text-xs lg:text-sm mb-2">Included Services:</h5>
                                    <ul className="space-y-2">
                                        {user.package === 'essential' && (
                                            <>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Online Q&A Session (1-hour group Zoom)</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>WhatsApp Support Group (6 months pre-arrival)</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Berlin Relocation Blueprint (10-part video series)</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Pre-Departure Starter Kit</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Event Coordination & Group Integration</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Orientation Bootcamp (2-day program)</span>
                                                </li>
                                            </>
                                        )}
                                        {user.package === 'premium' && (
                                            <>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="font-medium">Everything in Essential Package</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Airport Pickup Service</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Indian Welcome Package</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>10-Day Post-Arrival Support</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Buddy Program (1-2 months mentorship)</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Safety & Emergency Workshop</span>
                                                </li>
                                                <li className="flex items-start text-xs lg:text-sm">
                                                    <svg className="w-4 h-4 text-success mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>1-1 Pre-Departure Discussion</span>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            )}
                            
                            {/* Upgrade CTA for Free Users */}
                            {user.package === 'free' && (
                                <div className="alert alert-info text-xs lg:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div>
                                        <div className="font-semibold">Upgrade to unlock full access</div>
                                        <div className="text-xs mt-1">Get Essential or Premium package for complete relocation support</div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Support CTA for Paid Users */}
                            {user.package !== 'free' && (
                                <div className="alert alert-success text-xs lg:text-sm mt-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Need help or want to upgrade? Contact our support team for assistance.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;