import { Loader2 } from "lucide-react"

interface LoadingProps {
  message?: string
  className?: string
}

export function Loading({ message = "Loading...", className = "" }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}