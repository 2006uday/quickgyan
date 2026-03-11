"use client"

import React from "react"

import { useAuth } from "@/lib/auth-context"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()

  console.log("Client Side User Data (from DashboardLayout):", user);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Only render the dashboard if user is confirmed


  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <DashboardHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-hidden relative">{children}</main>
      </div>
    </div>
  )
}

