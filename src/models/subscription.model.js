//isme humare 2 user hone wale hai 1. subscriber 2. channel
import mongoose, {model, Schema} from "mongoose";
const subscriptionSchema = new mongoose.Schema(
    {
        //One who is subscribing
        subscriber: {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        //One to whom 'subscriber' is subcribing
        channel : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },{timestamps: true})

const Subscription = mongoose.model("Subscription", subscriptionSchema)