import mongoose from "mongoose"

const subTodoSchema = new mongoose.schema({
  content: {
    type: String,
    required: true,
  },
  complete:{
    type: Boolean,
    default: false
  },
  createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
},{Timestamp: true});

export const subTodo = mongoose.model("subTodo", subTodoSchema)