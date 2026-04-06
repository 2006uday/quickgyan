"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { BookOpen, Loader2, MailCheck, RefreshCw } from "lucide-react"

export default function VerifyOtpPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") ?? ""

    const { verifyOtp, sendOtp } = useAuth()

    const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState("")
    const [resendCooldown, setResendCooldown] = useState(0)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return
        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [resendCooldown])

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1)
        const next = [...otp]
        next[index] = digit
        setOtp(next)
        setError("")
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        const next = [...otp]
        pasted.split("").forEach((char, i) => { next[i] = char })
        setOtp(next)
        const focusIndex = Math.min(pasted.length, 5)
        inputRefs.current[focusIndex]?.focus()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const code = otp.join("")
        if (code.length < 6) {
            setError("Please enter the complete 6-digit OTP.")
            return
        }
        setIsLoading(true)
        setError("")

        const result = await verifyOtp(email, code)
        console.log("Here is data :",result)
        if (result.success) {
            // verifyOtp already sets user in context + localStorage
            // so the dashboard AuthProvider will hydrate the session correctly
            router.push('/login')
        } else {
            setIsLoading(false)
            setError(result.error || "Invalid OTP. Please try again.")
            setOtp(Array(6).fill(""))
            inputRefs.current[0]?.focus()
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        setError("")
        const result = await sendOtp(email)
        setIsResending(false)
        if (result.success) {
            setResendCooldown(60)
        } else {
            setError(result.error || "Failed to resend OTP. Please try again.")
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
            {/* Background decoration */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/10 blur-3xl" />
            </div>

            <Link href="/" className="mb-8 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">quickGyan</span>
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-3 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <MailCheck className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                    <CardDescription className="text-sm">
                        We sent a 6-digit OTP to{" "}
                        {email ? (
                            <span className="font-medium text-foreground">{email}</span>
                        ) : (
                            "your email address"
                        )}
                        . Enter it below to complete your registration.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className={[
                                        "h-12 w-12 rounded-lg border-2 bg-background text-center text-lg font-semibold",
                                        "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                        digit ? "border-primary text-foreground" : "border-input text-muted-foreground",
                                        error ? "border-destructive" : "",
                                    ].join(" ")}
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-center text-sm text-destructive">{error}</p>
                        )}

                        <Button
                            id="verify-otp-btn"
                            type="submit"
                            className="w-full"
                            disabled={isLoading || otp.join("").length < 6}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify OTP"
                            )}
                        </Button>

                        {/* Resend section */}
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <span>Didn&apos;t receive it?</span>
                            <button
                                id="resend-otp-btn"
                                type="button"
                                onClick={handleResend}
                                disabled={isResending || resendCooldown > 0}
                                className="flex items-center gap-1 font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isResending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-3 w-3" />
                                )}
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                            </button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            Wrong email?{" "}
                            <Link href="/signup" className="font-medium text-primary hover:underline">
                                Go back
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
