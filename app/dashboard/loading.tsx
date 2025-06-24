import { Loading } from "@/components/ui/loading"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    </div>
  )
} 