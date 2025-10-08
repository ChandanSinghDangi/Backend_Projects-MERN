import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';
import { configureCloudinary } from './utils/cloudinary.js';

dotenv.config({
    path: './.env'
})

configureCloudinary();

connectDB()
.then(() => {

    app.on('error', (error) => {
        console.log('Not Connected to express :: Main index.js file :: ',error);
        throw error;
    })

    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running at port :: Main index.js file :: ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log('MONGO_DB CONNECTION FAILED :: Main index.js file :: ',err);
    
})



// const app = express();

// ;( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

//         app.on('error', (error) => {
//             console.log('Not connected to express');
//             throw error;
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`);
            
//         });

//     } catch (error) {
//         console.error('Error :: ', error);
//     }
// })()

