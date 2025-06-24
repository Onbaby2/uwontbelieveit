"use client"

import type React from "react"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, User, Mail, Phone, MapPin, FileText, AlertCircle } from "lucide-react"
import { updateUserProfile } from "@/lib/actions"
import { compressImage, validateFileSize, validateImageType } from "@/lib/utils"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating Profile...
        </>
      ) : (
        "Update Profile"
      )}
    </Button>
  )
}

interface ProfileCustomizationProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      firstName?: string
      lastName?: string
      phoneNumber?: string
      bio?: string
      location?: string
      avatar_url?: string
    }
  }
  onClose: () => void
}

export default function ProfileCustomization({ user, onClose }: ProfileCustomizationProps) {
  const [state, formAction] = useActionState(updateUserProfile, null)
  const [avatarPreview, setAvatarPreview] = useState(user.user_metadata?.avatar_url || "")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const userInitials =
    user.user_metadata?.firstName && user.user_metadata?.lastName
      ? `${user.user_metadata.firstName[0]}${user.user_metadata.lastName[0]}`
      : user.email?.[0].toUpperCase() ?? ""

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Clear previous errors
    setUploadError(null)

    // Validate file type
    const typeValidation = validateImageType(file)
    if (!typeValidation.isValid) {
      setUploadError(typeValidation.error || "Invalid file type")
      return
    }

    // Validate file size (before compression) - more restrictive limit
    const sizeValidation = validateFileSize(file, 5) // Allow up to 5MB before compression
    if (!sizeValidation.isValid) {
      setUploadError(sizeValidation.error || "File too large")
      return
    }

    try {
      setIsCompressing(true)
      
      // Compress the image with more aggressive settings
      const compressedFile = await compressImage(file, 300, 300, 0.7)
      
      // Validate compressed file size
      const compressedSizeValidation = validateFileSize(compressedFile, 1) // Max 1MB after compression
      if (!compressedSizeValidation.isValid) {
        setUploadError(`Image is still too large after compression. Please try a smaller image.`)
        return
      }
      
      // Show preview of compressed image
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(compressedFile)
      
      // Show compression info
      const originalSize = (file.size / (1024 * 1024)).toFixed(2)
      const compressedSize = (compressedFile.size / (1024 * 1024)).toFixed(2)
      console.log(`Image compressed: ${originalSize}MB → ${compressedSize}MB`)
      
    } catch (error) {
      console.error('Image compression error:', error)
      setUploadError('Failed to process image. Please try again with a smaller image.')
    } finally {
      setIsCompressing(false)
    }
  }

  // Close dialog on successful update
  if (state?.success) {
    setTimeout(() => {
      onClose()
      window.location.reload() // Refresh to show updated profile
    }, 1000)
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-primary/10 border border-primary/50 text-primary px-4 py-3 rounded-lg">{state.success}</div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarPreview || "/placeholder.svg"} alt="Profile" />
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-medium">{userInitials}</AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar"
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors"
          >
            {isCompressing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={isCompressing}
          />
        </div>
        
        {/* Upload Instructions and Error Display */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Click the upload icon to change your profile picture
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: JPEG, PNG, WebP, GIF (max 5MB, will be compressed to 300x300px)
          </p>
          
          {uploadError && (
            <div className="flex items-center space-x-2 text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-3 w-3" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="flex items-center text-sm font-medium text-foreground">
              <User className="mr-2 h-4 w-4" />
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              defaultValue={user.user_metadata?.firstName || ""}
              placeholder="Enter first name"
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="flex items-center text-sm font-medium text-foreground">
              <User className="mr-2 h-4 w-4" />
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              defaultValue={user.user_metadata?.lastName || ""}
              placeholder="Enter last name"
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="flex items-center text-sm font-medium text-foreground">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={user.email ?? ""}
            disabled
            className="bg-muted border-border text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="flex items-center text-sm font-medium text-foreground">
            <Phone className="mr-2 h-4 w-4" />
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            defaultValue={user.user_metadata?.phoneNumber || ""}
            placeholder="+234 XXX XXX XXXX"
            className="bg-input border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="flex items-center text-sm font-medium text-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            Location
          </label>
          <Input
            id="location"
            name="location"
            type="text"
            defaultValue={user.user_metadata?.location || ""}
            placeholder="City, Country"
            className="bg-input border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="flex items-center text-sm font-medium text-foreground">
            <FileText className="mr-2 h-4 w-4" />
            Bio
          </label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={user.user_metadata?.bio || ""}
            placeholder="Tell us about yourself..."
            rows={3}
            className="bg-input border-border text-foreground resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">
          Cancel
        </Button>
        <div className="flex-1">
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}
