//require(`dotenv`).config({path: './env'})       /* ye bahot hi common hai isliye */
/* ye code jyada consitency banata hai isliye */
//ye file humari database se connectivity wali hai
//------------------------------------------------
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

//ye invoirment variable config hua hai
dotenv.config({
    path: './env'
})

//ye listen ho rha hai  
connectDB()   /* ye db/index.js se aaya hai */
.then(() =>{
    app.on("error", (errrr) =>{     /*  */
        console.log('ERRR', errrr);
    })

    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("mongoDB connection failed !!!", err)
})


//import mongoose from "mongoose";
//import { DB_NAME } from "./constants";




// import express from "express"
// const app = express()
// /* ; iska mtlb cleanning perpose ke liye hai// isme trycatch concept lagta always */
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) /* ye .env file aur constants.js se laya gaya hai---MONGODB_URL */
//         app.on("error", (error) => {     /* this is part of express jo ki ydi koi error aati hai to error dikhayegi */
//             console.log("ERROR : ", error);
//             throw error
//         })
//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("ERROR :", error)
//         throw err
//     }
// })()
