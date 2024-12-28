import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    // username: String,
    // email: String,
    // isActive: Boolean
    // professnal aproach

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    email: { 
      type: String,
      required: true,
      unique: true,
      lowercase: true 
    },
    password: {
      type: String,
      required: [true, "password is required"],
    }
  }, {timestamps: true}
) // schema is a method that take a object

export const User = mongoose.model("User", userSchema) // model is a method that has 2 para 

