import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Users, Phone, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">How we protect your data</p>
          <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Personal Information</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Name, email, phone number</li>
                  <li>Family relationship information</li>
                  <li>Profile and preferences</li>
                  <li>Communication records</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Usage Information</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Platform usage patterns</li>
                  <li>Device information</li>
                  <li>Location data (with consent)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Security Measures</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>End-to-end encryption</li>
                  <li>Regular security audits</li>
                  <li>Secure data centers</li>
                  <li>24/7 monitoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-card-foreground">Compliance</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Nigerian Data Protection Regulation (NDPR)</li>
                  <li>International standards</li>
                  <li>Regular audits</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-card-foreground">Access Rights</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Request your data</li>
                    <li>Download data</li>
                    <li>Usage reports</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-card-foreground">Control Rights</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Update information</li>
                    <li>Delete account</li>
                    <li>Opt-out communications</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-card-foreground">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-card-foreground">Privacy Team</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>privacy@familysupport.ng</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>+234 XXX XXX XXXX</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-card-foreground">Response Time</h4>
                  <p className="text-muted-foreground">
                    We respond within 72 hours and resolve requests within 30 days per NDPR requirements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Our Commitment</h3>
                <p className="text-muted-foreground">
                  We protect your privacy with Islamic principles of trust and integrity. Your data is never sold and we
                  always seek consent before new uses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
