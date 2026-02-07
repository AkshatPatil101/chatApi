import mongoose,{mongo, Schema,type Document} from "mongoose"

export interface IChat extends Document{
    participants:mongoose.Types.ObjectId[];
    lastMessage?:mongoose.Types.ObjectId;
    lastMessageAt?:Date;
    createdAt:Date;
    updatedAt:Date;
    readBy:mongoose.Types.ObjectId[];
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
    },
    
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
},{timestamps:true})


const Chat = mongoose.model("Chat",ChatSchema);

export default Chat;