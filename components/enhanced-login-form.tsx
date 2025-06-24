"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff, Heart, Users, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn, createDevUser } from "@/lib/actions"
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
          Signing In...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function EnhancedLoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [devLoading, setDevLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      setIsRedirecting(true)
      setTimeout(() => {
        router.push("/")
      }, 1000)
    }
  }, [state, router])

  const handleDevLogin = async () => {
    setDevLoading(true)
    try {
      const result = await createDevUser()
      if (result.success) {
        setIsRedirecting(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        console.error("Dev login failed:", result.error)
      }
    } catch (error) {
      console.error("Dev login error:", error)
    } finally {
      setDevLoading(false)
    }
  }

  if (isRedirecting) {
    return <Loading fullScreen size="lg" />
  }

  return (
    <div className="w-full max-w-md space-y-6">
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
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

        <div className="space-y-4">
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
                placeholder="Enter password"
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
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            name="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <label htmlFor="rememberMe" className="text-sm text-foreground cursor-pointer">
            Remember me
          </label>
        </div>

        <SubmitButton />

        <div className="text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>

        {/* Development Only - Quick Login */}
        {process.env.NODE_ENV === "development" && (
          <div className="pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleDevLogin}
              disabled={devLoading}
              className="w-full border-border"
            >
              {devLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Dev Account...
                </>
              ) : (
                "Quick Dev Login"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}
