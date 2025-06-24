"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Shield, Heart, Users, Phone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp, createDevUser } from "@/lib/actions"
import { Loading } from "@/components/ui/loading"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium rounded-lg h-[60px] transition-all duration-200"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creating Account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}

export default function EnhancedSignUpForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signUp, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    agreeToTerms: false,
    agreeToPrivacy: false,
  })
  const [devLoading, setDevLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleInputChange = (field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDevSignup = async () => {
    setDevLoading(true)
    try {
      const result = await createDevUser()
      if (result.success) {
        setIsRedirecting(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        console.error("Dev signup failed:", result.error)
      }
    } catch (error) {
      console.error("Dev signup error:", error)
    } finally {
      setDevLoading(false)
    }
  }

  if (isRedirecting) {
    return <Loading fullScreen size="lg" />
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Join Our Family</h1>
        <p className="text-muted-foreground">Connect with our Islamic community of support and faith.</p>
      </div>

      <form action={formAction} className="space-y-5">
        {state?.error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>{state.error}</span>
            </div>
          </div>
        )}

        {state?.success && (
          <div className="bg-primary/10 border border-primary/50 text-primary px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>{state.success}</span>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                required
                className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                required
                className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              required
              className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                required
                className="h-11 pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="h-11 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                placeholder="Create password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="h-11 pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
              required
            />
            <label htmlFor="agreeToTerms" className="text-sm text-foreground cursor-pointer">
              I agree to the{" "}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToPrivacy"
              name="agreeToPrivacy"
              checked={formData.agreeToPrivacy}
              onCheckedChange={(checked) => handleInputChange("agreeToPrivacy", checked as boolean)}
              required
            />
            <label htmlFor="agreeToPrivacy" className="text-sm text-foreground cursor-pointer">
              I agree to the{" "}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>

        {/* Development Only - Skip Signup */}
        {process.env.NODE_ENV === "development" && (
          <div className="pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleDevSignup}
              disabled={devLoading}
              className="w-full border-border"
            >
              {devLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Dev Account...
                </>
              ) : (
                "Quick Dev Signup"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
