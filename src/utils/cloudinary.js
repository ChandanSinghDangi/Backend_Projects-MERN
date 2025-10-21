import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import { ApiError } from "./ApiError.js";

// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })

export const configureCloudinary = () => {

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary Config :: ', cloudinary.config());

};


const uploadOnCloudinary = async(localFilePath) => {

    try {

        if(!localFilePath) return null;

        console.log('Uploading is happning....');

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log('File Upload on Cloudinary was Successfull :: ',response.url); // check the result and see what it gives...
        console.log('This is a Cloudinary response :: ',response);

        if(response) {
            fs.unlinkSync(localFilePath);
            return response; // give full response to user for now...
        }

    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log('Uploading failed in Cloudinary....', error);
        return null;
    }
}


const deleteCloudinaryFile = async(public_id) => {

    try {
        const result = await cloudinary.api.delete_resources([public_id], {
            resource_type: auto
        });
    
        if( result.deleted[public_id] === 'deleted') {
            return { success: true, message: 'Image deleted successfully from cloudinary'}
        } else if(result.deleted[public_id] === 'not_found') {
            return { success: false, message: 'Image not found on cloudinary'}
        } else {
            return { success: false, message: 'Image could not be deleted'}
        }
    } catch (error) {
        throw new ApiError(500, 'Cloudinary delete failed')
    }
    
}


export { uploadOnCloudinary, deleteCloudinaryFile }
