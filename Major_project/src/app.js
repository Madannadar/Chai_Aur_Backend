import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// app.use(cors()) normal method but below method 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))
app.use(express.json({limit: "16kb"})) // making limit on json request
app.use(express.urlencoded({extended: true, limit: "16kb"})) // this means if i search hitesh bhai but url will use %20 for blank space so for express to understand it 
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRouter from './routes/user.routes.js'


// routes declaration
app.use("/api/v1/users",userRouter)
// http://localhost:8000/api/v1/users/register 

export { app }