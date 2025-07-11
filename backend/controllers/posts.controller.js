import User from "../models/user.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";

export const activeCheck= async(req,res)=>{
    return res.status(200).json({
        message: "Server is active and running"
    });
}

export const createPost = async(req,res)=>{
    const {token} = req.body;
    try {
        const user =await User.findOne({token: token});
        if(!user){
            return res.status(401).json({
                message: "User not found"
            });
        }
        const post =new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file != undefined ? req.file.filename : "",
            fileType: req.file != undefined ? req.file.mimetype.split("/")[1] :"",
        })

        await post.save();
        return res.status(201).json({
            message: "Post created successfully",
            post: post
        });
        
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
        
    }
}


export const getAllPosts = async(req,res)=>{
    try {
        const posts = await Post.find().populate("userId", "name username email profilePicture").sort({createdAt: -1});
        if(!posts || posts.length === 0){
            return res.status(404).json({
                message: "No posts found"
            });
        }
        return res.status(200).json({
            message: "Posts fetched successfully",
            posts: posts
        });
        return res.status(200).json({
            message: "Posts fetched successfully",
            posts: posts
        });
        
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
        
    }
}


export const deletePost = async(req,res)=>{
    const {token,post_id} = req.body;
    try {
        const user = await User.findOne({token: token}).select("_id");
        if(!user){
            return res.status(401).json({
                message: "User not found"
            });
        }
       const post = await Post.findOne({_id: post_id});
        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }
        if(post.userId.toString() !== user._id.toString()){
            return res.status(403).json({
                message: "You are not authorized to delete this post"
            });
        }
        await Post.deleteOne({_id: post_id});
        return res.status(200).json({
            message: "Post deleted successfully"
        });
        
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
        
    }
}



export const get_comments_by_post = async(req,res)=>{
    const {post_id}= req.query;
    try {
        const post = await Post.findOne({_id: post_id});
        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comments = await Comment.find({postId:post_id})
        .populate("userId","username name");

        return res.status(200).json({
            message: "Comments fetched successfully",
            comments
        });

        
    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
        
    }
}


export const deleteComment = async(req,res)=>{
    const {token,commentId} = req.body;
    try {
        const user = await User.findOne({token: token}).select("_id");
        if(!user){
            return res.status(401).json({
                message: "User not found"
            });
        }
        const comment = await Comment.findOne({_id: commentId});
        if(!comment){
            return res.status(404).json({
                message: "Comment not found"
            });
        }
        if(comment.userId.toString() !== user._id.toString()){
            return res.status(403).json({
                message: "You are not authorized to delete this comment"
            });
        }
        await Comment.deleteOne({_id: commentId});
        return res.status(200).json({   
            message: "Comment deleted successfully"
        });

        
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
        
    }


}

export const incrementLikes = async(req,res)=>{
    const {post_id}= req.body;
    try {
        const post = await Post.findOne({_id: post_id});
        if(!post){
            return res.status(404).json({
                message: "Post not found"
            });
        }

        post.likes += 1;
        await post.save();
        return res.status(200).json({
            message: "Likes incremented successfully",
            likes: post.likes
        });
        
    } catch (error) {
        console.error("Error incrementing likes:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
        
    }
}