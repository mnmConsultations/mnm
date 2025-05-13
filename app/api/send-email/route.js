// filepath: d:\Project\mnm2\app\api\send-email\route.js
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { EmailTemplate} from '../../../components/email-template.jsx'; // Adjust the import path as necessary

// Ensure your API key is stored securely in environment variables
// Use a variable name accessible on the server (e.g., RESEND_API_KEY)
// DO NOT prefix with NEXT_PUBLIC_
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
      from: 'Your Verified Sender <onboarding@resend.dev>', // CHANGE THIS to your verified Resend sender
      to: ['mnmconsultations@gmail.com'], // Your receiving email address
      subject: `Contact Form Submission: ${content.subject}`,
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