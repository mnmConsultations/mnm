/**
 * Send Email API (Contact Form)
 * POST /api/send-email
 * 
 * Handles contact form submissions via Resend email service
 * Sends user inquiries to M&M Consultations team
 * 
 * Features:
 * - Email delivery via Resend API
 * - Server-side validation
 * - React email templates
 * - Error handling and logging
 * 
 * Request Body:
 * - name (required): User's full name
 * - email (required): User's email address (validated)
 * - phone (required): Contact phone number
 * - subject (required): Email subject line
 * - message (required): Message content
 * 
 * Validation:
 * - All fields required
 * - Email format validation (regex: \S+@\S+\.\S+)
 * - Returns 400 Bad Request if validation fails
 * 
 * Resend Configuration:
 * - API Key: process.env.RESEND_API_KEY (server-side only)
 * - From: onboarding@resend.dev (verified Resend sender)
 * - To: mnmconsultations@gmail.com
 * - Subject: "Enquiry from [name]: [subject]"
 * 
 * Email Template:
 * - Uses React component EmailTemplate
 * - Renders user-provided content
 * 
 * Error Handling:
 * - Logs detailed errors server-side
 * - Returns generic error messages to client (security)
 * - 500 Internal Server Error on failures
 * 
 * Security Notes:
 * - API key stored in environment variable (not NEXT_PUBLIC_)
 * - User email not used directly in 'from' field (prevents spoofing)
 * - Input validation prevents injection attacks
 * 
 * Usage:
 * Contact form on /contact page sends POST request
 * Returns { success: true, message: 'Email sent successfully!' }
 */
// filepath: d:\Project\mnm2\app\api\send-email\route.js
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { EmailTemplate} from '../../../components/email-template.jsx';
import { checkRateLimit, getClientIp, RateLimitPresets } from '../../../lib/middleware/rateLimit';
import { sanitizeString, sanitizeEmail } from '../../../lib/utils/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // Rate limiting by IP - prevent spam
    const clientIp = getClientIp(request);
    const rateLimitCheck = checkRateLimit(
      `contact:${clientIp}`, 
      RateLimitPresets.CONTACT.maxRequests,
      RateLimitPresets.CONTACT.windowMs
    );
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Too many contact form submissions. Please try again in ${Math.ceil(rateLimitCheck.retryAfter / 60)} minutes.` 
        },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitCheck.retryAfter.toString() }
        }
      );
    }
    
    const content = await request.json();
    
    // Sanitize inputs
    const name = sanitizeString(content.name, 100);
    const email = sanitizeEmail(content.email);
    const phone = sanitizeString(content.phone, 20);
    const subject = sanitizeString(content.subject, 200);
    const message = sanitizeString(content.message, 5000);

    // Basic server-side validation
    if (!name || !email || !phone || !subject || !message) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Enhanced email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Validate message length
    if (message.length < 10) {
      return NextResponse.json({ error: 'Message is too short' }, { status: 400 });
    }
    
    // Additional rate limit by email
    const emailRateLimit = checkRateLimit(`contact-email:${email}`, 2, 60 * 60 * 1000);
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions from this email address. Please try again later.' },
        { status: 429 }
      );
    }

    const { data, error } = await resend.emails.send({
      // Use a verified sender email address. Using the user's email directly
      // in 'from' can lead to delivery issues or be blocked.
      from: `Enquiry! <onboarding@resend.dev>`, // CHANGE THIS to your verified Resend sender
      to: ['mnmconsultations@gmail.com'], // Your receiving email address
      subject: `Enquiry from ${name}: ${subject}`,
      react: EmailTemplate({ name, email, phone, subject, message }), // Pass sanitized content
    });

    if (error) {
      console.error('Resend API Error:', error);
      // Avoid sending detailed error info back to the client
      return NextResponse.json({ error: 'Failed to send email. Please try again later.' }, { status: 500 });
    }

    console.log('Resend API Success:', data);
    return NextResponse.json({ success: true, message: 'Email sent successfully!' }, { status: 200 });

  } catch (err) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}