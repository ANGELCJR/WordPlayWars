import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // If we get a 401 error, consider the user as not authenticated but not loading
  const isUnauthenticated = error && (error as any).message?.includes('401');
  
  return {
    user,
    isLoading: isLoading && !isUnauthenticated,
    isAuthenticated: !!user,
  };
}
