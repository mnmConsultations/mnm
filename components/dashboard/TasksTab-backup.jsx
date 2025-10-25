'use client';

import { useEffect, useState } from 'react';

const TasksTab = ({ user }) => {
    const [categories, setCategories] = useState([]);
    const [tasks, setTasks] = useState({});
    const [userProgress, setUserProgress] = useState(null);
    const [activeCategory, setActiveCategory] = useState('beforeArrival');
    const [loading, setLoading] = useState(true);
    const [expandedTasks, setExpandedTasks] = useState({});

    useEffect(() => {
        fetchTasksData();
    }, []);

    const fetchTasksData = async () => {
        try {
            setLoading(true);
            
            // Get token from localStorage
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            console.log('🔍 Fetching tasks data with token:', token ? 'Present' : 'Missing');
            
            // Fetch categories
            const categoriesResponse = await fetch('/api/dashboard/categories', { headers });
            console.log('📁 Categories response status:', categoriesResponse.status);
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                console.log('📁 Categories data:', categoriesData);
                console.log('📁 Categories array:', categoriesData.data);
                console.log('📁 First category:', categoriesData.data[0]);
                setCategories(categoriesData.data);
            } else {
                console.error('❌ Categories fetch failed:', categoriesResponse.status);
            }

            // Fetch tasks
            const tasksResponse = await fetch('/api/dashboard/tasks', { headers });
            console.log('📋 Tasks response status:', tasksResponse.status);
            if (tasksResponse.ok) {
                const tasksData = await tasksResponse.json();
                console.log('📋 Tasks data:', tasksData);
                console.log('📋 Tasks object keys:', Object.keys(tasksData.data));
                console.log('📋 beforeArrival tasks:', tasksData.data.beforeArrival);
                setTasks(tasksData.data);
            } else {
                console.error('❌ Tasks fetch failed:', tasksResponse.status);
            }

            // Fetch user progress
            const progressResponse = await fetch('/api/dashboard/progress', { headers });
            console.log('📊 Progress response status:', progressResponse.status);
            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                console.log('📊 Progress data:', progressData);
                setUserProgress(progressData.data);
            } else {
                console.error('❌ Progress fetch failed:', progressResponse.status);
            }

        } catch (error) {
            console.error('Error fetching tasks data:', error);
        } finally {
            setLoading(false);
        }
    };

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
                setUserProgress(updatedProgress.data);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    // Debug: Show what data we have
    console.log('🐛 TasksTab State:', { 
        categoriesCount: categories.length, 
        tasksKeys: Object.keys(tasks),
        userProgress: userProgress ? 'Present' : 'Missing',
        activeCategory 
    });

    return (
        <div className="space-y-6">
            {/* Debug Info - Remove this after fixing */}
            <div className="alert alert-info">
                <div className="w-full">
                    <h3 className="font-bold">Debug Info:</h3>
                    <p>Categories: {categories.length}</p>
                    <p>Task Categories: {Object.keys(tasks).join(', ')}</p>
                    <p>Active Category: {activeCategory}</p>
                    <p>Tasks in active category: {tasks[activeCategory]?.length || 0}</p>
                    <details className="mt-2">
                        <summary className="cursor-pointer">View Full Data</summary>
                        <pre className="text-xs mt-2 overflow-auto max-h-64">
                            {JSON.stringify({ categories, tasks, activeCategory }, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
            
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
                                        console.log(`🔍 Rendering tasks for ${category.id}:`, categoryTasks);
                                        console.log(`🔍 Tasks length:`, categoryTasks?.length);
                                        
                                        if (!categoryTasks || categoryTasks.length === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <p className="text-base-content/70">No tasks available for this category.</p>
                                                </div>
                                            );
                                        }
                                        
                                        return categoryTasks.map((task) => (
                                        <div key={task.id} className="collapse collapse-arrow bg-base-200">
                                            <input 
                                                type="checkbox" 
                                                checked={expandedTasks[task.id] || false}
                                                onChange={() => toggleTaskExpansion(task.id)}
                                            />
                                            <div className="collapse-title">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="form-control">
                                                            <label className="cursor-pointer label">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="checkbox checkbox-primary"
                                                                    checked={isTaskCompleted(task.id)}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleTaskToggle(task.id, e.target.checked);
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
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
                                        ));
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