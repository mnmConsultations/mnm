/**
 * Contact Tab Component (User Dashboard)
 * 
 * Contact support form integrated into dashboard
 * Pre-fills user information for convenience
 * 
 * Features:
 * - Auto-filled name and email from user data
 * - Contact form with validation
 * - Email submission via /api/send-email
 * - Success/error feedback
 * - Contact information display
 * 
 * Form Fields:
 * - Name (auto-filled, editable)
 * - Email (auto-filled, editable)
 * - Phone (required, 10 digits)
 * - Subject (required, text)
 * - Message (required, textarea)
 * 
 * Validation Rules:
 * - Name: Must be non-empty
 * - Email: Must match email regex pattern
 * - Phone: Must be exactly 10 digits
 * - Subject: Must be non-empty
 * - Message: Must be non-empty
 * 
 * API Integration:
 * - POST /api/send-email with form data
 * - Uses Resend service for email delivery
 * - Returns success/error status
 * 
 * Props:
 * @param {object} user - Current logged-in user
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Clock } from 'lucide-react';

const ContactTab = ({ user }) => {
    // Form field states - pre-filled with user data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    
    // Validation and submission states
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);
    
    // Use ref to prevent double submission
    const submissionInProgress = useRef(false);

    // Pre-fill form with user data
    useEffect(() => {
        if (user) {
            setName(`${user.firstName} ${user.lastName}`);
            setEmail(user.email);
        }
    }, [user]);

    /**
     * Form Validation Function
     * Validates all form fields before submission
     */
    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            newErrors.phone = 'Invalid phone number format (10 digits)';
            isValid = false;
        }

        if (!subject.trim()) {
            newErrors.subject = 'Subject is required';
            isValid = false;
        }

        if (!message.trim()) {
            newErrors.message = 'Message is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    /**
     * Form Submit Handler
     * Validates and submits contact form to API
     * Prevents double submission with isSubmitting guard and ref
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent double submission using both state and ref
        if (isSubmitting || submissionInProgress.current) {
            console.log('Submission already in progress, ignoring duplicate request');
            return;
        }
        
        if (validateForm()) {
            setIsSubmitting(true);
            submissionInProgress.current = true;
            setSubmissionResult(null);

            const formData = {
                name,
                email,
                phone,
                subject,
                message,
            };

            try {
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (data.success) {
                    // Success: Clear form and show success message
                    setSubmissionResult({
                        success: true,
                        message: 'Message sent successfully! Our team will get back to you soon.',
                    });
                    setPhone('');
                    setSubject('');
                    setMessage('');
                    setErrors({});
                } else {
                    // API Error: Show error message
                    setSubmissionResult({
                        success: false,
                        message: `Failed to send message. ${data.error?.message || 'Please try again later.'}`,
                    });
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

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Contact Form - 2/3 width */}
            <div className="xl:col-span-2">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-xl lg:text-2xl mb-4">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Send Us a Message
                        </h2>

                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col md:gap-2">
                            {/* Row 1: Name and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Name Field */}
                                <div className="form-control flex flex-col justify-between">
                                    <label className="label">
                                        <span className="label-text">Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                    {errors.name && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.name}
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="form-control flex flex-col justify-between">
                                    <label className="label">
                                        <span className="label-text">Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Your Email"
                                        className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    {errors.email && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.email}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Phone and Subject */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Phone Field */}
                                <div className="form-control flex flex-col justify-between">
                                    <label className="label">
                                        <span className="label-text">Phone Number</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="Your Phone Number"
                                        className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                    {errors.phone && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.phone}
                                            </span>
                                        </label>
                                    )}
                                </div>

                                {/* Subject Field */}
                                <div className="form-control flex flex-col justify-between">
                                    <label className="label">
                                        <span className="label-text">Subject</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        className={`input input-bordered w-full ${errors.subject ? 'input-error' : ''}`}
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                    {errors.subject && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.subject}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Message Field - Full width textarea */}
                            <div className="space-y-2 mb-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Message</span>
                                    </label>
                                    <textarea
                                        className={`textarea textarea-bordered h-32 w-full ${errors.message ? 'textarea-error' : ''}`}
                                        placeholder="Your Message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>
                                    {errors.message && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.message}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="form-control mt-6">
                                {isSubmitting ? (
                                    <button type="button" className="btn btn-primary w-full" disabled>
                                        <span className="loading loading-spinner"></span>
                                        Sending...
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="btn btn-primary text-neutral-content w-full"
                                        disabled={isSubmitting}
                                    >
                                        Send Message
                                    </button>
                                )}
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
                    </div>
                </div>
            </div>

            {/* Contact Information Sidebar - 1/3 width */}
            <div className="xl:col-span-1">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title text-base lg:text-lg mb-4">
                            Contact Information
                        </h3>

                        <div className="space-y-4">
                            {/* Email Addresses */}
                            <div className="flex items-start">
                                <div className="bg-blue-50 p-3 rounded-full mr-3 flex-shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Email Us</h4>
                                    <p className="text-xs text-base-content/70">
                                        <a
                                            href="mailto:mnmconsultations+info@gmail.com"
                                            className="hover:text-primary"
                                        >
                                            mnmconsultations+info@gmail.com
                                        </a>
                                    </p>
                                    <p className="text-xs text-base-content/70">
                                        <a
                                            href="mailto:mnmconsultations+support@gmail.com"
                                            className="hover:text-primary"
                                        >
                                            mnmconsultations+support@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Phone Numbers */}
                            <div className="flex items-start">
                                <div className="bg-blue-50 p-3 rounded-full mr-3 flex-shrink-0">
                                    <Phone className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Call Us</h4>
                                    <p className="text-xs text-base-content/70">
                                        <a href="tel:+919545099997" className="hover:text-primary">
                                            +91 9545099997
                                        </a>
                                    </p>
                                    <p className="text-xs text-base-content/70">
                                        <a href="tel:+4917629732633" className="hover:text-primary">
                                            +49 176 29732633
                                        </a>
                                    </p>
                                    <p className="text-xs text-base-content/70 mt-1">
                                        Monday to Friday, 9am - 6pm CET
                                    </p>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="flex items-start">
                                <div className="bg-blue-50 p-3 rounded-full mr-3 flex-shrink-0">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Working Hours</h4>
                                    <p className="text-xs text-base-content/70">
                                        Monday - Friday: 9:00 AM - 6:00 PM
                                    </p>
                                    <p className="text-xs text-base-content/70">
                                        Saturday: 10:00 AM - 2:00 PM
                                    </p>
                                    <p className="text-xs text-base-content/70">Sunday: Closed</p>
                                </div>
                            </div>
                        </div>

                        <div className="divider"></div>

                        {/* Quick Help */}
                        <div className="alert alert-info text-xs">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="stroke-current shrink-0 w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                            <span>
                                For urgent matters, please call us directly. We typically respond to emails within 24 hours.
                            </span>
                        </div>
                    </div>
                </div>

                {/* FAQ Card */}
                <div className="card bg-base-100 shadow-xl mt-6">
                    <div className="card-body">
                        <h3 className="card-title text-base lg:text-lg mb-4">
                            Common Questions
                        </h3>

                        <div className="space-y-3">
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="contact-faq" />
                                <div className="collapse-title text-sm font-medium">
                                    How quickly will I get a response?
                                </div>
                                <div className="collapse-content text-xs">
                                    <p>
                                        We typically respond to all inquiries within 24 hours during business days.
                                    </p>
                                </div>
                            </div>

                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="contact-faq" />
                                <div className="collapse-title text-sm font-medium">
                                    Can I upgrade my package?
                                </div>
                                <div className="collapse-content text-xs">
                                    <p>
                                        Yes! Contact us with "Package Upgrade" in the subject line, and we'll guide you through the process.
                                    </p>
                                </div>
                            </div>

                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="contact-faq" />
                                <div className="collapse-title text-sm font-medium">
                                    Do you offer personalized consultations?
                                </div>
                                <div className="collapse-content text-xs">
                                    <p>
                                        Yes, our Plus plan includes personal consultation. Contact us to learn more.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactTab;
