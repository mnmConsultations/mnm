/**
 * Authentication React Hooks
 * 
 * Client-side authentication hooks for user signup, signin, and session management
 * Integrates with React Query for efficient data caching and state management
 * 
 * Features:
 * - JWT token management via localStorage
 * - Automatic role-based redirects (admin/user dashboards)
 * - React Query integration for caching and optimistic updates
 * - Type-safe user data fetching
 * 
 * Hooks:
 * 
 * useSignup()
 * - Purpose: Register new user account
 * - Flow: POST /auth/signup → Store token → Invalidate cache → Redirect by role
 * - Returns: mutation object { mutate, mutateAsync, isLoading, error }
 * 
 * useSignin()
 * - Purpose: Authenticate existing user
 * - Flow: POST /auth/signin → Store token → Invalidate cache → Redirect by role
 * - Returns: mutation object { mutate, mutateAsync, isLoading, error }
 * 
 * useLoggedInUser()
 * - Purpose: Fetch current authenticated user data
 * - Flow: Check localStorage token → GET /auth/me → Return user or null
 * - Returns: query object { data: user, isLoading, error, refetch }
 * - Cache behavior: Enabled only on client side (typeof window !== 'undefined')
 * 
 * useSignOut()
 * - Purpose: Log out current user
 * - Flow: Remove token → Clear cache → Invalidate queries → Redirect to signin
 * - Returns: mutation object { mutate }
 * 
 * Token Management:
 * - Stored in localStorage with key "token"
 * - Automatically attached to requests via apiInstance axios interceptor
 * - Cleared on logout or authentication failure
 * 
 * Role-Based Routing:
 * - Admin users → /dashboard/admin
 * - Regular users → /dashboard/user
 * - Determined by user.role property
 * 
 * Error Handling:
 * - Failed requests logged to console
 * - Returns null for unauthenticated state
 * - Mutation errors available in error property
 * 
 * Usage Example:
 * ```javascript
 * const { mutate: signup } = useSignup();
 * const { mutate: signin } = useSignin();
 * const { data: user, isLoading } = useLoggedInUser();
 * const { mutate: signout } = useSignOut();
 * 
 * // Signup
 * signup({ firstName, lastName, email, password });
 * 
 * // Signin
 * signin({ email, password });
 * 
 * // Check user
 * if (user) { console.log(user.email, user.role); }
 * 
 * // Logout
 * signout();
 * ```
 */
'use client';

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiInstance } from "../lib/client/api";

export const useSignup = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({ firstName, lastName, email, password }) => {
      const { data } = await apiInstance.post("/auth/signup", {
        firstName,
        lastName,
        email,
        password,
      });
      const token = data.data.token;
      if (token) localStorage.setItem("token", token);
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      // Redirect based on user role
      if (data.data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
    },
  });
  return mutation;
};

export const useSignin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await apiInstance.post("/auth/signin", {
        email,
        password,
      });
      const token = data.data.token;
      if (token) localStorage.setItem("token", token);
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      // Redirect based on user role
      if (data.data.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/user');
      }
    },
  });
  return mutation;
};

export const useLoggedInUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (!token) return null;
        
        const { data } = await apiInstance.get("/auth/me");
        if (!data.isLoggedIn) return null;
        return data.data.user;
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    enabled: typeof window !== 'undefined',
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Removing the token from localStorage
      localStorage.removeItem("token");

      // Clear user data from the cache
      queryClient.setQueryData(["user"], null);

      // Optionally invalidate queries if multiple queries are involved
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onSuccess: () => {
      // Redirecting to signin page
      router.push("/auth/signin");
    },
  });
};
