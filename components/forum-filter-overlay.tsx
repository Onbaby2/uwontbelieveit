"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-react"

interface Category {
  name: string
  count: number
  value: string
}

interface ForumFilterOverlayProps {
  categories: Category[]
  selectedCategory: string
  onCategorySelect: (category: string) => void
  onClose: () => void
}

export default function ForumFilterOverlay({
  categories,
  selectedCategory,
  onCategorySelect,
  onClose,
}: ForumFilterOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="bg-card border-border w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-card-foreground flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter by Category
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((category) => (
              <div
                key={category.value}
                onClick={() => {
                  onCategorySelect(category.value)
                  onClose()
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 ${
                  selectedCategory === category.value ? "border-primary bg-primary/10" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-card-foreground">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.count} {category.count === 1 ? "post" : "posts"}
                </p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                onCategorySelect("all")
                onClose()
              }}
              className="w-full"
            >
              Clear Filter - Show All Posts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
