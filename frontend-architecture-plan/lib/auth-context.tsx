"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string
  name: string
  email: string
  enrollmentNo: string
  role: "student" | "admin"
  createdAt: string
}

export interface SignupData {
  name: string
  email: string
  enrollmentNo: string
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  /** POST /auth/login — validates credentials and triggers OTP dispatch */
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  /** POST /auth/otp/verify — verifies the 6-digit OTP for login or signup */
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>
  /** POST /auth/otp — (re)sends an OTP to the given email */
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>
  /** POST /auth/signup then POST /auth/otp — registers a new user and dispatches OTP */
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  askAI: (message: string) => Promise<{ success: boolean; response?: string; error?: string }>
  logout: () => void
  updateProfile: (data: User) => Promise<{ success: boolean; error?: string }>
  deleteAccount: (id: string) => Promise<{ success: boolean; error?: string }>
  checkUser: () => Promise<void>
  verifyOldPassword: (oldPassword: string) => Promise<{ success: boolean; email?: string; error?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
}

// ---------------------------------------------------------------------------
// Base URL — change once, works everywhere
// ---------------------------------------------------------------------------

const API_BASE = "http://localhost:8060/auth"
const API_BASE_AI = "http://localhost:8060/ai-chat"


const axiosConfig = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
}

/** Extracts a human-readable error message from an axios error */
function extractError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      fallback
    )
  }
  return "An unexpected error occurred."
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialUser }: { children: ReactNode, initialUser?: User | null }) {
  const [isLoading, setIsLoading] = useState(!initialUser)

  // ---------------------------------------------------------------------------
  // Session hydration
  // ---------------------------------------------------------------------------

  const [user, setUser] = useState<User | null>(initialUser || null)

  const checkUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/me`, axiosConfig);
      if (res.data?.user) {
        const u = res.data.user;
        const userData: User = {
          id: u.id || u._id,
          name: u.username || u.name || "",
          email: u.email || "",
          enrollmentNo: u.enrollment_no || u.enrollmentNo || "",
          role: u.role || "student",
          createdAt: u.createdAt || new Date().toISOString(),
        };
        setUser(userData);
      }
    } catch (err) {
      // Not logged in or session expired
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, [])

  // ---------------------------------------------------------------------------
  // API: Login — POST /auth/login
  // ---------------------------------------------------------------------------

  const updateProfile = async (
    data: User,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("data : ", data);

      const res = await axios.put(`http://localhost:8060/auth/update`, data, axiosConfig)
      if (res.data?.user) {
        const u = res.data.user;
        const userData: User = {
          id: u.id || u._id,
          name: u.username || u.name || "",
          email: u.email || "",
          enrollmentNo: u.enrollment_no || u.enrollmentNo || "",
          role: u.role || "student",
          createdAt: u.createdAt || new Date().toISOString(),
        };
        setUser(userData);
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to update profile. Please try again.") }
    }
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      })

      if (res.data?.user) {
        const u = res.data.user;
        const userData: User = {
          id: u.id || u._id,
          name: u.username || u.name || "",
          email: u.email || "",
          enrollmentNo: u.enrollment_no || u.enrollmentNo || "",
          role: u.role || "student",
          createdAt: u.createdAt || new Date().toISOString(),
        };
        setUser(userData);
      }
      setIsLoading(false)

      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Invalid credentials. Please try again.") }
    }
  }

  // ---------------------------------------------------------------------------
  // API: Verify OTP — POST /auth/otp/verify
  // ---------------------------------------------------------------------------

  const verifyOtp = async (
    email: string,
    otp: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post(`${API_BASE}/otp/verify`, { email, otp }, axiosConfig)

      // If the API returns a user (Conclusion of login/signup), use it
      if (res.data?.user) {
        const u = res.data.user;
        const userData: User = {
          id: u.id || u._id,
          name: u.username || u.name || "",
          email: u.email || "",
          enrollmentNo: u.enrollment_no || u.enrollmentNo || "",
          role: u.role || "student",
          createdAt: u.createdAt || new Date().toISOString(),
        }
        setUser(userData)
      } else {
        // Otherwise, refresh the state from the session cookies to ensure all fields are loaded
        await checkUser()
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Invalid OTP. Please try again.") }
    }
  }

  // ---------------------------------------------------------------------------
  // API: Send / Resend OTP — POST /auth/otp
  // ---------------------------------------------------------------------------

  const sendOtp = async (
    email: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("email : ", email);

      await axios.post(`${API_BASE}/otp`, { email }, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to send OTP. Please try again.") }
    }
  }

  // ---------------------------------------------------------------------------
  // API: Signup — POST /auth/signup → POST /auth/otp
  // ---------------------------------------------------------------------------

  const signup = async (
    data: SignupData,
  ): Promise<{ success: boolean; error?: string }> => {
    // 2. Trigger OTP dispatch to the registered email
    const otpResult = await sendOtp(data.email)
    if (!otpResult.success) {
      // Registration succeeded but OTP dispatch failed — still let the page
      // know signup was ok; it can offer a resend button.
      console.warn("Signup succeeded but OTP send failed:", otpResult.error)
    }
    try {
      // 1. Register the user
      await axios.post('http://localhost:8060/auth/signup', {
        username: data.name,
        email: data.email,
        enrollment_no: data.enrollmentNo,
        password: data.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Signup failed. Please try again.") }
    }
  }

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  const logout = async () => {
    try {
      console.log("Logout API call started");
      console.log("axiosConfig : ", axiosConfig);
      console.log("API_BASE : ", API_BASE);
      await new Promise(resolve => setTimeout(resolve, 10));
      await axios.get(`http://localhost:8060/auth/logout`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true,
      }
      );
      setUser(null)
      console.log("Logout API call successful");

    } catch (err) {
      console.error("Logout API call failed:", err)
    } finally {
      setUser(null)
      localStorage.removeItem("quickgyan_user")
      // Redirect to login page
      window.location.href = "/login"
    }
  }

  // ---------------------------------------------------------------------------
  // AI Chat API
  // ---------------------------------------------------------------------------

  const askAI = async (message: string): Promise<{ success: boolean; response?: string; error?: string }> => {
    try {
      const res = await axios.post(API_BASE_AI, { message }, axiosConfig)
      return { success: true, response: res.data.response }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to get AI response. Please try again.") }
    }
  }

  const deleteAccount = async (
    id: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("id : ", id);
      const res = await axios.delete(`${API_BASE}/delete-account/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to delete account. Please try again.") }
    }
  }

  const verifyOldPassword = async (oldPassword: string): Promise<{ success: boolean; email?: string; error?: string }> => {
    try {
      const res = await axios.post(`${API_BASE}/verify-old-password`, { oldPassword }, axiosConfig)
      return { success: true, email: res.data.email }
    } catch (err) {
      return { success: false, error: extractError(err, "Incorrect old password.") }
    }
  }

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axios.put(`${API_BASE}/password-change`, { newPassword }, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to change password.") }
    }
  }

  // ---------------------------------------------------------------------------
  // Provider
  // ---------------------------------------------------------------------------

  return (
    <AuthContext.Provider value={{
      updateProfile,
      deleteAccount,
      user,
      isLoading,
      login,
      verifyOtp,
      sendOtp,
      signup,
      askAI,
      logout,
      checkUser,
      verifyOldPassword,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
