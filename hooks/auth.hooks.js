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
