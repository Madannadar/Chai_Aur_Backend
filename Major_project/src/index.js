// require('dotenv').config({path: './env'})

import connectDB from "./database/index.js"
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: './.env' }); // bhai .env likna h hamesa 
// require('dotenv').config({path: './env'})
connectDB()

// first aproach 1
/*
import express from 'express'
const app = express()

( async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error) => {
        console.log('error in express:',error);
        throw error
       })

       app.Listen(process.env.PORT , () => {
        console.log(`App is listening on port ${process.env.PORT}`);
       })
    } catch (error) {
        console.log(error);
        throw error
    }
})() // 

*/