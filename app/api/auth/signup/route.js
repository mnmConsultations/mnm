import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/utils/db';
import AuthService from '../../../../lib/services/auth.services';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Basic validation
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide all required fields' 
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please provide a valid email address' 
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 6 characters long' 
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
    
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { 
          success: false, 
          message: error.message 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
