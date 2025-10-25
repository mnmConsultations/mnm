import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import AuthService from '../../../../lib/services/auth.services';
import { checkRateLimit, getClientIp, RateLimitPresets } from '../../../../lib/middleware/rateLimit';
import { sanitizeEmail } from '../../../../lib/utils/sanitize';

/**
 * User Sign In API Endpoint
 * POST /api/auth/signin
 * 
 * Authenticates user with email and password
 * Returns JWT token and user data on success
 * Obscures whether email or password is incorrect for security
 * 
 * Security Features:
 * - Rate limiting (5 attempts per 15 minutes per email)
 * - Input sanitization
 * - Generic error messages to prevent enumeration
 */
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    let { email, password } = body;
    
    // Sanitize email
    email = sanitizeEmail(email);
    
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide email and password' 
        },
        { status: 400 }
      );
    }
    
    // Rate limiting by email to prevent brute force
    const rateLimitCheck = checkRateLimit(
      `signin:${email}`, 
      RateLimitPresets.AUTH.maxRequests,
      RateLimitPresets.AUTH.windowMs
    );
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many login attempts. Please try again in ${rateLimitCheck.retryAfter} seconds` 
        },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitCheck.retryAfter.toString() }
        }
      );
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide a valid email address' 
        },
        { status: 400 }
      );
    }

    const result = await AuthService.signInService({
      email,
      password
    });

    return NextResponse.json({
      success: true,
      message: 'Sign in successful',
      data: {
        token: result.token,
        user: result.user
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Signin error:', error);
    
    // Generic error message - don't reveal if email exists or password is wrong
    if (error.message.includes('not found') || error.message.includes('Invalid Password')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Don't expose internal error details
    return NextResponse.json(
      { 
        success: false, 
        message: 'Authentication failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}
