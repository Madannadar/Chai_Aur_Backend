import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from "../models/user.models.js" // can input { } if the export is not default
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt  from 'jsonwebtoken'
import { Subscription } from '../models/subscription.models.js'

const generateAccessAndRefereshTokens = async(userId) => {
    // console.log(userId);
    try {
        const user = await User.findById(userId)
        // console.log(user);
        const accessToken = user.generateAccessToken()
        // console.log("accessToken",accessToken);
        const refereshToken = user.generateRefreshToken()
        // console.log("refereshToken",refereshToken);

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
    // console.log(req.files);


    // for one 
    // if(email === ""){
    //     throw new ApiError(400, "email is required")
    // }
    // for all 
    if (
        [fullName, email, username, password].some((field) => {
            field?.trim() === ""
    })

    // undertanding trim() method:
    //const str = "   Hello, World!   ";
    // const trimmedStr = str.trim();
    // console.log(trimmedStr); // "Hello, World!"
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
    // console.log(user);
    
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
    

    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({ 
        $or: [{username}, {email}]  // $or is a mongodb operator
    }) // User is a user made by mongodb to use findOne we use User 
    // console.log("user ka username",user.username, "user ka",user.email);
    // console.log("Stored Password (Hashed):", user.password);
    if(!user) {
        throw new ApiError(404, "user does not exist")
    }
    // console.log("password",password);
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    // const isPasswordValid = true
    if(!isPasswordValid) {
        throw new ApiError(401, "password incorrect")
    }

    const {accessToken, refereshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    } // now the cookies can be modified by server only

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

const refereshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefereshToken = req.cookie.refereshToken || req.body.refereshToken // body se mobile se aata h refershToken

    if (!incomingRefereshToken) {
        throw new ApiError(401, "uauthorized request") // because the token sahi nahi h 
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefereshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "invalid referesh token")
        }
        if(incomingRefereshToken !== user?.refreshToken){
            throw new ApiError(401, "refersh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
            // now the cookies can be modified by server only
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie('accessToken',accessToken, options)
        .cookie('refreshToken',newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refereshToken: newRefreshToken},
                "Access Token refershed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    // req.body => currentPassword, newPassword
    // find the user
    // check the current password
    // update the password
    // return response

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const ispasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if(!ispasswordCorrect){
        throw new ApiError(401, "current password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{}, "password changed successfully"))
    // return res.status(200).json(new ApiResponse(200,{}, "password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user found and fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    // req.body => fullName, username, email
    // find the user
    // update the user
    // return response

    const {fullName, username, email} = req.body 
    // if upadating a file have a seperate controller
    if(!fullName || !username || !email){
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                username,
                // email: email  //same
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "user updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    // req.files => avatar
    // find the user
    // upload the avatar to cloudinary
    // update the user
    // return response

    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar in cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select('-password')

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    // req.files => coverImage
    // find the user
    // upload the coverImage to cloudinary
    // update the user
    // return response

    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400, "cover image is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image in cloudinary")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select('-password')
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "cover image updated successfully"))
    })

const getUserChannelProfile = asyncHandler(async(req, res) => {
    // req.params => username
    // find the user
    // return response

    const {username} = req.params // params means data from the url like /user/:username
    if(!username?.trim()){
        throw new ApiError(400, "username is required")
    }

    // User.find({username})
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'Channel',
                as: 'subscribers'
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as: "subscribedChannels"
            }
        },
        {
            $addFields:{
                SubscriptionCount: {
                    $size: "$subscribers" // $ for field
                },
                SubscribedChannelCount: {
                    $size: "$subscribedChannels"
                },
                issubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribers: 1,
                subscribedChannels: 1,
                issubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])
    // console.log(channel);  

    if(!channel?.length){
        throw new ApiError(404, "channel not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "channel found successfully"))
})
    
export {
    registerUser,
    loginUser,
    logoutUser,
    refereshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile
}