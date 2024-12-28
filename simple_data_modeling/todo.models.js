import mongoose from "mongoose"

const todoSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,// this is a special type like string int this tells mongoos that i will a reference
    ref:"User"   
  },
  subTodos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subTodo"
    }
  ] // array of sub-todos
},{timestamps: true})

export const todo = mongoose.model("todo", todoSchema)