"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Particles } from "@/components/ui/particles"
import {
  QrCode,
  Shield,
  Users,
  Building2,
  ArrowRight,
  Zap,
  Globe,
  BarChart3,
  Smartphone,
  Lock,
  Sparkles,
  TrendingUp,
  Star,
  Menu,
  X,
  CheckCircle,
  Play,
} from "lucide-react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
// --------------------------------------------------------------

  const personalFeatures = [
    {
      icon: QrCode,
      title: "Personal QR Profile",
      description: "Create your professional digital identity with a custom QR code",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Perfect viewing experience on all devices and screen sizes",
    },
    {
      icon: Shield,
      title: "Privacy Control",
      description: "Control who can access your information with approval requests",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Share your profile instantly with anyone, anywhere in the world",
    },
  ]

  const businessFeatures = [
    {
      icon: Users,
      title: "Team Management",
      description: "Manage unlimited employees and their professional QR profiles",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track profile views, engagement, and networking insights",
    },
    {
      icon: Building2,
      title: "Brand Customization",
      description: "Customize QR codes with your company branding and colors",
    },
    {
      icon: Zap,
      title: "Bulk Operations",
      description: "Generate and manage hundreds of QR codes with ease",
    },
  ]

  const personalPlans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for individuals getting started",
      features: ["1 QR Profile", "Basic Customization", "Mobile Responsive", "Email Support"],
      popular: false,
      cta: "Get Started Free",
      href: "/register",
    },
    {
      name: "Pro",
      price: "₹299",
      period: "month",
      description: "Advanced features for professionals",
      features: ["Unlimited QR Profiles", "Advanced Analytics", "Custom Branding", "Priority Support", "API Access"],
      popular: true,
      cta: "Start Pro Trial",
      href: "/register?plan=pro",
    },
  ]

  const businessPlans = [
    {
      name: "Startup",
      price: "₹999",
      period: "month",
      description: "Perfect for small teams",
      features: ["Up to 25 Employees", "Team Analytics", "Basic Branding", "Email Support"],
      popular: false,
      cta: "Start Free Trial",
      href: "/corporate/register?plan=startup",
    },
    {
      name: "Business",
      price: "₹2,999",
      period: "month",
      description: "Ideal for growing companies",
      features: ["Up to 100 Employees", "Advanced Analytics", "Full Branding", "Priority Support", "API Integration"],
      popular: true,
      cta: "Start Free Trial",
      href: "/corporate/register?plan=business",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations",
      features: ["Unlimited Employees", "Custom Features", "Dedicated Support", "On-premise Option", "SLA Guarantee"],
      popular: false,
      cta: "Contact Sales",
      href: "/contact",
    },
  ]
  // --------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Particles Background */}
      <Particles quantity={0} />

      {/* Header with Blur Effect */}
      <header
        className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-[94%] max-w-7xl rounded-full px-8 py-1 transition-all hover:shadow-glow-lg 
 duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-md border border-white/10"
            : "bg-black/60 backdrop-blur-sm border border-white/5"
        }`}
      >


        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div
            className={`flex items-center space-x-3 transition-all duration-1000 ${isVisible ? "animate-slide-up" : "opacity-0"}`}
          >
            <div className="bg-gradient-blue p-3 rounded-xl shadow-glow animate-pulse-glow">
              <QrCode className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Pring</span>
              <p className="text-brand-blue text-sm font-medium">Professional Networking</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link href="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-white/80 hover:text-white transition-colors">
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button className="b-style px-6 py-2.5 text-base font-semibold flex items-center justify-center rounded-full">
                  <span className="button-text">Personal Login</span>
                </Button>
              </Link>

              <Link href="/corporate/login">
                <Button className="b-style px-6 py-2.5 text-base font-semibold flex items-center justify-center rounded-full">
                  <span className="button-text">Corporate Login</span>
                </Button>
              </Link>

              <Link href="/register">
                <Button className="b-style px-6 py-2.5 text-base font-semibold flex items-center justify-center rounded-full">
                  <span className="button-text">Get Started</span>
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <nav className="space-y-4">
                <Link href="#features" className="block text-white/80 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="block text-white/80 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#about" className="block text-white/80 hover:text-white transition-colors">
                  About
                </Link>
              </nav>
              <div className="space-y-3 pt-4 border-t border-white/10">
                <Link href="/login">
                  <Button className="b-style px-6 py-2.5 text-base font-semibold flex items-center justify-center rounded-full">
                    <span className="button-text">Personal Login</span>
                  </Button>
                </Link>

                <Link href="/corporate/login">
                  <Button className="b-style px-6 py-2.5 text-base font-semibold flex items-center justify-center rounded-full">
                    <span className="button-text">Corporate Login</span>
                  </Button>
                </Link>

                <Link href="/register">
                  <Button className="b-style px-6 py-2.5 text-base font-semibold flex items-center justify-center rounded-full">
                    <span className="button-text">Get Started</span>
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </Link>     
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? "animate-scale-in" : "opacity-0"}`}>
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 b-style px-6 py-3 rounded-full text-white  shadow-glow animate-float">
              <Star className="h-5 w-5" />
              <span>Now with Advanced Analytics & Real-time Features</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Your Professional Identity in a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-blue-light animate-gradient">
              QR Code
            </span>
          </h1>

          <p className="text-lg md:text-1xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed">
            Create secure, permanent QR codes for individuals and teams. Share professional information safely with
            approval-based access control, real-time analytics, and enterprise-grade security.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            {/* Start Personal Account */}
            <Link href="/register">
              <Button
                size="sm"
                className="b-style px-8 py-2.5 text-base flex items-center"
              >
                <Users className="h-5 w-5 mr-2" />
                <span className="button-text">Start Personal Account</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            {/* Try Corporate Free */}
            <Link href="/corporate/register">
              <Button
                size="sm"
                className="b-style px-8 py-2.5 text-base flex items-center"
              >
                <Building2 className="h-5 w-5 mr-2" />
                <span className="button-text">Try Corporate Free</span>
                <Zap className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>




          {/* Feature Highlight */}
          <div className="bg-white/5 backdrop-blur-lg border border-brand-blue/30 p-5 rounded-3xl max-w-5xl mx-auto shadow-glow glass animate-float">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-blue p-2 rounded-full shadow-glow">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">🚀 Complete Solution Now Live!</h2>
            <p className="text-brand-blue-light mb-7 text-sm">
              Payment gateway integration, real-time analytics, webhook integrations, advanced security, mobile PWA, and
              enterprise-grade features.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-brand-blue mx-auto mb-2" />
                <p className="text-white font-medium">Real-time Analytics</p>
              </div>
              <div className="text-center">
                <Globe className="h-8 w-8 text-brand-blue mx-auto mb-2" />
                <p className="text-white font-medium">Payment Gateway</p>
              </div>
              <div className="text-center">
                <Smartphone className="h-8 w-8 text-brand-blue mx-auto mb-2" />
                <p className="text-white font-medium">Mobile PWA</p>
              </div>
              <div className="text-center">
                <Lock className="h-8 w-8 text-brand-blue mx-auto mb-2" />
                <p className="text-white font-medium">Enterprise Security</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 container mx-auto px-4 py-20">
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-16">
            Choose Your <span className="text-brand-blue">Solution</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-5 mb-20">
            {/* Personal Features */}
            <div className="space-y-8">
              <div className="text-center">
                <div className="bg-black border-2 border-brand-blue p-6 rounded-2xl w-fit mx-auto mb-6 shadow-glow animate-float">
                  <Users className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Personal Profiles</h3>
                <p className="text-white/70 mb-8 text-sm">Perfect for individuals, freelancers, and professionals</p>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                {[
                  {
                    icon: Shield,
                    title: "Secure Access Control",
                    desc: "Approval-based sharing with 24-hour access windows",
                  },
                  {
                    icon: QrCode,
                    title: "Permanent QR Code",
                    desc: "Never changes, even when you update your information",
                  },
                  { icon: BarChart3, title: "Personal Analytics", desc: "Track who views your profile and when" },
                  { icon: Smartphone, title: "Mobile Optimized", desc: "Perfect experience on all devices" },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-white/5 border-white/10 hover:border-brand-blue transition-all duration-300 hover-lift glass backdrop-blur-lg w-full"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-black border border-brand-blue p-2 rounded-lg shadow-glow">
                          <feature.icon className="h-3 w-3 text-brand-blue" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-base">{feature.title}</h4>
                          <p className="text-white/70 mt-2 text-sm">{feature.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Link href="/register" className="flex justify-center">
                <Button className="b-style px-8 py-4 text-lg transition-all duration-300 rounded-full">
                  <span className="button-text">Create Personal Profile</span>
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>


            </div>

            {/* Corporate Features */}
            <div className="space-y-8">
              <div className="text-center">
                <div className="bg-black border-2 border-brand-blue p-6 rounded-2xl w-fit mx-auto mb-6 shadow-glow animate-float">
                  <Building2 className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Corporate Portal</h3>
                <p className="text-white/70 mb-8 text-sm">Complete solution for teams and organizations</p>
              </div>

              <div className="space-y-6 max-w-md mx-auto">
                {[
                  {
                    icon: Users,
                    title: "Bulk Employee Management",
                    desc: "Add, manage, and generate QR codes for entire teams",
                  },
                  { icon: QrCode, title: "Custom Branding", desc: "Company colors, logos, and branded QR codes" },
                  { icon: BarChart3, title: "Advanced Analytics", desc: "Real-time dashboards and detailed reporting" },
                  { icon: Globe, title: "Payment Gateway", desc: "Secure payments with multiple options" },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-white/5 border-white/10 hover:border-brand-blue transition-all duration-300 hover-lift glass backdrop-blur-lg w-full"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-black border border-brand-blue p-2 rounded-lg shadow-glow">
                          <feature.icon className="h-3 w-3 text-brand-blue" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-base">{feature.title}</h4>
                          <p className="text-white/70 mt-2 text-sm">{feature.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Link href="/corporate/register" className="flex justify-center">
                <Button className="b-style px-8 py-4 text-lg transition-all duration-300 rounded-full">
                  <span className="button-text">Start Corporate Trial</span>
                  <Zap className="h-5 w-5 ml-2" />
                </Button>
              </Link>


            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 backdrop-blur-lg py-20">
        <div className="container mx-auto px-4">
          <div className={`transition-all duration-1000 delay-900 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
              Simple, <span className="text-brand-blue">Transparent</span> Pricing
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {[
                {
                  name: "Personal",
                  price: "Free",
                  desc: "Perfect for individuals",
                  features: ["1 Personal Profile", "Secure QR Code", "Access Control", "Basic Analytics"],
                  cta: "Get Started",
                  href: "/register",
                  popular: false,
                  gradient: "from-brand-blue to-brand-blue-dark",
                },
                {
                  name: "Corporate Free",
                  price: "Free",
                  desc: "Small teams",
                  features: ["5 Employees", "50 QR Codes", "Basic Branding", "Email Support"],
                  cta: "Start Free",
                  href: "/corporate/register",
                  popular: false,
                  gradient: "from-brand-blue to-brand-blue-dark",
                },
                {
                  name: "Corporate Basic",
                  price: "₹2,499",
                  desc: "per month",
                  features: [
                    "25 Employees",
                    "250 QR Codes",
                    "Custom Branding",
                    "Analytics Dashboard",
                    "Payment Gateway",
                  ],
                  cta: "Choose Basic",
                  href: "/corporate/register",
                  popular: true,
                  gradient: "from-brand-blue to-black",
                },
                {
                  name: "Corporate Premium",
                  price: "₹7,999",
                  desc: "per month",
                  features: ["100 Employees", "1000 QR Codes", "Advanced Analytics", "API Access", "Priority Support"],
                  cta: "Choose Premium",
                  href: "/corporate/register",
                  popular: false,
                  gradient: "from-black to-brand-blue",
                },
              ].map((plan, index) => (
                <Card
                  key={index}
                  className={`relative bg-white/5 border-2 transition-all duration-300 hover-lift glass backdrop-blur-lg ${
                    plan.popular ? "border-brand-blue shadow-glow scale-105" : "border-white/10 hover:border-brand-blue"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="b-style px-6 py-2 rounded-full text-white font-medium shadow-glow">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-brand-blue">{plan.price}</div>
                    <CardDescription className="text-white/70">{plan.desc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="bg-brand-blue rounded-full p-1">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="text-white text-sm">{feature}</span>
                      </div>
                    ))}
                    <Link href={plan.href}>
                      <Button
                        className={`b-style w-full mt-6 py-3 transition-all duration-300 hover-lift rounded-full`}
                      >
                        <span className="button-text">{plan.cta}</span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className={`transition-all duration-1000 delay-1000 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            See Pring in <span className="text-brand-blue">Action</span>
          </h2>

          {/* Image Grid - Ready for client images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Placeholder for client images */}
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-brand-blue transition-all duration-300 hover-lift glass"
              >
                <div className="aspect-video bg-gradient-to-br from-brand-blue/20 to-black rounded-xl mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-12 w-12 text-brand-blue mx-auto mb-2" />
                    <p className="text-white/60 text-sm">Image {index}</p>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">Feature Showcase {index}</h3>
                <p className="text-white/70 text-sm">Placeholder for client-provided image and description</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/60 text-lg">Ready to integrate your custom images and showcase content</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10  py-20">
        <div className="container mx-auto px-4 text-center">
          <div className={`transition-all duration-1000 delay-1100 ${isVisible ? "animate-scale-in" : "opacity-0"}`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              Ready to Transform Your Professional Networking?
            </h2>
            <p className="text-lg md:text-1xl mb-12 text-blue-100 max-w-4xl mx-auto">
              Join thousands of professionals and companies who trust Pring for secure, efficient networking with
              cutting-edge technology and secure payment processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="b-style px-10 py-4 text-lg flex items-center justify-center rounded-full"
                >
                  <Users className="h-6 w-6 mr-3" />
                  <span className="button-text">Start Personal Account</span>
                </Button>
              </Link>
              <Link href="/corporate/register">
                <Button
                  size="lg"
                  className="b-style px-10 py-4 text-lg flex items-center justify-center rounded-full"
                >
                  <Building2 className="h-6 w-6 mr-3" />
                  <span className="button-text">Try Corporate Free</span>
                  <Sparkles className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className={`transition-all duration-1000 delay-1300 ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-gradient-blue p-3 rounded-xl shadow-glow">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Pring</span>
            </div>
            <p className="text-white/70 text-sm">
              © 2025 Pring. All rights reserved. Secure professional networking with payment gateway integration.
            </p>
            <div className="mt-6 flex justify-center space-x-6">
              <Link href="/privacy" className="text-brand-blue hover:text-brand-blue-light transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-brand-blue hover:text-brand-blue-light transition-colors">
                Terms of Service
              </Link>
              <Link href="/api-docs" className="text-brand-blue hover:text-brand-blue-light transition-colors">
                API Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
