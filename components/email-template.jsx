/**
 * Email Template Component
 * 
 * React email template for contact form submissions
 * Used by Resend to send formatted emails to M&M team
 * 
 * Props:
 * @param {object} data - Contact form data
 *   - name: User's full name
 *   - email: User's email address
 *   - phone: User's phone number
 *   - subject: Email subject (unused in template, used in send-email route)
 *   - message: User's message content
 * 
 * Email Structure:
 * - Greeting with user's name
 * - Contact information section (email, phone)
 * - Message content
 * 
 * Usage:
 * Called by /api/send-email route
 * Rendered by Resend's email service
 * Sent to mnmconsultations@gmail.com
 * 
 * Note: Simple HTML template
 * Could be enhanced with:
 * - CSS styling for better formatting
 * - Logo/branding
 * - Call-to-action buttons
 * - Structured layout
 */
export const EmailTemplate = (data) => (
  <div>
    <h1>New Contact, {data.name}!</h1>
    <p>{data.name} contacted.</p>
    <p>Email: {data.email}</p>
    <p>Phone: {data.phone}</p>
    <h2>Message:</h2>
    <p>{data.message}</p>
  </div>
);