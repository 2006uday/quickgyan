"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Key, Mail, Lock, Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { verifyOldPassword, sendOtp, verifyOtp, changePassword } = useAuth()

  const [step, setStep] = useState(1) // 1: Old Password, 2: OTP, 3: New Password, 4: Success
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [oldPassword, setOldPassword] = useState("")
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userEmail, setUserEmail] = useState("")

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    setError("")
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = [...otp]
    pasted.split("").forEach((char, i) => { next[i] = char })
    setOtp(next)
    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerifyOldPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const res = await verifyOldPassword(oldPassword)
      if (res.success && res.email) {
        setUserEmail(res.email)
        const otpRes = await sendOtp(res.email)
        if (otpRes.success) {
          toast.success("Old password verified. OTP sent to your email.")
          setStep(2)
        } else {
          setError(otpRes.error || "Failed to send OTP.")
          toast.error(otpRes.error || "Failed to send OTP.")
        }
      } else {
        setError(res.error || "Incorrect old password.")
        toast.error(res.error || "Verification failed.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      toast.error("An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP.")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      const res = await verifyOtp(userEmail, code)
      if (res.success) {
        toast.success("OTP verified successfully.")
        setStep(3)
      } else {
        setError(res.error || "Invalid OTP.")
        toast.error(res.error || "Invalid OTP.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      toast.error("An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)
    try {
      const res = await changePassword(newPassword)
      if (res.success) {
        toast.success("Password changed successfully!")
        setStep(4)
      } else {
        setError(res.error || "Failed to change password.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[200px] w-[200px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {step === 4 ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : step === 2 ? (
              <Mail className="h-6 w-6 text-primary" />
            ) : (
              <Shield className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 2 ? "Verify OTP" : "Change Password"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Start by verifying your current password"}
            {step === 2 && `We sent a code to ${userEmail}`}
            {step === 3 && "Create a secure new password for your account"}
            {step === 4 && "Your security credentials have been updated"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <form onSubmit={handleVerifyOldPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="oldPassword"
                    type="password"

                    placeholder="Enter your current password"
                    className="pl-9"
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value)
                      setError("")
                    }}
                    required
                  />
                </div>

              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Send OTP"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className={[
                      "h-12 w-10 sm:w-12 rounded-lg border-2 bg-background text-center text-lg font-semibold",
                      "transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      error ? "border-destructive text-destructive" : digit ? "border-primary text-foreground" : "border-input text-muted-foreground",
                    ].join(" ")}
                  />
                ))}
              </div>

              {error && <p className="text-center text-sm text-destructive font-medium">{error}</p>}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" className="gap-2" disabled={isLoading || otp.join("").length < 6}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                </Button>
              </div>

              {/* Resend section to match signup page */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                <span>Didn't receive it?</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (userEmail) {
                      const res = await sendOtp(userEmail)
                      if (res.success) toast.success("OTP resent!")
                      else toast.error(res.error || "Failed to resend.")
                    }
                  }}
                  className="font-medium text-primary hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="New Password"
                      className="pl-9"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm New Password"
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-6 py-4 text-center">
              <p className="text-muted-foreground">
                Success! You can now use your new password to log in next time.
              </p>
              <Button onClick={() => router.push("/dashboard/settings")} className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
