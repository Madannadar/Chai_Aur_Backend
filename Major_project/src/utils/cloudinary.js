import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs' 


// Configuration
   
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("could not file the path");
            return null
        }
        console.log("hello");
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
        })
        console.log("hello");
        
        // file has been uploaded succesfully
        console.log("file has been uploaded succesfully on cloudinary with the url:",response.url);
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove te locally saved temp file as the upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}