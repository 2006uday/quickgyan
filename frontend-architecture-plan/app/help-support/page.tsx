import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HelpSupportPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Help & Support</h1>
          <div className="bg-card p-8 rounded-lg shadow-sm">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">How do I create an account?</h3>
                    <p className="text-muted-foreground">Click on the "Sign Up" button and fill in your details to create a new account.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How do I access course materials?</h3>
                    <p className="text-muted-foreground">Navigate to the Courses section in your dashboard after logging in.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">How does the AI Chat feature work?</h3>
                    <p className="text-muted-foreground">Use the AI Chat in your dashboard to ask questions about your courses and get instant help.</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
                <p className="text-muted-foreground mb-4">
                  If you can't find the answer you're looking for, our support team is here to help.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold">Contact Support</p>
                  <p>Email: support@quickgyan.com</p>
                  <p>Phone: +1 (555) 123-4567</p>
                  <p>Hours: Monday - Friday, 9 AM - 6 PM EST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}