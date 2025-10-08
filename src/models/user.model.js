import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const userSchema = new Schema(

    {
        username: { type: String, required: true, lowercase: true, unique: true, trim: true, index: true  }, // index is to make searching more optmized...
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        fullName: { type: String, required: true, trim: true,index: true },
        avatar: { type: String, required: true }, // using cloudinary url for avatar
        coverImage: { type: String }, // what is cover image for?
        watchHistory: [
            { 
                type: Schema.Types.ObjectId, 
                ref: 'Video',
                required: true, 
            }
        ],
        password: { type: String, required: [true, 'Password is Required'] },
        refreshToken: { type: String } // why required: true was not needed in refreshToken?
    }, 
    { 
        timestamps: true
    }
)

userSchema.pre('save', async function(next) {
    
    if(!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();   
})

userSchema.methods.isPasswordCorrect = async function(password) { // this password here is what user enters for login in. 
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// another way to export User model.
// export { User }
export const User = mongoose.model("User", userSchema);