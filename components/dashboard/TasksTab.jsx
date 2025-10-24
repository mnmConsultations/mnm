/**
 * Tasks Tab Component
 * 
 * User-facing task checklist with category navigation
 * Displays relocation tasks organized by journey phase
 * 
 * Features:
 * - Category-based task organization
 * - Task completion tracking with checkboxes
 * - Expandable task details (tips, requirements, links)
 * - Progress calculation per category
 * - Paywall protection for free users
 * 
 * Props:
 * @param {object} user - Current logged-in user
 * @param {object} cachedData - Pre-fetched tasks, categories, progress
 * @param {boolean} isLoading - Loading state
 * @param {function} onProgressUpdate - Callback to update parent cache
 * @param {function} onRefresh - Callback to refresh data
 * @param {function} onNavigateToContact - Callback to navigate to contact tab
 * 
 * Paywall Logic:
 * - Free users see upgrade prompt
 * - Shows Basic and Plus plan comparison
 * - Links to packages page
 * 
 * Task Interaction:
 * - Click checkbox to mark complete/incomplete
 * - Updates UserProgress via PUT /api/dashboard/progress
 * - Optimistic UI update through onProgressUpdate callback
 * 
 * Task Expansion:
 * - Click task card to expand/collapse
 * - Shows full description, tips, requirements, external links
 * - Difficulty and duration badges
 * 
 * Progress Display:
 * - Per-category progress bars
 * - Visual feedback for completion status
 * 
 * Caching Pattern:
 * - Uses parent's cached data
 * - Updates cache via callback (no local API calls on mount)
 * - Preserves state during tab switches
 */
'use client';

import { useState } from 'react';

const TasksTab = ({ user, cachedData, isLoading, onProgressUpdate, onRefresh, onNavigateToContact }) => {
    const categories = cachedData?.categories || [];
    const tasks = cachedData?.tasks || {};
    const userProgress = cachedData?.userProgress;
    const requiresPaidPlan = cachedData?.requiresPaidPlan || false;
    
    const [activeCategory, setActiveCategory] = useState('beforeArrival');
    const [expandedTasks, setExpandedTasks] = useState({});

    const handleTaskToggle = async (taskId, completed) => {
        try {
            // Get token from localStorage
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };
            
            const response = await fetch('/api/dashboard/progress', {
                method: 'PUT',
                headers,
                body: JSON.stringify({ taskId, completed }),
            });

            if (response.ok) {
                const updatedProgress = await response.json();
                // Update parent cache instead of local state
                onProgressUpdate(updatedProgress.data);
            }
        } catch (error) {
            console.error('Error updating task progress:', error);
        }
    };

    const toggleTaskExpansion = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const isTaskCompleted = (taskId) => {
        return userProgress?.completedTasks?.some(task => task.taskId === taskId) || false;
    };

    const getCategoryProgress = (categoryId) => {
        if (!tasks[categoryId] || !userProgress) return 0;
        const categoryTasks = tasks[categoryId];
        const completedTasks = categoryTasks.filter(task => 
            userProgress.completedTasks?.some(completed => completed.taskId === task.id)
        );
        return categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    // Show paywall for free users
    if (requiresPaidPlan) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="card bg-base-100 shadow-2xl max-w-2xl">
                    <div className="card-body text-center">
                        <div className="flex justify-center mb-6">
                            <svg className="w-24 h-24 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="card-title text-3xl justify-center mb-4">
                            Upgrade to Access Tasks
                        </h2>
                        <p className="text-lg text-base-content/70 mb-6">
                            Access to our comprehensive relocation task checklist is available only to our paid plan members.
                        </p>
                        
                        <div className="alert alert-info mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Upgrade to Basic or Plus plan to unlock all relocation tasks and features!</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="card bg-base-200">
                                <div className="card-body">
                                    <h3 className="font-bold text-xl mb-2">Basic Plan</h3>
                                    <ul className="text-left space-y-2 text-sm">
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Complete task checklist
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Progress tracking
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Email support
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="card bg-base-200 border-2 border-primary">
                                <div className="badge badge-primary absolute top-0 right-0 m-2">Popular</div>
                                <div className="card-body">
                                    <h3 className="font-bold text-xl mb-2">Plus Plan</h3>
                                    <ul className="text-left space-y-2 text-sm">
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Everything in Basic
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Priority support
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Personal consultation
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="card-actions justify-center">
                            <a href="/packages" className="btn btn-primary btn-lg">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                View Plans & Pricing
                            </a>
                            <button 
                                onClick={onNavigateToContact}
                                className="btn btn-outline btn-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Task Progress Overview
                    </h2>
                    
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Overall Completion</span>
                        <span className="text-lg font-bold text-primary">
                            {userProgress?.overallProgress || 0}%
                        </span>
                    </div>
                    <progress 
                        className="progress progress-primary w-full h-4" 
                        value={userProgress?.overallProgress || 0} 
                        max="100"
                    ></progress>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="tabs tabs-boxed bg-base-100 p-1">
                {categories.map((category) => (
                    <a 
                        key={category.id}
                        className={`tab tab-lg ${activeCategory === category.id ? 'tab-active' : ''}`}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        <div className="flex items-center space-x-2">
                            <span>{category.displayName}</span>
                            <div className="badge badge-sm">
                                {getCategoryProgress(category.id)}%
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Active Category Content */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {categories.map((category) => {
                        if (category.id !== activeCategory) return null;
                        
                        return (
                            <div key={category.id}>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold mb-2" style={{ color: category.color }}>
                                            {category.displayName}
                                        </h3>
                                        <p className="text-base-content/70 mb-2">{category.description}</p>
                                        {category.estimatedTimeFrame && (
                                            <p className="text-sm badge badge-outline">
                                                {category.estimatedTimeFrame}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold" style={{ color: category.color }}>
                                            {getCategoryProgress(category.id)}%
                                        </div>
                                        <div className="text-sm text-base-content/70">Complete</div>
                                    </div>
                                </div>

                                {/* Tasks List */}
                                <div className="space-y-3">
                                    {(() => {
                                        const categoryTasks = tasks[category.id];
                                        
                                        if (!categoryTasks || categoryTasks.length === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <p className="text-base-content/70">No tasks available for this category.</p>
                                                </div>
                                            );
                                        }
                                        
                                        return categoryTasks.map((task) => {
                                            return (
                                        <div key={task.id} className="flex gap-3 items-start">
                                            {/* Checkbox outside accordion */}
                                            <div className="form-control pt-4">
                                                <label className="cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="checkbox checkbox-primary"
                                                        checked={isTaskCompleted(task.id)}
                                                        onChange={(e) => {
                                                            handleTaskToggle(task.id, e.target.checked);
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            {/* Accordion */}
                                            <div className="collapse collapse-arrow bg-base-200 flex-1">
                                            <input 
                                                type="checkbox" 
                                                checked={expandedTasks[task.id] || false}
                                                onChange={() => toggleTaskExpansion(task.id)}
                                            />
                                            <div className="collapse-title">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div>
                                                            <h4 className={`font-semibold ${isTaskCompleted(task.id) ? 'line-through text-base-content/50' : ''}`}>
                                                                {task.title}
                                                            </h4>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                {task.estimatedDuration && (
                                                                    <span className="badge badge-sm badge-outline">
                                                                        {task.estimatedDuration}
                                                                    </span>
                                                                )}
                                                                <span className={`badge badge-sm ${
                                                                    task.difficulty === 'easy' ? 'badge-success' :
                                                                    task.difficulty === 'medium' ? 'badge-warning' :
                                                                    'badge-error'
                                                                }`}>
                                                                    {task.difficulty}
                                                                </span>
                                                                {isTaskCompleted(task.id) && (
                                                                    <span className="badge badge-sm badge-primary">
                                                                        Completed
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="collapse-content">
                                                <div className="pt-4 space-y-4">
                                                    {/* Task Description */}
                                                    <div 
                                                        className="prose prose-sm max-w-none"
                                                        dangerouslySetInnerHTML={{ __html: task.description }}
                                                    />

                                                    {/* External Links */}
                                                    {task.externalLinks && task.externalLinks.length > 0 && (
                                                        <div>
                                                            <h5 className="font-semibold mb-2">Helpful Links:</h5>
                                                            <div className="space-y-2">
                                                                {task.externalLinks.map((link, index) => (
                                                                    <a 
                                                                        key={index}
                                                                        href={link.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-sm btn-outline btn-primary"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                        </svg>
                                                                        {link.title}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tips */}
                                                    {task.tips && task.tips.length > 0 && (
                                                        <div>
                                                            <h5 className="font-semibold mb-2">💡 Tips:</h5>
                                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                                {task.tips.map((tip, index) => (
                                                                    <li key={index}>{tip}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Requirements */}
                                                    {task.requirements && task.requirements.length > 0 && (
                                                        <div>
                                                            <h5 className="font-semibold mb-2">📋 Requirements:</h5>
                                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                                {task.requirements.map((requirement, index) => (
                                                                    <li key={index}>{requirement}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TasksTab;