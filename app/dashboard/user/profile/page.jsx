'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoggedInUser, useSignOut } from '../../../../lib/hooks/auth.hooks';

/**
 * Edit Profile Page (User Dashboard)
 * 
 * Allows users to update their profile information
 * Users can edit: firstName, lastName, phoneNumber
 * Email is read-only for security reasons
 * 
 * Features:
 * - Pre-filled form with current user data
 * - Client-side validation
 * - Server-side validation feedback
 * - Success/error messages
 * - Optimistic UI updates
 * - Cancel button to go back to dashboard
 * 
 * Validation Rules:
 * - First Name: Required, min 2 characters
 * - Last Name: Optional
 * - Phone Number: Optional, must be 10 digits (6-9 start) if provided
 * - Email: Read-only, not editable
 */
const EditProfilePage = () => {
    const router = useRouter();
    const { data: user, isLoading, refetch } = useLoggedInUser();
    const { mutate: signOut } = useSignOut();
    const [isMounted, setIsMounted] = useState(false);
    
    // Form field states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    
    // UI states
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    const submissionInProgress = useRef(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !isLoading) {
            if (!user) {
                router.push('/auth/signin');
            } else if (user.role === 'admin') {
                router.push('/dashboard/admin');
            } else {
                // Pre-fill form with user data
                setFirstName(user.firstName || '');
                setLastName(user.lastName || '');
                setPhoneNumber(user.phoneNumber || '');
                setEmail(user.email || '');
            }
        }
    }, [user, isLoading, router, isMounted]);

    /**
     * Form Validation Function
     * Validates all form fields before submission
     */
    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        } else if (firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
            isValid = false;
        }

        if (phoneNumber && !/^[6-9]\d{9}$/.test(phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be 10 digits starting with 6-9';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    /**
     * Form Submit Handler
     * Validates and submits profile update to API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent double submission
        if (isSubmitting || submissionInProgress.current) {
            console.log('Submission already in progress, ignoring duplicate request');
            return;
        }
        
        if (validateForm()) {
            setIsSubmitting(true);
            submissionInProgress.current = true;
            setSubmissionResult(null);

            const updateData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim(),
            };

            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updateData),
                });

                const data = await response.json();

                if (data.success) {
                    // Success: Refetch user data and show success message
                    setSubmissionResult({
                        success: true,
                        message: 'Profile updated successfully!',
                    });
                    
                    // Refetch user data to update the UI
                    await refetch();
                    
                    // Redirect back to dashboard after 2 seconds
                    setTimeout(() => {
                        router.push('/dashboard/user');
                    }, 2000);
                } else {
                    // API Error: Show error message
                    setSubmissionResult({
                        success: false,
                        message: data.message || 'Failed to update profile. Please try again.',
                    });
                    
                    // Show validation errors if any
                    if (data.errors) {
                        setErrors(data.errors);
                    }
                }
            } catch (error) {
                // Network Error: Show error message
                setSubmissionResult({
                    success: false,
                    message: 'An unexpected error occurred. Please try again later.',
                });
            } finally {
                setIsSubmitting(false);
                submissionInProgress.current = false;
            }
        }
    };

    const handleSignOut = () => {
        signOut();
    };

    const handleCancel = () => {
        router.push('/dashboard/user');
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
                                    {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            </div>
                            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                                <li className="menu-title">
                                    <span>{user.firstName} {user.lastName}</span>
                                </li>
                                <li>
                                    <Link href="/dashboard/user">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Dashboard
                                    </Link>
                                </li>
                                <li><a onClick={handleSignOut}>Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Breadcrumb */}
                <div className="text-sm breadcrumbs mb-6">
                    <ul>
                        <li>
                            <Link href="/dashboard/user">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Edit Profile
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
                    <p className="text-base-content/70">
                        Update your personal information
                    </p>
                </div>

                {/* Profile Form Card */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* First Name and Last Name Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            First Name <span className="text-error">*</span>
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your first name"
                                        className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`}
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {errors.firstName && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.firstName}
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {/* Last Name Field */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Last Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your last name"
                                        className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.lastName && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.lastName}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Email Field (Read-only) */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email Address</span>
                                    <span className="label-text-alt">
                                        <span className="badge badge-sm badge-ghost">Read-only</span>
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    className="input input-bordered w-full bg-base-200 cursor-not-allowed"
                                    value={email}
                                    disabled
                                    readOnly
                                />
                                <label className="label">
                                    <span className="label-text-alt text-base-content/60">
                                        Email cannot be changed for security reasons
                                    </span>
                                </label>
                            </div>

                            {/* Phone Number Field */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Phone Number</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit phone number"
                                    className={`input input-bordered w-full ${errors.phoneNumber ? 'input-error' : ''}`}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={isSubmitting}
                                />
                                {errors.phoneNumber && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.phoneNumber}
                                        </span>
                                    </label>
                                )}
                                <label className="label">
                                    <span className="label-text-alt text-base-content/60">
                                        Enter a 10-digit Indian phone number
                                    </span>
                                </label>
                            </div>

                            {/* Submit and Cancel Buttons */}
                            <div className="form-control mt-6">
                                <div className="flex gap-4">
                                    {isSubmitting ? (
                                        <button type="button" className="btn btn-primary flex-1" disabled>
                                            <span className="loading loading-spinner"></span>
                                            Updating...
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="btn btn-primary text-neutral-content flex-1"
                                            disabled={isSubmitting}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Changes
                                        </button>
                                    )}
                                    
                                    <button
                                        type="button"
                                        className="btn btn-ghost flex-1"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Success/Error Message */}
                            {submissionResult && (
                                <div
                                    className={`alert ${submissionResult.success ? 'alert-success' : 'alert-error'} mt-4`}
                                >
                                    <div className="flex items-center">
                                        {submissionResult.success ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="stroke-current flex-shrink-0 w-6 h-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="stroke-current flex-shrink-0 w-6 h-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        )}
                                        <span>{submissionResult.message}</span>
                                    </div>
                                </div>
                            )}
                        </form>

                        <div className="divider"></div>

                        {/* Info Alert */}
                        <div className="alert alert-info">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="stroke-current shrink-0 w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <div className="font-bold">Note about email changes</div>
                                <div className="text-sm">
                                    For security reasons, email addresses cannot be changed. If you need to update your email, 
                                    please contact our support team.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
