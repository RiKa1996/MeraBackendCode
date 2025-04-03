//ye auth middleware ye sirf ye verify karega user hai ya nhi --- aur ye help krega hume ydi user hai to use logout krne me
//ye humara phla middleware hai
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) =>{  //res humara yaha khali hai to res ki jagah hai underscore bhi likh skte hai like _
    try {
        //ye accessToken hume liya hai jo humne return kiya hai return res.status(200).cookie se
        //ye humne cookies ya fer "Authorization" se token generate kiya hai
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")    //replace is javascript part
    
        console.log(token)
        //agar aapke pass token hi nhi hai----cookies ya "Authorization" me se
        if (!token){
            throw new ApiError(401, "Unauthorized requestt")
        }
    
        //ydi token mil gai hai to--- jo _id humne user.model.js me userSchema.methods.generateAccessToken = function () me liya use lena hoga na
        const decodedTokenInformation = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        //ek database request karege findById se
        //ye _id humari userSchema.methods.generateAccessToken = function (){ -------user.model.js se aai hai.
        const user = await User.findById(decodedTokenInformation._id).select("-password -refreshToken")
    
        //is point pe user nhi hai to ---ek error throw kr skte hai
        if (!user) {
            //TODO: DISCUSSION ABOUT FRONTEND---JB SIR NEXT VIDEO ME BATANE WALE HAI.
            throw new ApiError(401, "Invalid Access Token")
        }
    
        //YDI USER HAI  TO AAGE HUM 
        req.user = user; //humpe access hai req ka to hum is req ke ander naya object kr denge aur user ka access de denge
        next()      //jb finally kam ho jaye to next() kr denge
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")  //after that hum ek route banaye jo ki login route hoga
    }
})
