import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, email, mobile, password, dateOfBirth, gender, typeOfWork, bio, company, location } = body

    // Validation
    if (!name || !email || !mobile || !password || !dateOfBirth || !gender || !typeOfWork) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    // // Validate mobile number (basic validation)
    // if (!mobile.trim()) {
    //   return NextResponse.json({ error: "Mobile number is required" }, { status: 400 })
    // }

    // // Check if user already exists with email or mobile
    // const existingUser = await User.findOne({
    //   $or: [
    //     { email: email.toLowerCase() },
    //     { mobile: mobile.trim() },
    //   ],
    // })

    // if (existingUser) {
    //   if (existingUser.email === email.toLowerCase()) {
    //     return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    //   }
    //   if (existingUser.mobile === mobile.trim()) {
    //     return NextResponse.json({ error: "User already exists with this mobile number" }, { status: 409 })
    //   }
    
    // Validate date of birth
    const birthDate = new Date(dateOfBirth)
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 })
    }

    // Check age (must be at least 13 years old)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    if (age < 13) {
      return NextResponse.json({ error: "You must be at least 13 years old to register" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    // const user = new User({
    //   name: name.trim(),
    //   email: email.toLowerCase().trim(),
    //   mobile: mobile.trim(),
    //   password: hashedPassword,
    //   dateOfBirth: birthDate,
    //   gender,
    //   typeOfWork: typeOfWork.trim(),
    //   bio: bio ? bio.trim() : "",
    //   userType: "individual", // Default to individual
    //   isActive: true,
    // })
    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      dateOfBirth: birthDate,
      gender,
      typeOfWork,
      bio: bio || "",
      company: company || "",
      location: location || "",
      profilePicture: "",
      socialLinks: {
        linkedin: "",
        twitter: "",
        instagram: "",
        facebook: "",
        website: "",
      },
      privacy: {
        showEmail: true,
        showMobile: true,
        showDateOfBirth: false,
        allowProfileViews: true,
        allowConnectionRequests: true,
      },
      isVerified: false,
      isActive: true,
    })

    await user.save()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json({
      message: "User registered successfully",
      user: userResponse,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
      }
      if (error.keyPattern?.mobile) {
        return NextResponse.json({ error: "User already exists with this mobile number" }, { status: 409 })
      }
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}





// import { type NextRequest, NextResponse } from "next/server"
// import bcrypt from "bcryptjs"
// import connectDB from "@/lib/mongodb"
// import User from "@/models/User"

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB()

//     const body = await request.json()
//     const { name, email, mobile, password, typeOfWork, bio } = body

//     // Validation
//     if (!name || !email || !mobile || !password || !typeOfWork) {
//       return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
//     }

//     // Validate mobile number (basic validation)
//     if (!mobile.trim()) {
//       return NextResponse.json({ error: "Mobile number is required" }, { status: 400 })
//     }

//     // Check if user already exists with email or mobile
//     const existingUser = await User.findOne({
//       $or: [
//         { email: email.toLowerCase() },
//         { mobile: mobile.trim() },
//       ],
//     })

//     if (existingUser) {
//       if (existingUser.email === email.toLowerCase()) {
//         return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
//       }
//       if (existingUser.mobile === mobile.trim()) {
//         return NextResponse.json({ error: "User already exists with this mobile number" }, { status: 409 })
//       }
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12)

//     // Create user
//     const user = new User({
//       name: name.trim(),
//       email: email.toLowerCase().trim(),
//       mobile: mobile.trim(),
//       password: hashedPassword,
//       typeOfWork: typeOfWork.trim(),
//       bio: bio ? bio.trim() : "",
//       userType: "individual", // Default to individual
//       isActive: true,
//     })

//     await user.save()

//     // Remove password from response
//     const userResponse = user.toObject()
//     delete userResponse.password

//     return NextResponse.json({
//       message: "User registered successfully",
//       user: userResponse,
//     })
//   } catch (error: any) {
//     console.error("Registration error:", error)

//     // Handle MongoDB validation errors
//     if (error.name === "ValidationError") {
//       return NextResponse.json({ error: error.message }, { status: 400 })
//     }

//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       if (error.keyPattern?.email) {
//         return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
//       }
//       if (error.keyPattern?.mobile) {
//         return NextResponse.json({ error: "User already exists with this mobile number" }, { status: 409 })
//       }
//       return NextResponse.json({ error: "User already exists" }, { status: 409 })
//     }

//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }