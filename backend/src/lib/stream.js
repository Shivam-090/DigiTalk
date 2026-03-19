import {StreamChat} from "stream-chat";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const apikey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apikey || !apiSecret){
    console.log("Stream API key and secret are required");
}

const streamClient = StreamChat.getInstance(apikey, apiSecret);

export const upsertStreamUser = async (userData)=>{
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }catch (error){
        console.error("Error in upserting stream user", error);
    }
};

//later
export const generateStreamToken = (userId)=>{
    try{
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    }catch(error){
        console.error("Error in generating stream token", error)
    }
};