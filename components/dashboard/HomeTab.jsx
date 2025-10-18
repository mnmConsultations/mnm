'use client';

import { useEffect, useState } from 'react';

const HomeTab = ({ user }) => {
    const [userProgress, setUserProgress] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch user progress
            const progressResponse = await fetch('/api/dashboard/progress');
            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                setUserProgress(progressData.data);
            }

            // Fetch notifications
            const notificationsResponse = await fetch('/api/dashboard/notifications?limit=5');
            if (notificationsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                setNotifications(notificationsData.data.notifications);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
                        <h2 className="card-title text-lg lg:text-xl mb-4">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 3h16a1 1 0 011 1v10a1 1 0 01-1 1H6l-4 4V4a1 1 0 011-1z" />
                            </svg>
                            Notifications & Updates
                        </h2>
                        
                        {notifications.length > 0 ? (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification._id} 
                                        className={`alert ${
                                            notification.type === 'success' ? 'alert-success' :
                                            notification.type === 'warning' ? 'alert-warning' :
                                            notification.type === 'error' ? 'alert-error' :
                                            'alert-info'
                                        } ${!notification.isRead ? 'border-l-4 border-primary' : ''}`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm lg:text-base">{notification.title}</h4>
                                                    <p className="text-xs lg:text-sm opacity-90">{notification.message}</p>
                                                    <p className="text-xs opacity-70 mt-1">
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="badge badge-primary badge-sm">New</div>
                                                )}
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
                                
                                <div className="text-center mt-4">
                                    <button className="btn btn-ghost btn-sm">
                                        View All Notifications
                                    </button>
                                </div>
                            </div>
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
                    <div className="card-body text-center">
                        <div className="avatar mb-4">
                            <div className="w-16 lg:w-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl lg:text-2xl font-bold">
                                {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>
                        <h3 className="text-base lg:text-lg font-bold">{user.firstName} {user.lastName}</h3>
                        <p className="text-xs lg:text-sm text-base-content/70 mb-2 break-all">{user.email}</p>
                        <div className="badge badge-primary text-xs">{user.role.toUpperCase()}</div>
                        
                        <div className="divider"></div>
                        
                        <button className="btn btn-outline btn-sm">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
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
                            <div>
                                <h4 className="font-semibold text-primary text-sm lg:text-base">
                                    {userProgress?.packageDetails?.name || 'Basic Package'}
                                </h4>
                                <p className="text-xs lg:text-sm text-base-content/70">
                                    {userProgress?.packageDetails?.description || 'Essential relocation services'}
                                </p>
                            </div>
                            
                            {userProgress?.packageDetails?.price && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs lg:text-sm">Package Value:</span>
                                    <span className="font-bold text-success text-sm lg:text-base">
                                        €{userProgress.packageDetails.price}
                                    </span>
                                </div>
                            )}
                            
                            {userProgress?.packageDetails?.features && (
                                <div>
                                    <h5 className="font-medium mb-2 text-sm">Included Services:</h5>
                                    <ul className="text-xs lg:text-sm space-y-1">
                                        {userProgress.packageDetails.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <svg className="w-3 h-3 lg:w-4 lg:h-4 text-success mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        
                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-primary btn-sm">
                                Upgrade Package
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title text-base">Quick Actions</h3>
                        
                        <div className="space-y-2">
                            <button className="btn btn-ghost btn-sm w-full justify-start text-xs lg:text-sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Schedule Appointment
                            </button>
                            
                            <button className="btn btn-ghost btn-sm w-full justify-start text-xs lg:text-sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Get Help
                            </button>
                            
                            <button className="btn btn-ghost btn-sm w-full justify-start text-xs lg:text-sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View Documents
                            </button>
                            
                            <button className="btn btn-ghost btn-sm w-full justify-start text-xs lg:text-sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;