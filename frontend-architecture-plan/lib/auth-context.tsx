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
  lastActive?: string
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
  addCourses: (courseName: string, courseCode: string, credits: number, semester: number) => Promise<{ success: boolean; error?: string }>
  getCourses: () => Promise<{ success: boolean; data?: any; error?: string }>
  updateCourse: (courseName: string, courseCode: string, credits: number, semester: number, id: string) => Promise<{ success: boolean; error?: string }>
  deleteCourse: (id: string) => Promise<{ success: boolean; error?: string }>
  getAdminStats: () => Promise<{ success: boolean; data?: any; error?: string }>
  getAllUsers: () => Promise<{ success: boolean; data?: any; error?: string }>
  updateUserStatus: (id: string, status: string) => Promise<{ success: boolean; error?: string }>
  sendAccountStatusEmail: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteUserByAdmin: (id: string) => Promise<{ success: boolean; error?: string }>
  getResources: () => Promise<{ success: boolean; data?: any; error?: string }>
  addAnnouncement: (title: string, content: string) => Promise<{ success: boolean; error?: string }>
  getAnnouncements: () => Promise<{ success: boolean; data?: any; error?: string }>
  getNotifications: () => Promise<{ success: boolean; data?: any; error?: string }>
  markNotificationAsRead: (id: string) => Promise<{ success: boolean; error?: string }>
  getAIHistory: () => Promise<{ success: boolean; data?: any; error?: string }>
  clearAIHistory: () => Promise<{ success: boolean; error?: string }>
  addResource: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  updateResource: (formData: FormData) => Promise<{ success: boolean; error?: string }>
  deleteResource: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteAnnouncement: (id: string) => Promise<{ success: boolean; error?: string }>
}

// ---------------------------------------------------------------------------
// Base URL — change once, works everywhere
// ---------------------------------------------------------------------------

const API_BASE_URL = "http://localhost:8060"
const API_BASE = `${API_BASE_URL}/auth`
const API_BASE_AI = `${API_BASE_URL}/ai-chat`
const API_BASE_COURSES = `${API_BASE_URL}/courses`
const API_BASE_RESOURCES = `${API_BASE_URL}/resources`
const API_BASE_NOTIFICATIONS = `${API_BASE_URL}/notifications`
const API_BASE_ANNOUNCEMENTS = `${API_BASE_URL}/announcements`


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
          lastActive: u.lastActive,
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
  const updateCourse = async (
    courseName: string,
    courseCode: string,
    credits: number,
    semester: number,
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.put(`${API_BASE_COURSES}/update-course`, { courseName, courseCode, credits, semester, id }, axiosConfig)
      if (res.data?.user) {
        const u = res.data.user;
        const userData: User = {
          id: u.id || u._id,
          name: u.username || u.name || "",
          email: u.email || "",
          enrollmentNo: u.enrollment_no || u.enrollmentNo || "",
          role: u.role || "student",
          createdAt: u.createdAt || new Date().toISOString(),
          lastActive: u.lastActive,
        };
        setUser(userData);
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to update course. Please try again.") }
    }
  }

  // ---------------------------------------------------------------------------
  // API: Login — POST /auth/login
  // ---------------------------------------------------------------------------

  const updateProfile = async (
    data: User,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("data : ", data);

      const res = await axios.put(`${API_BASE}/update`, data, axiosConfig)
      if (res.data?.user) {
        const u = res.data.user;
        const userData: User = {
          id: u.id || u._id,
          name: u.username || u.name || "",
          email: u.email || "",
          enrollmentNo: u.enrollment_no || u.enrollmentNo || "",
          role: u.role || "student",
          createdAt: u.createdAt || new Date().toISOString(),
          lastActive: u.lastActive,
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
          lastActive: u.lastActive,
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
          lastActive: u.lastActive,
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
      await axios.post(`${API_BASE}/signup`, {
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
      await axios.get(`${API_BASE}/logout`, {
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

  const addCourses = async (courseName: string, courseCode: string, credits: number, semester: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post(`${API_BASE_COURSES}/add-course`, { courseName, courseCode, credits, semester }, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to add course. Please try again.") }
    }
  }

  const getCourses = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const res = await axios.get(`${API_BASE_COURSES}/get-courses`, axiosConfig)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to get courses. Please try again.") }
    }
  }

  const deleteCourse = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axios.delete(`${API_BASE_COURSES}/delete-course`, {
        ...axiosConfig,
        data: { id }
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to delete course. Please try again.") }
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

  const getAdminStats = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const res = await axios.get(`${API_BASE}/admin/stats`, axiosConfig)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to get admin stats.") }
    }
  }

  const getAllUsers = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`, axiosConfig)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to get users list.") }
    }
  }

  const sendAccountStatusEmail = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axios.post(`${API_BASE}/admin/send-email`, { id }, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to send account status email.") }
    }
  }

  const updateUserStatus = async (id: string, status: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axios.put(`${API_BASE}/admin/status-update`, { id, status }, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to update user status.") }
    }
  }

  const deleteUserByAdmin = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axios.delete(`${API_BASE}/admin/delete-user`, {
        ...axiosConfig,
        data: { id }
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to delete user. Please try again.") }
    }
  }

  const getResources = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const res = await axios.get(`${API_BASE_RESOURCES}/getresource`, axiosConfig)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to get resources.") }
    }
  }

  const addAnnouncement = async (title: string, content: string) => {
    try {
      await axios.post(`${API_BASE_ANNOUNCEMENTS}/add`, { title, content }, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to add announcement") }
    }
  }

  const getAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_BASE_ANNOUNCEMENTS}/get`, axiosConfig)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to fetch announcements") }
    }
  }

  const getNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_NOTIFICATIONS}`, axiosConfig)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to fetch notifications") }
    }
  }

  const markNotificationAsRead = async (id: string) => {
    try {
      await axios.put(`${API_BASE_NOTIFICATIONS}/mark-read`, { id }, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to mark notification as read") }
    }
  }

  const getAIHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_AI}/history`, axiosConfig)
      return { success: true, data: res.data }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to fetch AI history") }
    }
  }

  const clearAIHistory = async () => {
    try {
      await axios.delete(`${API_BASE_AI}/clear`, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to clear AI history") }
    }
  }

  const addResource = async (formData: FormData) => {
    try {
      await axios.post(`${API_BASE_RESOURCES}/addresource`, formData, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          "Content-Type": "multipart/form-data",
        },
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to add resource") }
    }
  }

  const updateResource = async (formData: FormData) => {
    try {
      await axios.put(`${API_BASE_RESOURCES}/updateresource`, formData, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          "Content-Type": "multipart/form-data",
        },
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to update resource") }
    }
  }

  const deleteResource = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_RESOURCES}/deleteresource`, {
        ...axiosConfig,
        data: { id },
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to delete resource") }
    }
  }

  const deleteAnnouncement = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_ANNOUNCEMENTS}/delete/${id}`, axiosConfig)
      return { success: true }
    } catch (err) {
      return { success: false, error: extractError(err, "Failed to delete announcement") }
    }
  }

  // ---------------------------------------------------------------------------
  // Provider
  // ---------------------------------------------------------------------------

  return (
    <AuthContext.Provider value={{
      addCourses,
      updateCourse,
      deleteCourse,
      getCourses,
      updateProfile,
      deleteAccount,
      getAdminStats,
      getAllUsers,
      updateUserStatus,
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
      changePassword,
      sendAccountStatusEmail,
      deleteUserByAdmin,
      getResources,
      addAnnouncement,
      getAnnouncements,
      getNotifications,
      markNotificationAsRead,
      getAIHistory,
      clearAIHistory,
      addResource,
      updateResource,
      deleteResource,
      deleteAnnouncement
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
