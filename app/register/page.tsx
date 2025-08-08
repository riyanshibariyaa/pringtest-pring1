"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Eye, EyeOff, User, Mail, Phone, Briefcase, Calendar } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const validateMobile = (mobile: string): boolean => {
  // Basic mobile validation - adjust regex based on your requirements
  const mobileRegex = /^[+]?[\d\s\-\(\)]{10,}$/
  return mobileRegex.test(mobile.trim())
}
export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // name: "",
    // email: "",
    // mobile: "",
    // password: "",
    // confirmPassword: "",
    // typeOfWork: "",
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    typeOfWork: "",
    bio: "",
    company: "",
    location: "",
  }
  
)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return
      }

      if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.dateOfBirth || !formData.gender || !formData.typeOfWork) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }
      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        })
        return
      }
      
      if (!validateMobile(formData.mobile)) {
      toast({
        title: "Error",
        description: "Please enter a valid mobile number",
        variant: "destructive",
      })
      return
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // // Set default values for optional fields
          // dateOfBirth: new Date().toISOString().split("T")[0], // Default to today
          // gender: "prefer-not-to-say", // Default gender
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Auto-login after successful registration
        localStorage.setItem("user", JSON.stringify(data.user))
        toast({
          title: "Success",
          description: "Account created successfully! Welcome to your dashboard.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Registration failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <><div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-brand-blue p-3 rounded-lg">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Pring</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-gray-400">Join Pring to create your secure professional QR code</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-medium">
              Full Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="b-style text-white placeholder-gray-400 focus:border-brand-blue" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className="b-style text-white placeholder-gray-400 focus:border-brand-blue" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-white font-medium">
              Mobile Number *
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="+1234567890"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              required
              className="b-style text-white placeholder-gray-400 focus:border-brand-blue" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white font-medium">
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="b-style text-white placeholder-gray-400 focus:border-brand-blue" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white font-medium">
              Confirm Password *
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
              className="b-style text-white placeholder-gray-400 focus:border-brand-blue" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeOfWork" className="text-white font-medium">
              Type of Work *
            </Label>
            <Input
              id="typeOfWork"
              type="text"
              placeholder="e.g., Software Engineer, Carpenter, Doctor"
              value={formData.typeOfWork}
              onChange={(e) => handleInputChange("typeOfWork", e.target.value)}
              required
              className="b-style text-white placeholder-gray-400 focus:border-brand-blue" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-white font-medium flex items-center">
              <User className="h-4 w-4 mr-2 text-brand-blue" />
              Gender *
            </Label>
            <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
              <SelectTrigger className="b-style text-white placeholder-gray-400 focus:border-brand-blue">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="male" className="text-white hover:bg-gray-800">
                  Male
                </SelectItem>
                <SelectItem value="female" className="text-white hover:bg-gray-800">
                  Female
                </SelectItem>
                <SelectItem value="other" className="text-white hover:bg-gray-800">
                  Other
                </SelectItem>
                <SelectItem value="prefer-not-to-say" className="text-white hover:bg-gray-800">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          


          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-white font-medium">
              <Calendar className="h-4 w-4 mr-2 text-brand-blue" />
              Date of Birth *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              required
              className="b-style text-white placeholder-gray-400 focus:border-brand-blue" />
          </div>

      
    

      <Button
        type="submit"
        className="w-full b-style py-3 text-lg font-medium"
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>

    <div className="mt-8 text-center">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-blue hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
  </>


  )}

  // "use client"

// import type React from "react"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { QrCode, Eye, EyeOff } from "lucide-react"
// import { toast } from "@/hooks/use-toast"

// const validateMobile = (mobile: string): boolean => {
//   // Basic mobile validation - adjust regex based on your requirements
//   const mobileRegex = /^[+]?[\d\s\-\(\)]{10,}$/
//   return mobileRegex.test(mobile.trim())
// }
// export default function RegisterPage() {
//   const router = useRouter()
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     password: "",
//     confirmPassword: "",
//     typeOfWork: "",
//   }
  
// )

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       // Validation
//       if (formData.password !== formData.confirmPassword) {
//         toast({
//           title: "Error",
//           description: "Passwords do not match",
//           variant: "destructive",
//         })
//         return
//       }

//       if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.typeOfWork) {
//         toast({
//           title: "Error",
//           description: "All fields are required",
//           variant: "destructive",
//         })
//         return
//       }
      
//       if (!validateMobile(formData.mobile)) {
//       toast({
//         title: "Error",
//         description: "Please enter a valid mobile number",
//         variant: "destructive",
//       })
//       return
//       }

//       const response = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ...formData,
//           // Set default values for optional fields
//           dateOfBirth: new Date().toISOString().split("T")[0], // Default to today
//           gender: "prefer-not-to-say", // Default gender
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         // Auto-login after successful registration
//         localStorage.setItem("user", JSON.stringify(data.user))
//         toast({
//           title: "Success",
//           description: "Account created successfully! Welcome to your dashboard.",
//         })
//         router.push("/dashboard")
//       } else {
//         toast({
//           title: "Error",
//           description: data.error || "Registration failed",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Something went wrong. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center space-x-3 mb-6">
//             <div className="bg-brand-blue p-3 rounded-lg">
//               <QrCode className="h-8 w-8 text-white" />
//             </div>
//             <span className="text-3xl font-bold text-white">Pring</span>
//           </div>
//           <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
//           <p className="text-gray-400">Join Pring to create your secure professional QR code</p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2">
//             <Label htmlFor="name" className="text-white font-medium">
//               Full Name *
//             </Label>
//             <Input
//               id="name"
//               type="text"
//               placeholder="Your full name"
//               value={formData.name}
//               onChange={(e) => handleInputChange("name", e.target.value)}
//               required
//               className="b-style text-white placeholder-gray-400 focus:border-brand-blue"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="email" className="text-white font-medium">
//               Email Address *
//             </Label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="your@email.com"
//               value={formData.email}
//               onChange={(e) => handleInputChange("email", e.target.value)}
//               required
//               className="b-style text-white placeholder-gray-400 focus:border-brand-blue"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="mobile" className="text-white font-medium">
//               Mobile Number *
//             </Label>
//             <Input
//               id="mobile"
//               type="tel"
//               placeholder="+1234567890"
//               value={formData.mobile}
//               onChange={(e) => handleInputChange("mobile", e.target.value)}
//               required
//               className="b-style text-white placeholder-gray-400 focus:border-brand-blue"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="password" className="text-white font-medium">
//               Password *
//             </Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={(e) => handleInputChange("password", e.target.value)}
//                 required
//                 className="b-style text-white placeholder-gray-400 focus:border-brand-blue"
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </Button>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="confirmPassword" className="text-white font-medium">
//               Confirm Password *
//             </Label>
//             <Input
//               id="confirmPassword"
//               type="password"
//               placeholder="Confirm your password"
//               value={formData.confirmPassword}
//               onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
//               required
//               className="b-style text-white placeholder-gray-400 focus:border-brand-blue"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="typeOfWork" className="text-white font-medium">
//               Type of Work *
//             </Label>
//             <Input
//               id="typeOfWork"
//               type="text"
//               placeholder="e.g., Software Engineer, Carpenter, Doctor"
//               value={formData.typeOfWork}
//               onChange={(e) => handleInputChange("typeOfWork", e.target.value)}
//               required
//               className="b-style text-white placeholder-gray-400 focus:border-brand-blue"
//             />
//           </div>

//           <Button
//             type="submit"
//             className="w-full b-style py-3 text-lg font-medium"
//             disabled={loading}
//           >
//             {loading ? "Creating Account..." : "Create Account"}
//           </Button>
//         </form>

//         <div className="mt-8 text-center">
//           <p className="text-gray-400">
//             Already have an account?{" "}
//             <Link href="/login" className="text-brand-blue hover:underline font-medium">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
