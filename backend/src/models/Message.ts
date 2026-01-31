import mongoose,{mongo, Schema,type Date,type Document} from "mongoose";

export interface IMessage extends Document{
    chat:mongoose.Types.ObjectId;
    sender:mongoose.Types.ObjectId;
    text:string;
    createdAt:Date;
    updatedAt:Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
    chat:{
        type:Schema.Types.ObjectId,
        ref:"Chat",
        required:true
    },
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    text:{
        type:String,
        required:true,
        trim:true
    }
},{timestamps:true})


// Indexes for fast message queries
MessageSchema.index({chat:1, createdAt:1})

export const Message = mongoose.model("Message",MessageSchema);