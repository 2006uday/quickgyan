"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { Settings, Bell, Shield, Database, Globe, Mail, Key } from "lucide-react"

export default function AdminSettingsPage() {
  const router = useRouter()
  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">Platform Name</Label>
                <Input id="siteName" defaultValue="quickGyan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Platform URL</Label>
                <Input id="siteUrl" defaultValue="https://quickgyan.vercel.app" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Platform Description</Label>
              <Input
                id="description"
                defaultValue="Your One-Stop Platform for Academic Learning"
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New User Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when new users register
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resource Upload Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Notify users when new resources are added
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Maintenance Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Send maintenance notifications to users
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Platform security configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  New users must verify their email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">OTP for Login</p>
                <p className="text-sm text-muted-foreground">
                  Require OTP verification on every login
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">
                  Auto logout after inactivity (24 hours)
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Admin Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your administrator access credentials
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/dashboard/settings/change-password")}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Configuration</CardTitle>
            </div>
            <CardDescription>Configure email service settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" placeholder="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input id="smtpUser" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input id="smtpPass" type="password" placeholder="********" />
              </div>
            </div>
            <Button>Save Email Settings</Button>
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Database Status</CardTitle>
            </div>
            <CardDescription>MongoDB connection information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Host</span>
                <span className="text-sm font-mono">mongodb-atlas-cluster</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="text-sm font-mono">quickgyan_db</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Collections</span>
                <span className="text-sm">6 (users, courses, semesters, resources, ai_chats, admins)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
