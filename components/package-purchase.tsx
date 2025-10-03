import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Zap, Shield, Headphones } from "lucide-react"

interface PackageFeature {
  text: string
  included: boolean
}

interface Package {
  name: string
  price: string
  originalPrice?: string
  description: string
  features: PackageFeature[]
  popular?: boolean
  buttonText: string
  buttonVariant: "default" | "secondary" | "outline"
}

const packages: Package[] = [
  {
    name: "Starter",
    price: "$29",
    originalPrice: "$49",
    description: "Perfect for individuals getting started",
    features: [
      { text: "5 Projects", included: true },
      { text: "10GB Storage", included: true },
      { text: "Email Support", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Priority Support", included: false },
      { text: "Advanced Features", included: false },
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    name: "Professional",
    price: "$79",
    originalPrice: "$129",
    description: "Ideal for growing businesses and teams",
    features: [
      { text: "Unlimited Projects", included: true },
      { text: "100GB Storage", included: true },
      { text: "Priority Support", included: true },
      { text: "Advanced Analytics", included: true },
      { text: "Team Collaboration", included: true },
      { text: "Custom Integrations", included: true },
    ],
    popular: true,
    buttonText: "Start Free Trial",
    buttonVariant: "default",
  },
  {
    name: "Enterprise",
    price: "$199",
    originalPrice: "$299",
    description: "For large organizations with custom needs",
    features: [
      { text: "Everything in Professional", included: true },
      { text: "Unlimited Storage", included: true },
      { text: "24/7 Phone Support", included: true },
      { text: "Custom Branding", included: true },
      { text: "Advanced Security", included: true },
      { text: "Dedicated Account Manager", included: true },
    ],
    buttonText: "Contact Sales",
    buttonVariant: "secondary",
  },
]

const trustSignals = [
  { icon: Users, text: "10,000+ Happy Customers" },
  { icon: Shield, text: "Enterprise-Grade Security" },
  { icon: Headphones, text: "24/7 Customer Support" },
  { icon: Zap, text: "99.9% Uptime Guarantee" },
]

const packageData = {
  name: "Premium Package",
  price: "$79",
  originalPrice: "$129",
  description: "Everything you need to succeed",
  features: [
    { text: "Unlimited Projects", included: true },
    { text: "100GB Storage", included: true },
    { text: "Priority Support", included: true },
    { text: "Advanced Analytics", included: true },
    { text: "Team Collaboration", included: true },
    { text: "Custom Integrations", included: true },
    { text: "Mobile App Access", included: true },
    { text: "API Access", included: true },
  ],
  buttonText: "Get Started Now",
}

export function PackagePurchase() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4">Unlock Your Potential with Our Packages</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-8">
            Choose a plan that fits your needs and start achieving your goals today. All packages include our core
            features with no hidden fees.
          </p>

          {/* Trust Signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {trustSignals.map((signal, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <signal.icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-center">{signal.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                pkg.popular ? "ring-2 ring-primary shadow-lg scale-105" : ""
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                <CardDescription className="text-base">{pkg.description}</CardDescription>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-4xl font-bold text-primary">{pkg.price}</span>
                  <div className="flex flex-col">
                    {pkg.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">{pkg.originalPrice}</span>
                    )}
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {pkg.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className={`h-4 w-4 ${feature.included ? "text-primary" : "text-muted-foreground/40"}`} />
                    <span
                      className={`text-sm ${
                        feature.included ? "text-foreground" : "text-muted-foreground line-through"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  variant={pkg.buttonVariant}
                  size="lg"
                  className="w-full font-semibold transition-all duration-200 hover:scale-105"
                >
                  {pkg.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Single Package Card */}
        <div className="flex justify-center mb-16">
          <Card className="relative transition-all duration-300 hover:shadow-xl ring-2 ring-primary shadow-lg max-w-md w-full">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Best Value
            </Badge>

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl font-bold">{packageData.name}</CardTitle>
              <CardDescription className="text-base">{packageData.description}</CardDescription>
              <div className="flex items-center justify-center gap-2 mt-6">
                <span className="text-5xl font-bold text-primary">{packageData.price}</span>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground line-through">{packageData.originalPrice}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <p className="text-sm text-primary font-medium mt-2">Save 39% with this offer!</p>
            </CardHeader>

            <CardContent className="space-y-4">
              <h3 className="font-semibold text-center mb-4">What's included:</h3>
              {packageData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pt-6 flex flex-col gap-4">
              <Button
                size="lg"
                className="w-full font-semibold text-lg py-6 transition-all duration-200 hover:scale-105"
              >
                {packageData.buttonText}
              </Button>
              <p className="text-xs text-muted-foreground text-center">30-day money-back guarantee • Cancel anytime</p>
            </CardFooter>
          </Card>
        </div>

        {/* Testimonial Section */}
        <div className="bg-card rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-lg font-medium text-balance mb-4">
            "This platform transformed how we manage our projects. The Professional plan gave us everything we needed to
            scale our business efficiently."
          </blockquote>
          <cite className="text-muted-foreground">— Sarah Johnson, CEO at TechStart Inc.</cite>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Questions about our packages? We're here to help.</p>
          <Button variant="outline" size="lg">
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  )
}
