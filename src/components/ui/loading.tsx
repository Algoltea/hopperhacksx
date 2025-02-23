import { cn } from "@/lib/utils"
import Image from "next/image"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Loader({ size = "md", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-32 h-32"
  }

  return (
    <div className={cn("relative animate-spin", sizeClasses[size], className)}>
      <Image
        src="/assets/hoppers/hopperloading.png"
        alt="Loading..."
        fill
        className="object-contain"
      />
    </div>
  )
} 