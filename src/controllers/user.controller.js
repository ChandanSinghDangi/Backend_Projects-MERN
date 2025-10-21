import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshToken = async(userId) => {
 // can we send user as argument insted of userId
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
    
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, 'Something went wrong with accessToken or refreshToken')
    }
}


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
    console.log('checking avatar :: ',avatarLocalPath);
    
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


const loginUser = asyncHandler( async(req, res) => {

    const { email, username, password } = req.body;

    console.log('testing for email and password');
    
    if( !(username || email) ) {
        throw new ApiError(400, 'username or email is required')
    }

    console.log('testing for email and password again...');

    if( !password ) {
        throw new ApiError(400, 'password is required')
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if( !user ) {
        throw new ApiError(404, 'email does not exist')
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if( !isPasswordValid ) {
        throw new ApiError(404, 'invalid user credentials');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');


    // this is cookies options:-
    const options = {

        httpOnly: true,
        secure: true
    }
    console.log('testing login again... third time...');
    
    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            'User logged In Successfully'
        )
    )
  
})


const logoutUser = asyncHandler( async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json( new ApiResponse(200, {}, 'User logged Out'))

})


const refreshAccessToken = asyncHandler( async(req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if( !incomingRefreshToken ) {
        throw new ApiError(401, 'unauthorized request')
    }

   try {
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
     const user = await User.findById(decodedToken?._id);
 
     if( !user ) {
        throw new ApiError(401, 'Invalid refresh token')
     }
 
     if( incomingRefreshToken !== user?.refreshToken ) {
        throw new ApiError(401, 'Refresh token is expired or used')
     }
 
     const options = {
        httpOnly: true,
        secure: true
     }
 
     const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
     
     return res
     .status(200)
     .cookie('accessToken', accessToken, options)
     .cookie('refreshToken', newRefreshToken, options)
     .json(
        new ApiResponse(
            200,
             {
                accessToken, 
                refreshToken: newRefreshToken, 
                message: 'Access Token refreshed'
            }
        )
    )
   } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token')
    }

})


const changeCurrentPassword = asyncHandler( async(req, res) => {

    const { oldPassword, newPassword } = req.body;

    if( !oldPassword || !newPassword ) {
        throw new ApiError(401, 'old password or new password is required')
    }

    const user = await User.findById(req.user?._id);

    const old_new_passwordCompareResult = await user.isPasswordCorrect(oldPassword);

    if( !old_new_passwordCompareResult ) {
        throw new ApiError(401, 'old password does not match the currentPassword')
    }

    user.password = newPassword; // here you have set the newPassword. not saved yet!
    await user.save({ validateBeforeSave: false }) // here you save the password

    return res
    .status(200)
    .json(
        new ApiResponse(200, {} ,'password updated successfully')
    )

})


// this is to get the current user and i don't know why we need this yet!
const getCurrentUser = asyncHandler( async(req, res) => {

    return res
    .status(200)
    .json(200, req.user, 'Current user fetched successfully')
    // .json(
    //     new ApiResponse(200, {message: req.user}, 'Current user fetched successfully')
    // )

})


const updateAccountDetails = asyncHandler( async(req, res) => {

    const { fullName, email } = req.body;

    // files should not be updated here. You can but usually in production level it's avoided!

    if( !fullName || !email ) {
        throw new ApiError(400, 'all fields are required')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName, 
                email
            }
        },
        {
            new: true
        }
    ).select('-password'); // why not remove -refreshToken?

    user.save({ validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, 'Account details updated successfully')
    )
})


const updateUserAvatar = asyncHandler( async(req, res) => {

    const avatarLocalPath = req.file?.path;

    if( !avatarLocalPath ) {
        throw new ApiError(400, 'avatar file required')
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath);

    if( !avatar.url ) {
        throw new ApiError(400, 'Error while uploading your avatar')
    }

    // this code below this another way to save the avatar:-
    // const user = await User.findById(req.user?._id);
    // user.avatar = avatar.url;
    // await user.save({ validateBeforeSave: false })

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select('-password')

    // await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, 'avatar updated successfully')
    )
})


const updateUserCoverImage = asyncHandler(async(req, res) => {

    const coverImageLocalPath = req.file?.path; // why write path here?

    if( !coverImageLocalPath ) {
        throw new ApiError(400, 'coverImage is required')
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if( !coverImage.url ) {
        throw new ApiError(501, 'Error while uploading your coverImage')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select('-password')

    // await user.save({ validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, 'cover image updated successfully')
    )

})


export { 

    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}



// *********************************** For User Register **************************************

// get user data from fronted.
// data validation (check if any field is empty or not)
// check if this user already exists or not... by email/username
// convert the password into hash
// check if the avatar is there or not. If there then upload it in cloudinary.
// create user Object - create entry in db
// check for user creation 
// remove password and resresh token field from response
// return response user



// *********************************** For User login ************************************** 

// validation and format check - username/email, password
// check if username/email exists or not in db via User model
// then check password if matches the one in db 
// genarate the access and refresh tokens and store refresh token in db
// send cookies
// then return the response to the user




