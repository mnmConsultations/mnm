/**
 * Authentication React Hooks
 * 
 * React Query-based hooks for authentication operations
 * Handles signup, signin, current user fetching, and signout
 * 
 * Hooks:
 * 
 * useSignup()
 * - Registers new user account
 * - Stores JWT token in localStorage
 * - Invalidates user query cache
 * - Auto-redirects to dashboard based on role
 * - Returns: mutation object with mutate/mutateAsync functions
 * 
 * useSignin()
 * - Authenticates existing user
 * - Stores JWT token in localStorage
 * - Debug logging for authentication flow
 * - Invalidates user query cache
 * - Auto-redirects based on role (admin/user)
 * - Returns: mutation object with mutate/mutateAsync functions
 * 
 * useLoggedInUser()
 * - Fetches current authenticated user data
 * - Checks localStorage for token before API call
 * - Returns null if no token or 401 response
 * - Query config:
 *   - staleTime: 5 minutes (data fresh for 5 min)
 *   - cacheTime: 10 minutes (cache persists 10 min)
 *   - refetchOnMount: true (refresh on component mount)
 *   - refetchOnWindowFocus: false (don't refetch on tab focus)
 *   - retry: Skip retries on 401 (expected when logged out)
 * - Returns: query object with data (user), isLoading, error
 * 
 * useSignOut()
 * - Logs out current user
 * - Removes token from localStorage
 * - Clears user data from React Query cache
 * - Invalidates user queries
 * - Redirects to /auth/signin
 * - Returns: mutation object with mutate function
 * 
 * Integration with React Query:
 * - Automatic cache invalidation on auth state changes
 * - Optimistic updates for better UX
 * - Background refetching for fresh data
 * - Error handling with retry logic
 * 
 * Token Management:
 * - Stored in localStorage for persistence
 * - Auto-attached to requests via axios interceptor
 * - Cleared on logout or 401 errors
 * 
 * Usage:
 * const { mutate: signup } = useSignup();
 * const { mutate: signin } = useSignin();
 * const { data: user, isLoading } = useLoggedInUser();
 * const { mutate: signout } = useSignOut();
 */
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiInstance } from "../utils/axios";

export const useSignup = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({ firstName, lastName, email, password }) => {
      const { data } = await apiInstance.post("/api/auth/signup", {
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
      const userRole = data.data.user.role;
      if (userRole === 'admin') {
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
      console.log('🔍 Auth Debug - Signin attempt for:', email);
      const { data } = await apiInstance.post("/api/auth/signin", {
        email,
        password,
      });
      console.log('🔍 Auth Debug - Signin response:', data);
      
      const token = data.data.token;
      if (token) {
        localStorage.setItem("token", token);
        console.log('🔍 Auth Debug - Token saved to localStorage');
      }
      return data;
    },
    onSuccess: async (data) => {
      console.log('🔍 Auth Debug - Signin success, invalidating queries');
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      
      // Redirect based on user role
      const userRole = data.data.user.role;
      console.log('🔍 Auth Debug - User role:', userRole, 'Redirecting...');
      
      if (userRole === 'admin') {
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
        
        if (!token) {
          return null;
        }
        
        const { data } = await apiInstance.get("/api/auth/me");
        
        if (!data.isLoggedIn) {
          return null;
        }
        
        return data.data.user;
      } catch (error) {
        // 401 is expected when not logged in, don't log as error
        if (error.response?.status === 401) {
          return null;
        }
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
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
      // Redirecting to sign-in page
      router.push("/auth/signin");
    },
  });
};
