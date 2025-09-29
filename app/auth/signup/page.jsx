'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoggedInUser, useSignup } from '../../../lib/hooks/auth.hooks';

const SignupPage = () => {
    const router = useRouter();
    const { data: user, isLoading } = useLoggedInUser();
    const { mutateAsync: signupAsync, isPending } = useSignup();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (user && !isLoading) {
            if (user.role === 'admin') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/user');
            }
        }
    }, [user, router, isLoading]);

    const isConfirmPasswordMatch = useMemo(
        () => password === confirmPassword || confirmPassword === '',
        [confirmPassword, password]
    );

    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter.';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number.';
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            return 'Password must contain at least one special character (e.g., !@#$%^&*).';
        }
        return ''; // No errors
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setPasswordError('');

        // Basic validation
        if (!firstName || !email || !password) {
            setErrorMessage('Please fill in all required fields.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }

        if (!isConfirmPasswordMatch) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        try {
            await signupAsync({
                firstName,
                lastName,
                email,
                password,
            });
            // Redirect happens via the useLoggedInUser effect
        } catch (error) {
            console.error('Signup failed:', error);
            setErrorMessage(
                error.response?.data?.message || 'Signup failed. Please try again.'
            );
        }
    };

    const toSignInPage = () => {
        router.push('/auth/signin');
    };

    // Show loading until component is mounted to prevent hydration mismatch
    if (!isMounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse max-w-6xl">
                <div className="text-center lg:text-left lg:w-1/2">
                    <h1 className="text-5xl font-bold">Join M&M Consultants!</h1>
                    <p className="py-6">
                        Create your account to access personalized relocation services for your move to Germany.
                        Get expert assistance with accommodation, visa processes, local orientation, and much more.
                        Start your seamless relocation journey today!
                    </p>
                </div>
                <div className="card bg-base-100 border border-base-200 w-full max-w-md shrink-0 shadow-2xl lg:w-1/2">
                    <form className="card-body" onSubmit={handleFormSubmit}>
                        {errorMessage && (
                            <div className="alert alert-error mb-4">
                                <span>{errorMessage}</span>
                            </div>
                        )}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">First Name *</span>
                            </label>
                            <input
                                type="text"
                                placeholder="First Name"
                                className="input input-bordered"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Last Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="input input-bordered"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={isPending}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email *</span>
                            </label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                className="input input-bordered"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password *</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Password"
                                className={`input input-bordered ${passwordError ? 'input-error' : ''}`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isPending}
                            />
                            {passwordError && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{passwordError}</span>
                                </label>
                            )}
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Confirm Password *</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className={`input input-bordered ${!isConfirmPasswordMatch ? 'input-error' : ''}`}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isPending}
                            />
                            {!isConfirmPasswordMatch && confirmPassword && (
                                <label className="label">
                                    <span className="label-text-alt text-error">Passwords do not match</span>
                                </label>
                            )}
                        </div>
                        <div className="form-control mt-6">
                            <button 
                                className="btn btn-primary" 
                                type="submit"
                                disabled={isPending || !isConfirmPasswordMatch}
                            >
                                {isPending ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                        </div>
                        <div className="divider">OR</div>
                        <div className="form-control">
                            <button 
                                type="button"
                                className="btn btn-outline btn-primary" 
                                onClick={toSignInPage}
                                disabled={isPending}
                            >
                                Already have an account? SIGN-IN!
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            <Link href="/" className="link link-primary">
                                Back to Home
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
