import mongoose,{mongo, Schema,type Document} from "mongoose"

export interface IChat extends Document{
    participants:mongoose.Types.ObjectId[];
    lastMessage?:mongoose.Types.ObjectId;
    lastMessageAt?:mongoose.Types.ObjectId;
    createdAt:Date;
    updatedAt:Date;
}


const ChatSchema = new mongoose.Schema<IChat>({
    participants:[
        {
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
    ],
    lastMessage:{
        type:Schema.Types.ObjectId,
        ref:"Message",
        default:null
    },
    lastMessageAt:{
        type:Date,
        default:Date.now()
    }
},{timestamps:true})


const Chat = mongoose.model("Chat",ChatSchema);

export default Chat;