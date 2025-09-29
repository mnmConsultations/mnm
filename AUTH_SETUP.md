# M&M Consultants - Authentication Setup

This project now includes a complete authentication system with login, signup, and user/admin dashboards.

## 🚀 Features Implemented

### Authentication System
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with salt
- ✅ Role-based access control (User/Admin)
- ✅ Protected routes with middleware

### Frontend Components
- ✅ Sign In page (`/auth/signin`)
- ✅ Sign Up page (`/auth/signup`)
- ✅ User Dashboard (`/dashboard/user`)
- ✅ Admin Dashboard (`/dashboard/admin`)
- ✅ Updated Header with authentication state
- ✅ React Query for state management

### Backend API
- ✅ `/api/auth/signup` - User registration
- ✅ `/api/auth/signin` - User login
- ✅ `/api/auth/me` - Get current user
- ✅ MongoDB integration with Mongoose
- ✅ Authentication middleware

## 🛠️ Setup Instructions

### 1. Environment Variables
Update your `.env.local` file with the following:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mnm?retryWrites=true&w=majority

# JWT Secret (Generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters

# Next.js API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Resend API Key (for existing email functionality)
RESEND_API_KEY=your-resend-api-key
```

### 2. MongoDB Atlas Setup
1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address or use 0.0.0.0/0 for development
5. Get your connection string and update `MONGODB_URI` in `.env.local`

### 3. Install Dependencies
Dependencies are already installed, but if needed:
```bash
npm install jsonwebtoken bcryptjs mongoose axios @tanstack/react-query
```

### 4. Start the Development Server
```bash
npm run dev
```

## 📝 Usage

### For Users:
1. Visit `/auth/signup` to create an account
2. Visit `/auth/signin` to log in
3. Access your dashboard at `/dashboard/user`

### For Admins:
1. Create a user account first
2. Manually change the role to 'admin' in the MongoDB database
3. Log in and access admin dashboard at `/dashboard/admin`

### Authentication Flow:
- **Public routes**: Home, Services, About, Contact, FAQ
- **Auth routes**: `/auth/signin`, `/auth/signup`
- **Protected routes**: `/dashboard/user`, `/dashboard/admin`
- **Auto-redirect**: Based on user role after login

## 🔐 Security Features

- Password hashing with salt using crypto
- JWT tokens with expiration
- Route protection middleware
- Input validation on both frontend and backend
- SQL injection protection with Mongoose
- XSS protection with React

## 🏗️ Project Structure

```
app/
├── api/
│   └── auth/
│       ├── signup/route.js
│       ├── signin/route.js
│       └── me/route.js
├── auth/
│   ├── signin/page.jsx
│   └── signup/page.jsx
├── dashboard/
│   ├── user/page.jsx
│   └── admin/page.jsx
└── layout.jsx

lib/
├── hooks/
│   └── auth.hooks.js
├── models/
│   └── user.model.js
├── services/
│   └── auth.services.js
├── utils/
│   ├── db.js
│   ├── encrypt.js
│   └── axios.js
└── providers/
    └── QueryProvider.jsx

components/
└── Header.jsx (updated with auth state)
```

## 🚧 Next Steps

The authentication system is now ready! You can:

1. **Test the authentication flow**:
   - Sign up a new user
   - Sign in with credentials
   - Access role-based dashboards
   - Test logout functionality

2. **Customize the UI**:
   - Update the dashboard designs
   - Add more user profile fields
   - Implement profile editing

3. **Add more features**:
   - Password reset functionality
   - Email verification
   - User management for admins
   - Role management system

4. **Production deployment**:
   - Update JWT secret
   - Configure MongoDB Atlas for production
   - Set up proper environment variables

## 🔗 Key Routes

- **Home**: `/`
- **Sign Up**: `/auth/signup`
- **Sign In**: `/auth/signin`
- **User Dashboard**: `/dashboard/user`
- **Admin Dashboard**: `/dashboard/admin`

The system automatically redirects users to appropriate dashboards based on their roles after authentication.
