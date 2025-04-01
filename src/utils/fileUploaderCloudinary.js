import { v2 as cloudinary } from "cloudinary";    //v2 as cloudinary
import fs from "fs";        //ye module file system humare node.js ke sath me hi aata hai.




// Configuration hai jo file upload krne ki permission degi
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//cloudinary pe video/file/image/gif ho sabhi ko upload kr skte hai---ek method bana ke
const uploadOnCloudinary = async (localFilePath) => {     //localFilePath parameter jo bhi method ise use krega wo pass krega 
    try {
        if (!localFilePath) return "could not find the path"
        //Upload the file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath,{     /* is pure file ko upload hone me time lagega to await krwa lete hai */
            resource_type:"auto"
        })
        //ydi file successfully upload ho gai hai to aage
        console.log("File is uploaded on cloudinary", response.url)    //ye console krwa ke humne dekha hai ki humara url kya hai

        return response;    /* ye return humne user ko kiya hai jo lena chahe like url and other things */
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}
