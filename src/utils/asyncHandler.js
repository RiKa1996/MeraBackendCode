/* asyncHandler sirf ek method banayega aur use export kr dega ----- db/index.js me jo export kiya gaya hai same like that */
//hum do tarike use karege DATABASE SE BAAT KRNE KA 1.promiss wala, 2. trycatch wala

//Ye humara promiss wala tarika hai
//----------------------------------------------------------------
const asyncHandler = (requestHandler) => {
    //as a function hum ise accept kre aur as a function hi return bhi kr de hum
    return (req, res, next) => {                //ye wala asyncHandler return humne user.controller.js me bhi kiya hai 
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }



// const asyncHandler = () => {}
// const asyncHandler = (func) => () =>{}
// const asyncHandler = (func) => async () => {}

/* ye humne rapper function banaya jo ki hum har jagah use krne wale hai, ye bahot easy krega */
// Ye humara trycatch wale tarika hai
//----------------------------------------------------------------
// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }