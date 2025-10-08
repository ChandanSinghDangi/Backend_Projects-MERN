import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

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

export { uploadOnCloudinary }
