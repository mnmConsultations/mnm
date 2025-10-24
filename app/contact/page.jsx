/**
 * Contact Page
 * /contact
 * 
 * Contact form page for M&M Consultations
 * Allows visitors to send inquiries via email
 * 
 * Features:
 * - Contact form with validation
 * - Email submission via /api/send-email
 * - Success/error feedback
 * - Contact information display
 * - Office hours and location
 * - Social media links
 * - Auth-based redirect for logged-in users
 * 
 * Form Fields:
 * - Name (required, text)
 * - Email (required, validated format)
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
 * UI States:
 * - Loading during auth check
 * - Submitting during form submission
 * - Success message after submission
 * - Error message on failure
 * 
 * Icons:
 * - Mail: Email address
 * - Phone: Phone number
 * - MapPin: Office location
 * - Clock: Business hours
 * 
 * Auth Logic:
 * - Redirects logged-in users to dashboard
 * - Admin → /dashboard/admin
 * - User → /dashboard/user
 * - Loading state during auth check
 * 
 * Hydration Protection:
 * - isMounted prevents SSR mismatch
 */
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoggedInUser } from "@/lib/hooks/auth.hooks";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

/**
 * Contact Component
 * Main page component for contact form
 * 
 * State Management:
 * - Form fields: name, email, phone, subject, message
 * - Validation: errors object with field-specific messages
 * - Submission: isSubmitting flag and submissionResult
 * - Hydration: isMounted flag
 * 
 * Auth Flow:
 * 1. Check authentication status
 * 2. Redirect if logged in
 * 3. Show loading during check
 * 4. Render contact form if not logged in
 */
const Contact = () => {
  const router = useRouter();
  const { data: user, isLoading } = useLoggedInUser();
  const [isMounted, setIsMounted] = useState(false);
  
  // Form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // Validation and submission states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Hydration protection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Auth-based Redirect Effect
   * Redirects authenticated users to role-specific dashboard
   */
  useEffect(() => {
    // Redirect logged-in users to their dashboard
    if (isMounted && !isLoading && user) {
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
    }
  }, [user, isLoading, isMounted, router]);

  /**
   * Loading State
   * Shown during component mount and auth check
   */
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * Auth Redirect State
   * Returns null while redirecting logged-in users
   */
  if (user) {
    return null;
  }

  /**
   * Form Validation Function
   * Validates all form fields before submission
   * 
   * Validation Rules:
   * - Name: Required, non-empty
   * - Email: Required, valid email format
   * - Phone: Required, exactly 10 digits
   * - Subject: Required, non-empty
   * - Message: Required, non-empty
   * 
   * Returns:
   * - true if all validations pass
   * - false if any validation fails (sets errors state)
   */
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Invalid phone number format (10 digits)";
      isValid = false;
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Form Submit Handler
   * Validates and submits contact form to API
   * 
   * Process:
   * 1. Prevent default form submission
   * 2. Validate all fields
   * 3. Set submitting state
   * 4. POST to /api/send-email
   * 5. Handle success (clear form, show message)
   * 6. Handle error (show error message)
   * 7. Clear submitting state
   * 
   * API Endpoint:
   * POST /api/send-email
   * Body: { name, email, phone, subject, message }
   * Response: { success: boolean, error?: object }
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
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
          console.log(data);
        if (data.success) {
          // Success: Clear form and show success message
          setSubmissionResult({
            success: true,
            message: "Message sent successfully!",
          });
          setName("");
          setEmail("");
          setPhone("");
          setSubject("");
          setMessage("");
          setErrors({});
        } else {
          // API Error: Show error message
          console.log("API Error:", data.error);
          setSubmissionResult({
            success: false,
            message: `Failed to send message. ${data.error?.message || "Please try again later."}`,
          });
        }
      } catch (error) {
        // Network Error: Show error message
        console.log("Fetch Error:", error);
        setSubmissionResult({
          success: false,
          message: "An unexpected error occurred. Please try again later.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      {/* Hero Section - Contact page title and description */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-gray-700">
              Have questions or need assistance? We're here to help with your
              relocation journey.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Section - Contact form and info side by side */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information Card - Left sidebar (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Get in Touch
                </h2>

                <div className="space-y-6">
                  {/* Office Location - Commented out (future use) */}
                  {/* <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Our Office
                      </h3>
                      <p className="text-gray-600">
                        Alexanderplatz 1<br />
                        10178 Berlin, Germany
                      </p>
                    </div>
                  </div> */}

                  {/* Email Addresses - Info and support emails */}
                  <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Email Us
                      </h3>
                      <p className="text-gray-600">
                        <a
                          href="mailto:mnmconsultations+info@gmail.com"
                          className="hover:text-primary"
                        >
                          mnmconsultations+info@gmail.com
                        </a>
                      </p>
                      <p className="text-gray-600">
                        <a
                          href="mailto:mnmconsultations+support@gmail.com"
                          className="hover:text-primary"
                        >
                          mnmconsultations+support@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Phone Numbers - India and Germany contact numbers */}
                  <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Call Us
                      </h3>
                      <p className="text-gray-600">
                        <a
                          href="tel:+91 9545099997"
                          className="hover:text-primary"
                        >
                         +91 9545099997
                        </a>
                      </p>
                      <p className="text-gray-600">
                        <a
                          href="tel:+49 176 29732633"
                          className="hover:text-primary"
                        >
                         +49 176 29732633
                        </a>
                      </p>  
                      <p className="text-gray-600 text-sm">
                        Monday to Friday, 9am - 6pm CET
                      </p>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex items-start">
                    <div className="bg-blue-50 p-3 rounded-full mr-4">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Working Hours
                      </h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM
                      </p>
                      <p className="text-gray-600">
                        Saturday: 10:00 AM - 2:00 PM
                      </p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Card - Right side (2/3 width) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Send Us a Message
                </h2>

                {/* Contact Form - 5 fields with validation */}
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col md:gap-2"
                >
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
                        className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
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
                        className={`input input-bordered w-full  ${errors.email ? "input-error" : ""}`}
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
                        className={`input input-bordered w-full  ${errors.phone ? "input-error" : ""}`}
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
                        className={`input input-bordered w-full  ${errors.subject ? "input-error" : ""}`}
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
                        className={`textarea textarea-bordered h-32 w-full ${errors.message ? "textarea-error" : ""}`}
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

                  {/* Submit Button - Shows loading state during submission */}
                  <div className="form-control mt-6">
                    {isSubmitting ? 
                    <button className="btn btn-primary w-full">
                      <span className="loading loading-spinner"></span>
                      </button> : <button
                        type="submit"
                        className={`btn btn-primary text-neutral-content w-full`}
                        disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Sensd Message"}
                    </button>}
                  </div>

                  {/* Success/Error Message - Shown after form submission */}
                  {submissionResult && (
                    <div
                      className={`alert ${submissionResult.success ? "alert-success" : "alert-error"} mt-4`}
                    >
                      <div>
                        {/* Success Icon - Green checkmark */}
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
                          /* Error Icon - Red X */
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
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
            <div className="collapse collapse-plus bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-3" defaultChecked />
              <div className="collapse-title font-semibold">
                How quickly can you respond to inquiries?
              </div>
              <div className="collapse-content text-sm">
              We typically respond to all inquiries within 24 hours during business days. Our WhatsApp Support Group 
              guarantees responses within 12 hours, 24/7.
              </div>
            </div>
            <div className="collapse collapse-plus bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-3" />
              <div className="collapse-title font-semibold">
              How do I start the process with M&M Consultations?
              </div>
              <div className="collapse-content text-sm">
              Contact Mayur Bafna at +91 9545099997 for an introductory call within 7 days to select packages. 
              An MoU will be signed within 14 days, with onboarding by May 2025 for a June 2025 launch.
              </div>
            </div>
            <div className="collapse collapse-plus bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-3" />
              <div className="collapse-title font-semibold">
                Can I request services for cities other than Berlin?
              </div>
              <div className="collapse-content text-sm">
              While we specialize in Berlin relocations, we can provide some guidance for other major German cities. 
              Please specify your destination city in your inquiry, and we'll let you know how we can assist.
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
