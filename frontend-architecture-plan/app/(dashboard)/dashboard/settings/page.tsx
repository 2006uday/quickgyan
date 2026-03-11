"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { User, Mail, GraduationCap, Shield, Bell, Loader2, Check } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    enrollmentNo: user?.enrollmentNo || "",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    newResources: true,
    announcements: true,
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setSaved(false)
  }

  // const handleSave = async () => {

  //   setIsSaving(true)
  //   // Simulate API call
  //   await new Promise((resolve) => setTimeout(resolve, 1000))
  //   setIsSaving(false)
  //   setSaved(true)
  // }

  const handleSave = async () => {
    const formdata = profile
    console.log("Profile form submitted:", formdata)
    setIsSaving(true)

  }

  // only one time name change is allowed
  //onchange disable the input field but 

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {profile.name.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">Student</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}

                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentNo">Enrollment Number</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="enrollmentNo"
                    name="enrollmentNo"
                    value={profile.enrollmentNo}
                    onChange={handleProfileChange}
                    className="pl-9"

                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enrollment number cannot be changed
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, email: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Resources</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when new study materials are added
                </p>
              </div>
              <Switch
                checked={notifications.newResources}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, newResources: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Announcements</p>
                <p className="text-sm text-muted-foreground">
                  Receive important announcements and updates
                </p>
              </div>
              <Switch
                checked={notifications.announcements}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, announcements: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password regularly for better security
                </p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <Separator />

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive" size="sm" className="mt-3">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
