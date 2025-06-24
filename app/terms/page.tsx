import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Heart, Users, Shield, AlertTriangle, CheckCircle } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">Community guidelines</p>
          <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Heart className="h-5 w-5 mr-2 text-primary" />
                Community Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our platform follows Islamic principles of compassion, justice, and mutual support.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center text-card-foreground">
                    <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                    We Encourage
                  </h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Respectful communication</li>
                    <li>Supporting family members</li>
                    <li>Sharing resources</li>
                    <li>Prayer and encouragement</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center text-card-foreground">
                    <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                    We Prohibit
                  </h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Hate speech</li>
                    <li>Harassment</li>
                    <li>Inappropriate content</li>
                    <li>Fraudulent activities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Platform Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Account Responsibilities</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Keep information accurate</li>
                  <li>Secure your credentials</li>
                  <li>Report suspicious activities</li>
                  <li>Use real identity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Financial Transactions</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>All support must be voluntary</li>
                  <li>No coercion for contributions</li>
                  <li>Clear donation documentation</li>
                  <li>Comply with regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Your Rights</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Know what data we collect</li>
                  <li>Access and correct information</li>
                  <li>Withdraw consent anytime</li>
                  <li>File complaints</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-3">
              <Heart className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Our Promise</h3>
                <p className="text-muted-foreground">
                  We&apos;re committed to creating a safe, supportive environment guided by Islamic principles. These terms
                  protect our community and help us serve our mission of strengthening families.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
