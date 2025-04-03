//This is the first model
import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true         /* ye true krne per ye humari database ki searchin me aane lgti hai find karna asan hota hai */
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,      /* avatar me hum cloudinary url use karege----like AWS (Amazon Web Services) */
            required: true    
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    { 
        timestamps: true
    }
)

/* save is part of document middleware--jo ki file save hone se phle ydi password incrypt krna ho to */
userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))  return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})          

//Ydi brcypt password hash krti hai to wo check bhi kr skti hai ---compair method se
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)  /* ye true aur false me answer krta hai */
}

//Access token generate krne ka method likh skte hai kya---so yes we can write
//generateAccessToken and generateRefreshToken dono hi humare json web token hai
//ye humne Access token banaya hai.
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id: this._id,        //ye id humare mongoDB se aayegi
            email: this.email,    //id ke baad ki details email username fullname ye upper jo humne stor kiya hai wo hai
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY      //expiry token object{} me aata hai
        }
    )
}
//ye humne refresh Token banaya haia
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id: this._id,        //ye id humare mongoDB se aayegi
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY      //expiry token object{} me aata hai
        }
    )
}


//ye jo user hai ye humare database se direct contect kr skta hai. kyoki se humare mongoose.model se bana hai isliye
//---humne user.controller.js me import krwaya hai.
export const User = mongoose.model("User", userSchema)   