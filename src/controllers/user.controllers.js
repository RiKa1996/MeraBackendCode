//ye humara phle controller hai---asyncHandler.js(helper file ) jo ki database ko connect krti hai. wo bhi lagega
//import { response } from "express"
import { asyncHandler } from "../utils/asyncHandler.js"   //database connectivity banane ke liye
import { ApiError } from "../utils/apiError.js"            //2.validation me yhi koi error hai to use error ka code denge 
import { User } from "../models/user.model.js"      //3.check if user already exists: username/email---isliye import kiya hai
import { uploadOnCloudinary } from "../utils/fileUploaderCloudinary.js"  ////5.agar files available ho gai hai to: upload them to cloudinary, avatar ko bhi check kr lenge
import { ApiResponse } from "../utils/apiResponse.js"  //9.return response
import jwt from "jsonwebtoken"


//import router from "../routes/user.routes.js"
//====//5.YE ACCESS TOKEN AUR REFRESH TOKEN KA ALAG SE SE METHOD HAI---//5.access and refresh token====================================================

const generateAccessAndRefreshToken = async (userId) => {
     try {
          const user = await User.findById(userId)  //ye user ko find kar lega userId ke bases pe
          //access token aur refresh token generate kr lega - user ko find krne ke baad
          const accessToken = user.generateAccessToken()   //access token to hum user ko de deta hai but
          const refreshToken = user.generateRefreshToken()   //refresh token hum database me save kr ke rakhte hai taki user se bar-bar password na puchn pade
          //so refresh token ko database me kaise dale?---
          //ye jo token hai encoded wala---jo humne user me dal diya hai
          user.refreshToken = refreshToken
          //user ke ander add ho gaya but user ko save bhi krwan padta hai--refresh token ko database me save krwaya hai humne
          await user.save({ validateBeforSave: false })  //yha tak humpe accessToken aur refreshToken dono token humare pass hai refresh token data base me save kr chuke hai aur is refresh  bhi hai humare pass
          //ab iske baad access token aur refresh token return karege
          return {accessToken, refreshToken}
     } catch (error) {
          throw new ApiError(500, "Something went wrong while generating refresh and access token")
     }
}

//==================THIS IS REGISTER USER=========================================================================================
//hum ek method banayege, jiska kaam hai sirf user ko register krna
const registerUser = asyncHandler (async (req, res) => {      //asyncHandler ye asyncHandler.js se aaya jo ki registerUser method bana hai
    /* res.status(200).json({
        message: "debatewithrishav"
    }) */

    //Yha se ab hum user ko register karege
    //1.get user details from frontend
    //2.validation-not empty--ya koi aise hi koi dusra chij
    //3.check if user already exists: username/email
    //4.files:check for images, check for avatar
    //5.agar files available ho gai hai to: upload them to cloudinary, avatar ko bhi check kr lenge
    //6.create user object- kyoki mongoDB me hum jab data send karege-noSQL data bases hai-----
    //kyoki isme object hi banaye jate hai aur upload kiye jate hai- object banane ke baad----create entry in DB (.create se)
    //7.remove password and refresh token field from response
    //8.check for user creation
    //9.return response

    //1. get user details from frontend---user se details lena---user ki details ---form aur json aur url se bhi aata hai hum yha body se lenge
    const {fullname, username, email, password} = req.body
    //console.log("email", email)

    //2.validation-not empty--ya koi aise hi koi dusra chij----isse phle humne image upload kiya hai by using user.routes.js and multer.middlewares.js se
    //ek-ek fields ko check krna hai ki wo empty to nhi hai
    /* if (fullname === ""){     //ydi fullname empty hai to 
        throw new ApiError(400, "full name is required")
    } */
   //ek aur interesting method hai --- ye upper wala if wala bhi hai.
   if (
        [fullname, username, email, password].some( (field) => {
            field?.trim() === ""
        })           //some method hume true and false return krta hai
   ) {
        throw new ApiError(400, "All fields are required")
   }
   //3.check if user already exists: username/email----------------------------------------------------------------
   const existedUser = await User.findOne({           //findOne method --jo phla user hoga use return kr dega
        $or: [{ username },{ email }]                           //This is oprators ----IMPORTANT 
   })  
   if (existedUser) {
          throw new ApiError(409, "User with email or username is already exists")
   }


   console.log(req.files);
   //4.files:check for images, check for avatar--------------------------------------------------------------------
   //kyoki humne user.routes.js ke ander middleware add kiya hai isliye ye middleware bhi hume axis deta hai
   const avatarLocalPath = req.files?.avatar[0]?.path;      //multer hume req.files ka access de deta hai---multer.middlware---? means optionally
   const coverImageLocalPath = req.files?.coverImage[0]?.path; //0 lagane ki wajah se error aa rha tha--TypeError: Cannot read properties of undefined (reading '0') ise classic if elas ke tarike se dusra code likh skte hai
   //ye dusra code hai POSTMAN ME UNCHECKED KRNE PER coverImageLocalPath ke liye kyoki 0 lagane aur question mark ki wajah se error aa rha tha
   /* let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.length > 0) {
          coverImageLocalPath = req.files.coverImage[0].path
   } */


   //check for avatar
   if (!avatarLocalPath){
        throw new ApiError(400, "avtar file is required")
   }
   //5.agar files available ho gai hai to: upload them to cloudinary, avatar ko bhi check kr lenge
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
        throw new ApiError(400, "avatar file is required")
   }
   //6.create user object- kyoki mongoDB me hum jab data send karege-noSQL data bases hai-----
   //kyoki isme object hi banaye jate hai aur upload kiye jate hai- object banane ke baad----create entry in DB (.create se)
   const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
   })
   //7.remove password and refresh token field from response
   //phle hum findById method se find karege fer us User ko select method se karege jise hume remove karna hai.
   const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"           //aise aage minus laga ke us field ko select kr skte hai jise hume remove krna hai
   )
   //8.check for user creation
   if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
   }
   //9.return response
   return res.status(201).json(
     new ApiResponse(200, createdUser, "User registered successfully")
   )
})                  
//==================THIS IS LOGIN USER============================================================================================
const loginUser = asyncHandler (async (req,res) => {
     //1.Req body- data
     //2.username or email ke behafe pe login karege 
     //3.find the user
     //4.password check
     //5.access and refresh token
     //6.send cookie ---secure cookie

//1.Req body- data----//2.username or email ke behafe pe login karege
     const {email, username, password } = req.body          //ye humne data le liya jiske behalf pe login krna hai
     console.log(email);
     //&& ka malb hai username aur email dono hi hona chaiye aur || ka mtlb hai koi ek 
     if (!username && !email) {                        //ydi dono me se koi ek humpe hona chaiye taki login kr ske
          throw new ApiError(400, "username or password is required")
     }
     /* if (!username || !email) {                        //ydi dono me se koi ek humpe hona chaiye taki login kr ske
          throw new ApiError(400, "username and password are required")
     } */
     //ydi email and username dono humare pass me hai to ek user find krna padega kyoki dono me ya to email hoga ya username
//3.find the user
     const user = await User.findOne({                //findOne method find krega user ya to username ke base pe mil jaye ya fer email ke base pe
          $or: [{username}, {email}]
     })
     //ydi $or laga ke username ya email mila hi nhi to iska mtlb user kabhi register hua hi nhi hoga.
     if (!user) {
          throw new ApiError(404, "User dos't exist")
     }
     //ydi user ka username ya email mil gaya to ab uska password check krna padega----yaha pe User capital User mongoDB ka mongoose ka ek Object hai.
//4.password check
     const isPasswordValid = await user.isPasswordCorrect(password)   //ye password humne user.model se set kiya --ydi password shi hua to tik hai nhi to if else laga dege aur error de denge
     //console.log(isPasswordValid)
     //ydi password shi nhi hua to
     if (!isPasswordValid) {
          throw new ApiError(401, "Invalid user credentials")
     }
//5.access and refresh token
     //iska hum ek alag se method banaya hai.---upper banaya hai.--generateAccessAndRefreshToken naam se
     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

     //this is optional step jo ki ydi hume jo chij hume user ko nhi deni hai 
     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//6.send cookie ---secure cookie
     //cookie jb hum bhejte hai to hume option design krna padta hai jo ki object hi hota hai 
     const options = {
          httpOnly: true,  //httpOnly aur secrue krne se ye sirf server se modify hogi na ki frontend --ye server se modifable hai
          secure: true
     }
     //is method se hume return krna hai return response
     return res.status(200)
     .cookie("accessToken", accessToken, options)          //humpe cookie-parser hai to cookie ka access hoga hi
     .cookie("refreshToken", refreshToken, options)
     .json(
          new ApiResponse(200, 
               {
          //basically ye data hai jo ki hum apiResponse.js me (this.data = data) hai
               user: loggedInUser, accessToken, refreshToken   //ye bhejna ek acchi practice hai , we don't know user kha save krna chahta hai
               },
               "User logged in successfully"
     ))
     
})   
//=================THIS IS LOG-OUT USER===========================================================================================
//shi maine me logout krne ke liye hume phle cookie aur refreshToken ko hatna padega
const logOutUser = asyncHandler (async (req, res) => {
     //kyoki hume pata nhi hai ki kiske behalf pe hume logout krna hai to hum apna ek alag se middleware banayege jo ki help krega logout krne me auth.middleware.js me
     //ab hume pata chal gaya aur auth.middleware.js aur user.routes.js se --- to aage 
     await User.findByIdAndUpdate(
          req.user._id,   //isse user ko find kr lenge kis user ko logout krna hai
          {
               //update krne waqt mongoDB ka ka ek $set operator use krna padta hai--jo batata hai kya-kya update krna hai
               $unset: {
                    refreshToken: 1   //isse jo hamara refreshToken database se gayab ho gya ya fer kah skte hai saaf ho jayega
               },                  
          },
          {
               new: true   //isse hum aur bhi operator likh skte hai
          }
     )
     const options = {      //ye cookies jo hume login ke time li hai use bhi hatana padega
          httpOnly: true,
          secure: true
     }
     //ab ise return karege
     return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, {}, "User logged Out"))
})
//=================THIS IS ACCESSREFRESH-TOKEN============================================================================================
//accessToken humara user ke pass hi rhta hia--basically ye end-point hai jo ki access token ke liye hai
const refreshAccessToken = asyncHandler(async (req, res) => {
     //phle refresh token bhejna hi padega jo ki user hume bhej rha hai -
     //refresh token kaha se aayega--- ye hum cookies se le hit kr skte hai ya body se
     const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken  //ye humare pass user se refresh token aa gaya hai
     //agar ye refresh token aaya hi nhi to error denge
     if (!incomingRefreshToken) {
          throw new ApiError(401, "Unauthorized request")
     }
     try {
          //next step hoga jo incomingRefreshToken aa rha hai use hume varify bhi krwana padega jwt=jsonwebtoken se
          const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET) //verify hone ke bad hume decoded token mil jata hai
          //kyoki ab refresh token decode ho gaya hai to jo refreshToken humne user.model.js me banaya tha uski sari information aa gai hai 
          //uski information ke access  se mongoDB ki query mar ke user ki information le skte hai
          const user = await User.findById(decodeToken?._id)
          //ydi user nhi hai to
          if (!user) {
               throw new ApiError(401, "Invalid refresh token")
          }
          //kyoki token humare pass 2 tarike se aaya hai 1.phla:incomingRefreshToken ya fer decodeToken jo ki user hume bhej rha  aur 
          // dusra: jo user.model.js me ban gaya tha use humne save krwaya generateAccessAndRefreshToken me jo ki isi file me upper bana hai.
          //in dono incomigRefreshToken aur user ko compair krege aur dono match nhi krte hai to error throw kr denge
          if (incomingRefreshToken !== user?.refreshToken){
               throw new ApiError(401, "Refresh Token is Expired or Used")
          }
          //in dono incomigRefreshToken aur user ko compair krege aur dono matchkrte hai to to new token generate kr ke de denge
          //generateAccessAndRefreshToken ye jab bhi use karege to new token generate ho jayege
          const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
          const options = {
               httpOnly: true,
               secure: true
          }
     
          return res
          .status(200)
          .cookie("accessToken", accessToken, options )
          .cookie("refreshToken", newRefreshToken, options)
          .json(
               new ApiResponse(
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed or successfully"
               )
          )
     } catch (error) {
          throw new ApiError(401, error?.message || "Invalid refresh token")
     }
})
//=================SUBSCRIPTION KE LIYE SUBSCRIBER AND CHANNEL ME HONE WALI KUCH ACTIVITY==============================================
//---------1.CHANGECURRENT PASSWORD-----------------------------
const changeCurrentUserPassword = asyncHandler(async (req, res) => {
     //isme hume user se current password change karwana hai-- aur user se hume kitne fields lene hai wo apne upper hai
     const { odlPassword, newPassword, confirmPassword} = req.body
     if (!(newPassword === confirmPassword)) {
          throw new ApiError (403, "Your New password and Confirm Password are not matched!")
     }

     //ab hume sbse phle ek user chaiye- aur ydi hum pasword change karwa pa rhe hai to -- zahir si baat hai user logged in hoga
     //auth.middleware.js chala hai to confirm hai ki req.user me user hai --- to hum wha se le skte hai
     const user = await User.findById(req.user?._id)
     //kyoki humne koi select nhi lagaya hai to user ka humpe sb kuch aa gaya password bhi ---- to hum user.model me se isPasswordCorrect se check kr skte hai
     const isPasswordCorrect = await user.isPasswordCorrect(odlPassword)   //isko hum old password denge ---ye password hume true ya false return karega
     //ydi false return karega to ek error laga denge
     if (!isPasswordCorrect) {
          throw new ApiError(400, "Invalid old password")
     }
     //ydi old password shi hai to -- iska mtlb humara password thik tha to aage--change kr skte hai
     user.password = newPassword  //ye jaise hi triger hoga to hum jayege user.model.js me userSchema.pre("save", async function (next) { pe
     await user.save({validateBeforSave: false})  //yha sirf hum password hi save krna chahte hai isliye validateBeforeSave layaga hai
     
     //save aur password change hone ke baad user ko hume ek message bhejna hai
     return res
     .status(200)
     .json(new ApiResponse(200, {}, "Password changed successfully"))
})
//---------2.This is end-point jo ki current user ke lene ke liye hai--------
//agar user logged in hai to hum user de skte hai -------------like hitesh sir -- 2 minuts

const getCurrentUser = asyncHandler(async (req, res) => {
     return res    //kyoki humari request pe middleware run ho chuka hai ab uspe user inject ho chuka hai is liye direct res return kr skte hai
     .status(200)
     .json(new ApiResponse (200, req.user, "Current user fetched succcessfully"))
})
//-------yha developer decide karege ki user kya-kya change kr skte hai--------------------------
const updateAccoutDetails = asyncHandler(async(req, res) => {
     const {fullname, email} = req.body
     if (!fullname || !email) {
          throw new ApiError(400, "All fields are required")
     }
     //fullname aur email dono ko update krne ka information bhejte hai to
     const user = await User.findByIdAndUpdate(
          req.user?._id,
          //isme kaam aata hai hai mongoDB ke operator
          {
               $set:{
                    fullname,  //ise hum direct bhi likh skte hai fullname 
                    email: email  //aur aise bhi likh skte hai
               }
          },
          {new:true}  //ye update hone ke baad jo information hai wo hume return hoti hai
     ).select("-password")

     return res.status(200)
     .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//----------ab file ko upload karege ---file upload me 2 middleware ka use karna padega 1.multer and 2. whi log update kr payege jo logged in ho
const updateUserAvatar = asyncHandler(async (req, res) => {
     //ye path humne jaise upper registration ke time liya tha vaise hi file ka path humne liye hai wha pe files liya tha yha file only
     const avatarLocalPath = req.file?.path  //ab file aa gai hai aur local pe multer ne upload kr di hogi
     //Note: agar hume isi situation me database me save krna hai aur cloudinary use nhi karna hai to file avatarLocalPath ko save krwa skte hai
     
     //ydi avatar ka local path nhi hai to error throw kr skte hai
     if (!avatarLocalPath) {
          throw new ApiError(400, "Avatar file is missing")
     }
     //is avatar ko upload kr denge cloudinary pe
     const avatar = await uploadOnCloudinary(avatarLocalPath)

     //agar upload ho gaya hai aur url nhi mila hai to
     if (!avatar.url) {
          throw new ApiError(400, "Error while uploading on avatar")
     }
     //ab karege update jaise humne updateAccountDetails  me kiya tha
     const user = User.findByIdAndUpdate(
          req.user?._id,
          {
               $set :{
                    avatar: avatar.url
               }
          },
          {new: true}
     ).select("-password")
     //response bhej denge aage
     return res.status(200)
     .json(new ApiResponse(200, user, "Avatar updated successfully"))
})
//--------ye updateUserCoverImage hai-----------------------------------
const updateUserCoverImage = asyncHandler(async(req, res) => {
     const coverImageLocalPath = req.file?.path
     if (!coverImageLocalPath) {
          throw new ApiError(400, "Cover-Image file is missing")
     }
     const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     if(!coverImage.url){
          throw new ApiError(400, "Error while uploading on cover-image")
     }
     const user = User.findByIdAndUpdate(
          req.user?._id,
          {
               $set: {
                    coverImage: coverImage.url
               }
          },
          {new: true} 
     ).select("-password")
     return res.status(200)
     .json(new ApiResponse(200, user, "Cover-Image updated successfully"))
})

export { 
     registerUser,
     loginUser,
     logOutUser, 
     refreshAccessToken, 
     changeCurrentUserPassword, 
     getCurrentUser,
     updateAccoutDetails,
     updateUserAvatar,
     updateUserCoverImage

}     //ye registerUser ko post kiya gaya hai user.routes.js me --- with the help of app.js