//Multer एक middleware है जो Node.js और Express में file upload करने के लिए इस्तेमाल किया जाता है। यह विशेष रूप से multipart/form-data (जो कि फाइल अपलोड करने के लिए उपयोग किया जाता है) को handle करने के लिए बनाया गया है।
//ye multer ka middleware hai jo ki humne route me inject kr diya hai.
import multer from "multer";

//Hum diskstorage use kr rhe hai
// फाइल को 'uploads' फोल्डर में सेव करने के लिए Multer storage सेटअप
const storage = multer.diskStorage({
    destination: function (req, file, cb) {      /* bich me jo file hai wo hi multer,,,jo file aa hai isliye multer use hota hai. */
        cb(null, "./public/temp"); // फाइल अपलोड होने के बाद 'uploads' फोल्डर में सेव होगी
    },
    filename: function (req, file, cb) {
        //cb(null, file.fieldnamefieldname + '-' + Date.now() + path.extname(file.originalname)); 
        cb(null, file.originalname)  //ye shi nhi original to same name ke kai files ho skti hai.
        // फाइल का यूनिक नाम बनाएगा
    }
});
// Multer middleware सेटअप
export const upload = multer({        //upload ko import karege user.routes.js me humare file handling ke route ko ready krne ke liye
    storage,
    }
);
