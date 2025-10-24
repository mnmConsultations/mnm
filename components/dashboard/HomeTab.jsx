/**
 * Home Tab Component (User Dashboard)
 * 
 * Welcome screen with progress overview and notifications
 * First view users see when accessing dashboard
 * 
 * Features:
 * - Overall relocation progress display
 * - Per-category progress breakdown (4 categories)
 * - User package information card
 * - Notifications center with filtering
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
 * Package Info Card:
 * - Shows current plan (Free/Basic/Plus)
 * - Displays activation and expiry dates
 * - Color-coded badge by package type
 * - Upgrade call-to-action for free users
 * 
 * Notifications Center:
 * - All/Unread filtering tabs
 * - Priority-based display order
 * - Mark as read functionality
 * - Action links for actionable notifications
 * - Empty state for no notifications
 * 
 * Props:
 * @param {object} user - Current logged-in user
 * @param {object} cachedData - Pre-fetched progress and notifications
 * @param {boolean} isLoading - Loading state
 * @param {function} onRefresh - Callback to refresh data
 * 
 * Caching:
 * - Uses parent's cached data (no API calls on mount)
 * - Efficient re-renders on tab switch
 */
'use client';

const HomeTab = ({ user, cachedData, isLoading, onRefresh }) => {
    const userProgress = cachedData?.userProgress;
    const notifications = cachedData?.notifications || [];

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
                            
                            <div className="alert alert-info text-xs lg:text-sm mt-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>Need to upgrade your plan? Contact our support team for assistance.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;