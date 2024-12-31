import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
    username: {
        type: String,
        required: [true,'username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true  // this will imporve the searching part 
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // url of the image from cloudinary 
        required: [true,"avatar is required"],
    },
    coverImage: {
        type: String // same url from cloudinary
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true,"password is required"],
    },
    refreshToken: {
        type: String
    }
},{timestamps: true})

userSchema.pre("save",async function(next){ // this will encrypt the password
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10) // 10 rounds
        next()
    }     
}) // pre hook it will be executed just before saving and many more it is a middleware , here we are using save and not to use arrow function beause it does not have the context of this.

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({ // this is know as payload
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateReferenceToken = function(){
    return jwt.sign({ // this is know as payload
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFERSH_TOKEN_EXPIRY
    }
    )
}

export const User = mongoose.model("User",userSchema)