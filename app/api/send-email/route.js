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

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const content = await request.json();

    // Basic server-side validation
    if (!content.name || !content.email || !content.phone || !content.subject || !content.message) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(content.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    // Add more validation as needed

    const { data, error } = await resend.emails.send({
      // Use a verified sender email address. Using the user's email directly
      // in 'from' can lead to delivery issues or be blocked.
      from: `Enquiry! <onboarding@resend.dev>`, // CHANGE THIS to your verified Resend sender
      to: ['mnmconsultations@gmail.com'], // Your receiving email address
      subject: `Enquiry from ${content.name}: ${content.subject}`,
      react: EmailTemplate(content), // Pass the name to the EmailTemplate component
    });

    if (error) {
      console.error('Resend API Error:', error);
      // Avoid sending detailed error info back to the client
      return NextResponse.json({ error: 'Failed to send email due to server error.' }, { status: 500 });
    }

    console.log('Resend API Success:', data);
    return NextResponse.json({ success: true, message: 'Email sent successfully!' }, { status: 200 });

  } catch (err) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}