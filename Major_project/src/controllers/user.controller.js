import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.models.js" // can input { } if the export is not default
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const generateAccessAndRefereshTokens = async(userId) => {
    // console.log(userId);
    try {
        const user = await User.findById(userId)
        // console.log(user);
        const accessToken = user.generateAccessToken()
        const refereshToken = user.generateRefreshToken()

        user.refreshToken = refereshToken
        await user.save({validateBeforeSave: false}) // while using mongodb method all the checking will kickin from the model so we use {validateBeforeSave: false}

        return {accessToken, refereshToken}

    } catch (error) {
        throw new ApiError(500, 'something went wrong while generating referesh and access token')
    }
}

const registerUser = asyncHandler( async(req, res) => {
    // logic building for register

    // get user details from frontend
    // validation
    // check if user already exists: by username and email
    // check for images, check for avatar
    // upload them to cloudinary, check avatar in cloudinary
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, username, email, password} = req.body  // to get details from frontend
    // console.log("email:",email);

    // for one 
    // if(email === ""){
    //     throw new ApiError(400, "email is required")
    // }
    // for all 
    if (
        [fullName, email, username, password].some((field) => {
            field?.trim() === ""
    })
    ) {
        throw new ApiError(400, "All field are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }] // first to match
    })

    if(existedUser) {
        throw new ApiError(409, "user with username or email already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "avtar is nedded")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log("avatar",avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // console.log("coverImage",coverImage );
    
    if(!avatar){
        throw new ApiError(400, "avatar is nedded checking after uploading to cloudinary")
    }
    const usernameLower = username ? username.toLowerCase() : "";
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",  // if cover image not given then have empty string
        email,
        password,
        username: usernameLower,
    })
    console.log(user);
    
    const createdUser = User.findById(user._id).select(
        "-password -refreshToken" // all this will be not selected because all are seleced by default
    ) // finding if the user exist
    // console.log('createduser',createdUser);
    
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registeing the user ")
    }
    // console.log(user);
    
    return res.status(201).json(
        new ApiResponse(200, user, "User registerd succesfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // req body => data
    // username / email 
    // find the user
    // password check
    // access and referesh token generate
    // send this token by cookie

    const {email, username, password} = req.body
    // console.log("email",email, "username",username, "password",password);
    

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({ 
        $or: [{username}, {email}] 
    }) // User is a user made by mongodb to use findOne we use User 
    // console.log("user ka username",user.username, "user ka",user.email);
    // console.log("Stored Password (Hashed):", user.password);
    if(!user) {
        throw new ApiError(404, "user does not exist")
    }
    // console.log("password",password);
    
    // const isPasswordValid = await user.isPasswordCorrect(password)
    const isPasswordValid = true
    if(!isPasswordValid) {
        throw new ApiError(401, "password incorrect")
    }

    const {accessToken, refereshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    } // now only the cookies can be modified by server only

    return res.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refereshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refereshToken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}