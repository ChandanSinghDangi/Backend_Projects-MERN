import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// why are we not useng models method()?


const videoSchema = new Schema(

    {
        videoFile: { type: String, required: true }, // cloudinary url
        thumbnail: { type: String, required: true }, // cloudinary url
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        duration: { type: Number, required: true }, // cloudinary will send video duration from video info.
        views: { type: Number, default:0 }, // why not required: true in views
        isPublished: { type: Boolean, default: true }, // why not required: true in views
        owner: { 
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

const Video = mongoose.model('Video', videoSchema);
export { Video }
