import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
  type Body_login_login_access_token as AccessToken,
  type UserPublic,
  type UserRegister,
  UsersService,
} from "@/client";

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null;
};

const useAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn(),
  });

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),

    onSuccess: () => {
      navigate({ to: "/login" });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const login = async (data: AccessToken) => {
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await fetch(
      "http://localhost:8000/api/v1/login/access-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        credentials: "include",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || "Login failed. Please check your credentials.",
      );
    }

    const result = await response.json();
    localStorage.setItem("access_token", result.access_token);
    return result;
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate({ to: "/login" });
  };

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    error,
    resetError: () => setError(null),
  };
};

export { isLoggedIn };
export default useAuth;
