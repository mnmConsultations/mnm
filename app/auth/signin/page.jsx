'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLoggedInUser, useSignin } from '../../../lib/hooks/auth.hooks';

const SignInPage = () => {
    const router = useRouter();
    const { data: user, isLoading } = useLoggedInUser();
    const { mutateAsync: signinAsync, isPending } = useSignin();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after client mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (user && !isLoading && isMounted) {
            if (user.role === 'admin') {
                router.push('/dashboard/admin');
            } else {
                router.push('/dashboard/user');
            }
        }
    }, [user, router, isLoading, isMounted]);

    // Show loading until component is mounted to prevent hydration mismatch
    if (!isMounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Basic validation
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        if (!password) {
            setErrorMessage('Please enter your password.');
            return;
        }

        try {
            await signinAsync({ email, password });
            // Redirect happens via the useLoggedInUser effect
        } catch (error) {
            console.error('Signin failed:', error);
            setErrorMessage(
                error.response?.data?.message || 'Signin failed. Please check your credentials and try again.'
            );
        }
    };

    const toSignUpPage = () => {
        router.push('/auth/signup');
    };

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold">Login now!</h1>
                    <p className="py-6">
                        Welcome back to M&M Consultants! Access your account to manage your relocation services,
                        track your progress, and get personalized assistance for your move to Germany.
                        Login now to continue your seamless relocation journey.
                    </p>
                </div>
                <div className="card bg-base-100 border border-base-200 w-full max-w-sm shrink-0 shadow-2xl">
                    <form className="card-body" onSubmit={handleFormSubmit}>
                        {errorMessage && (
                            <div className="alert alert-error mb-4">
                                <span>{errorMessage}</span>
                            </div>
                        )}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="email"
                                className="input input-bordered"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="password"
                                className="input input-bordered"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isPending}
                            />
                        </div>
                        <div className="form-control mt-6">
                            <button 
                                className="btn btn-primary" 
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <span className="loading loading-spinner"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </div>
                        <div className="divider">OR</div>
                        <div className="form-control">
                            <button 
                                type="button"
                                className="btn btn-outline btn-primary" 
                                onClick={toSignUpPage}
                                disabled={isPending}
                            >
                                SIGN-UP!
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

export default SignInPage;
