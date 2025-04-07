//ye humara 1st routes hai jo ki connect hoga humare user.controller.j me registration se
import { Router } from "express";    //Router express se hai
import { logOutUser, loginUser, registerUser, refreshAccessToken, changeCurrentUserPassword,
    getCurrentUser, updateAccoutDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile,
    getWatchedHistory } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

//jaise hum express me app banate the vaise hi route se Router banayege---app.js me
const router = Router()

//ye route is liye hai ki jo humari avatar aur coverImage ki jo file hai wo submit ki ja sake--kyoki ye text file nhi hoti
//aur ab hum images bhej payege
//======================ye router user register krne waqt avatar and coverimage file ko submit krne wali hai===============
router.route("/register").post(
    upload.fields([                     //ye upload multer.middlewares.js se aaya hai--jo krta hai registerUser routes se phle ek field bana ke jata hai.
        {
            name: "avatar",
            maxCount: 1         //ye kitni file except karega wo hai
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)
//=======================ye router logout karne wala router hai==================================================================
router.route("/login").post(loginUser)            //post method imformation lene ke liye

//Secure Routes
router.route("/logout").post(verifyJWT ,logOutUser) //logOutUser se phle verifyJWT likhne se logout inject ho jata hai aur isliye auth.middleware.js me last me humne next() likha tha
router.route("/refresh-token").post(refreshAccessToken) //yha jwt ki jarurat nhi hai -- yha request user ho ya na ho ko fark nhi padta 
router.route("/change-password").post(verifyJWT, changeCurrentUserPassword)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/account-detail").patch(verifyJWT, updateAccoutDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/Channel-profile").get(verifyJWT, getUserChannelProfile)
router.route("/Watch-history").get(verifyJWT, getWatchedHistory)


export default router    //router ko import hum krege app.js me---export default hota hai to to manchaha naam de skte hai app.js ke imprt userRouter me 