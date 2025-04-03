import mongoose, {Schema} from "mongoose";

//ye mongooseAggregatePaginate plugging ki tarah use hota 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";  /* this is first step */

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,    //cloudinary url
            required: true
        },
        thumbnail: {
            type: String,    //cloudinary url
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,  //cloudinary url
            required: true
        },
        view: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        videoUploader: {
            type: Schema.Types.ObjectId,
            ref: "User"

        }
    },
    {
        timestamps: true
    }
)

//this is very important ----like mongoose ka pipeline ---plugin hook hai
videoSchema.plugin(mongooseAggregatePaginate)   /* this is second step----ye middleware ke sandarb me hai */
export const Video = mongoose.model("Video", videoSchema)