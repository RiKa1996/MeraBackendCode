import express from "express";    /* express se useally ek app banti hai */
import cors from "cors";        /* ye help krta ki how to connect backend with frontend */

/* server se user ka jo brawser hai uske ander ki cookie ko access krna and set krna  */
import cookieParser from "cookie-parser";   /* Small pieces of data stored on your browser by websites to remember your preferences, login status, or track your activity. */

//ye humne express ki app bnaye hai
const app = express()

/*1st config this is Cors ---jisko connect kiya hai */
app.use(cors({
    origin: process.env.CORS_ORIGIN,   /* CORS_ORIGIN .env file se aaya hai */
    credentials: true
}))

/*2nd config now hume config krna aur middleware set krna hai with express se  */
app.use(express.json({limit: "16kb"}))

/* 3rd config jo ki URL se aati(ye url ko encoder krta hai) like-- %20, +, - ,  */
app.use(express.urlencoded({extended: true, limit: "16kb"}))

/* 4th config jo ji public folders types hai jo ki koi bhi access kr skta hai. */
app.use(express.static("public"))

/* 5th config jo ki server se user ka jo brawser hai uske ander ki cookie ko access krna and set krn */
app.use(cookieParser())

//=======================yha se router ki kahani start hai========================================================
//YAHA HUM ROUTER KO IMPORT KREGE , YE SIGREEGATION KA PART HAI.
//ROUTES IMPORT
import userRouter from './routes/user.routes.js';    /* jb export default ho rha ho tab hi hum import me manchaha naam se skte hai */

//ROUTES DECLARATION
//Kyoki chihe ab seprate ho gai router ki file humne alag bana di hai-----app.use() krte hi ab hum yhi routes aur router likhege
// router ko lane ke liye middleware likhenge--ye jo niche humne app.use("./users", userRouter) ye middleware hai
app.use("/api/v1/users", userRouter)    //"./users" jaise hi likhege to wo hume le jayega userRouter pe-----ye file ko next likhege user.routes.js me

//http://localhost:8000/api/vl/users/register ----ye hone wala hai jo app.js me middlware likha gaya hai wo fix rahega.

export {app}   /* app jaise hi hum export krte hai to hume index.js me jake (kyoki async function hume promiss bhi return krta hai) */
                /* index.js me ja ke .then aur .catch  */