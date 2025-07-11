import { Router } from "express";
import { register,login ,uploadProfilePicture, updateUserProfile, getUserAndProfile, updateProfileData, getAllUsersProfiles, downloadProfile, sendConnectionRequest, getMyConnectionsRequests, myConnections, acceptConnectionRequest, getUserProfile} from "../controllers/user.controller.js";
import multer from "multer"; 


const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({storage: storage});



router.route("/register").post(register);
router.route("/login").post(login);
router.route("/update_profile_picture").post(upload.single("profile_picture"),uploadProfilePicture);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_user_profile").post(updateProfileData);
router.route("/get_all_users").get(getAllUsersProfiles);
router.route("/download_resume").get(downloadProfile);
router.route("/send_connection_request").post(sendConnectionRequest);
router.route("/get_connection_requests").get(getMyConnectionsRequests);
router.route("/get_my_connections").get(myConnections); // Assuming this is the same as getMyConnectionsRequests
router.route("/accept_connection_request").post(acceptConnectionRequest);
router.route("/getUserProfile").get(getUserProfile);

export default router;