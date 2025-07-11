import { Router } from "express";
import { activeCheck,  createPost, deleteComment, deletePost, get_comments_by_post, getAllPosts, incrementLikes } from "../controllers/posts.controller.js";
import multer from "multer";
import { commentPost } from "../controllers/user.controller.js";


const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"),createPost);
router.route("/allPosts").get(getAllPosts);
router.route("/deletePost").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/getComments").get(get_comments_by_post);
router.route("/deleteComment").delete(deleteComment);
router.route("/increment_like").post(incrementLikes);

export default router;