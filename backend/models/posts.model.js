import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    body:{
    type: String,
    required: true,
    },
    likes:{
        type: Number,
        default: 0,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
        default: Date.now,
    },
    media:{
        type: String,
        default: "",
    },
    active:{    
        type: Boolean,
        default: true,
    },
    fileType:{
        type: String,
        default: null,
    }
});

const Post = mongoose.model("Post", PostSchema);
export default Post;