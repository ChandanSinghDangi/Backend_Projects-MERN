import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';


const uploadOnCloudinary = async(localFilePath) => {
    try {

        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log('File Upload on Cloudinary was Successfull :: ',response.url); // check the result and see what it gives...

        if(response) {
            fs.unlinkSync(localFilePath);
            return response; // give full response to user for now...
        }

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export { uploadOnCloudinary }
