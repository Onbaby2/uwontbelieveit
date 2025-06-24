import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image compression utility
export function compressImage(file: File, maxWidth: number = 300, maxHeight: number = 300, quality: number = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height)

      // Convert to blob with higher compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Load image from file
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// File size validation with more restrictive limits
export function validateFileSize(file: File, maxSizeMB: number = 2): { isValid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024 // Convert MB to bytes
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    }
  }
  
  return { isValid: true }
}

// File type validation
export function validateImageType(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.`
    }
  }
  
  return { isValid: true }
}

interface UserData {
  user_metadata?: {
    firstName?: string
    lastName?: string
    avatar_url?: string
  }
  first_name?: string
  last_name?: string
  avatar_url?: string
  email?: string
}

// Get user avatar URL from user metadata or profile
export function getUserAvatarUrl(user: UserData): string {
  // First check user metadata (where avatars are stored after upload)
  if (user?.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url
  }
  
  // Fallback to profile avatar_url if available
  if (user?.avatar_url) {
    return user.avatar_url
  }
  
  // Default placeholder
  return "/placeholder.svg"
}

// Get user initials for avatar fallback
export function getUserInitials(user: UserData): string {
  const firstName = user?.user_metadata?.firstName || user?.first_name || ""
  const lastName = user?.user_metadata?.lastName || user?.last_name || ""
  const email = user?.email || ""
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  
  if (firstName) {
    return firstName[0].toUpperCase()
  }
  
  if (email) {
    return email[0].toUpperCase()
  }
  
  return "U"
}
