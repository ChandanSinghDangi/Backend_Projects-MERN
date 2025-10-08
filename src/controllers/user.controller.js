import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async(req, res) => {

    const { fullName, email, username, password } = req.body;
    console.log('this is req.body :: ', req.body);
    console.log('this is req.files :: ', req.files);

    if(
        [ fullName, email, username, password ].some((field) =>
        field?.trim() === '')
    ) {
        throw new ApiError(400, 'All fields are required')
    }

    const existedUser = await User.findOne({
        // this is a operator
        $or: [{username}, {email}]
    })

    console.log('existedUser in user.controller.js :: ',existedUser);
    
    if( existedUser ) {
        throw new ApiError(409, 'username or email already exists'); // why write new here??
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    

    // let coverImageLocalPath;
    // if( req.files && req.files.coverImage && req.files.coverImage.length > 0 ) {
    //     coverImageLocalPath = req.files.coverImage[0].path; // this is where the error pops up, if coverImage is not passed...
    // }

    if(!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // let coverImage;
    // if(coverImageLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverImageLocalPath); // 
    // }

    if( !avatar ) {
        throw new ApiError(500, 'Avatar file is required')
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })

    //select() is used here to remove password and refreshToken. It has wierd syntax though...
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    if( !createdUser ) {
        throw new ApiError(500, 'Something went wrong while registering the user')
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, 'User registered Successfully')
    )

})


export { registerUser }
 

// get user data from fronted.
// data validation (check if any field is empty or not)
// check if this user already exists or not... by email/username
// convert the password into hash
// check if the avatar is there or not. If there then upload it in cloudinary.
// create user Object - create entry in db
// check for user creation 
// remove password and resresh token field from response
// return response user

 