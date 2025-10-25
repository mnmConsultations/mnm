import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import AuthService from '../../../../lib/services/auth.services';
import { checkRateLimit, getClientIp, RateLimitPresets } from '../../../../lib/middleware/rateLimit';
import { sanitizeString, sanitizeEmail } from '../../../../lib/utils/sanitize';

/**
 * User Registration API Endpoint
 * POST /api/auth/signup
 * 
 * Creates a new user account with free plan as default
 * Validates email format and password strength
 * Returns JWT token and user data on success
 * 
 * Security Features:
 * - Rate limiting (5 attempts per 15 minutes per IP)
 * - Strong password requirements
 * - Input sanitization
 * - Email enumeration prevention
 */
export async function POST(request) {
  try {
    // Rate limiting by IP address
    const clientIp = getClientIp(request);
    const rateLimitCheck = checkRateLimit(
      `signup:${clientIp}`, 
      RateLimitPresets.AUTH.maxRequests,
      RateLimitPresets.AUTH.windowMs
    );
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many signup attempts. Please try again in ${rateLimitCheck.retryAfter} seconds` 
        },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimitCheck.retryAfter.toString() }
        }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    let { firstName, lastName, email, password } = body;
    
    // Sanitize inputs
    firstName = sanitizeString(firstName, 50);
    lastName = sanitizeString(lastName, 50);
    email = sanitizeEmail(email);

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide all required fields' 
        },
        { status: 400 }
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

    // Strong password validation
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 8 characters long' 
        },
        { status: 400 }
      );
    }
    
    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must contain uppercase, lowercase, number, and special character' 
        },
        { status: 400 }
      );
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', 'password123', '12345678', 'qwerty123', 'abc12345',
      'password1', 'welcome123', 'admin123', 'letmein123', 'monkey123'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password is too common. Please choose a stronger password' 
        },
        { status: 400 }
      );
    }

    const result = await AuthService.signUpService({
      firstName,
      lastName,
      email,
      password
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        token: result.token,
        user: result.user
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Prevent email enumeration - use generic message for existing users
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unable to complete registration. Please try a different email or contact support.' 
        },
        { status: 400 }
      );
    }

    // Generic error message - don't expose internal details
    return NextResponse.json(
      { 
        success: false, 
        message: 'Registration failed. Please try again or contact support.' 
      },
      { status: 500 }
    );
  }
}
