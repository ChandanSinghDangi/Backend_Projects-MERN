// require('dotenv').config({path: './env'});
import dotenv from 'dotenv';
import connectDB from "./db/index.js";


dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {

    app.on('error', (error) => {
        console.log('Not Connected to express :: ',error);
        throw error;
    })

    app.listen(process.env.PORT || 8000,() => {
        console.log(`Server is running at port :: ${process.env.PORT}`);
        
    })
})
.catch((err) => {
    console.log('MONGO_DB CONNECTION FAILED :: ',err);
    
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

