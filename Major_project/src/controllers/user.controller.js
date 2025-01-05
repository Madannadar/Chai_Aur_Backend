import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.models.js" // can input { } if the export is not default
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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

    const {fullname, username, email, passowrd} = req.body  // to get details from frontend
    // console.log("email:",email);

    // for one 
    // if(email === ""){
    //     throw new ApiError(400, "email is required")
    // }
    // for all 
    if (
        [fullname, email, username, passowrd].some((field) => {
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
    console.log("avatarLocalPath",avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(400, "avatar is nedded checking after uploading to cloudinary")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",  // if cover image not given then have empty string
        email,
        password,
        usrname: username.toLowerCase()
    })

    const createdUser = User.findById(user._id).select(
        "-password -refreshToken" // all this will be not selected because all are seleced by default
    ) // finding if the user exist
    if(!createdUser){
        throw new ApiError(500, "something went wrong while registeing the user ")
    }
    console.log(user);
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd succesfully")
    )
})

export {registerUser}