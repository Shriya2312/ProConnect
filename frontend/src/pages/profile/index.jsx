import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import styles from "./style.module.css";
import { BASE_URL, clientServer } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser } from "@/config/redux/action/authAction";
import { useRouter } from "next/router";
import { getAllPosts } from "@/config/redux/action/postAction";

function profilePage() {
  const authState = useSelector((state) => state.auth);
  const { posts } = useSelector((state) => state.posts);
  const router = useRouter();
  const dispatch = useDispatch();

  const [userProfile, setUserProfile] = useState({
    userId: { name: "", username: "", email: "", profilePicture: "" },
    bio: "",
    currentPost: "",
    pastWork: [],
    education: "",
    skills: [],
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [work, setWork] = useState({
    company: "",
    position: "",
    years: "",
  });

  const handleAddWork =(e)=>{
    const {name,value} = e.target;
    setWork({...work,[name]:value});
  }
  

  useEffect(() => {
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    dispatch(getAllPosts());
  }, []);

  useEffect(() => {
    if (authState.user) {
      console.log("authState.user updated:", authState.user);
      setUserProfile({
        ...authState.user,
        userId: {
          name: authState.user.userId?.name || "",
          username: authState.user.userId?.username || "",
          email: authState.user.userId?.email || "",
          profilePicture: authState.user.userId?.profilePicture || "",
        },
        bio: authState.user.bio || "",
        currentPost: authState.user.currentPost || "",
        pastWork: authState.user.pastWork || [],
        education: authState.user.education || "",
        skills: authState.user.skills || [],
      });
      const filtered = posts.filter((post) => {
        return post.userId?.username === authState.user.userId?.username;
      });
      setUserPosts(filtered);
    }
  }, [authState.user, posts]);

  const user = userProfile?.userId;

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    try {
      await clientServer.post("/update_profile_picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    } catch (error) {
      console.error("Error updating profile picture:", error.message);
    }
  };

  const updateProfile = async () => {
    console.log("updateProfile called", userProfile);
    try {
      await clientServer.post("/user_update", {
        token: localStorage.getItem("token"),
        name: userProfile.userId?.name || "",
      });

      const profileData = {
        token: localStorage.getItem("token"),
        bio: userProfile.bio || "",
        currentPost: userProfile.currentPost || "",
        pastWork: userProfile.pastWork || [],
        education: userProfile.education || "",
      };
      console.log("Sending profile data:", profileData);
      const response = await clientServer.post("/update_user_profile", profileData);
      console.log("Response:", response.data);
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    } catch (error) {
      console.error("Error in updateProfile:", error.message);
      if (error.code === "ECONNABORTED") {
        console.error("Request timed out");
      }
    }
  };

  

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile?.userId && (
          <div className={styles.wrapper}>
            <div className={styles.profileCard}>
              <div className={styles.bannerSection}>
                <div className={styles.banner}></div>
                <img
                  src={`${BASE_URL}/${user.profilePicture}` || "/default.jpg"}
                  onError={(e) => (e.target.src = "/default.jpg")}
                  alt="Profile"
                  className={styles.profileImage}
                />
                <label htmlFor="profilePictureUpload" className={styles.editOverlay}>
                  Edit
                </label>
                <input
                  onChange={(e) => {
                    updateProfilePicture(e.target.files[0]);
                  }}
                  type="file"
                  id="profilePictureUpload"
                  className={styles.hiddenInput}
                />
              </div>

              <div className={styles.contentSection}>
                <div className={styles.mainInfo}>
                  <div className={styles.profileDetails}>
                    <input
                      className={styles.nameEdit}
                      type="text"
                      value={userProfile.userId.name}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          userId: { ...userProfile.userId, name: e.target.value },
                        });
                      }}
                    />
                    <p className={styles.username}>@{user?.username}</p>
                    <p className={styles.email}>{user?.email}</p>
                  </div>

                  <div className={styles.section}>
                    <h3>Bio</h3>
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => {
                        console.log("New bio value:", e.target.value);
                        setUserProfile({ ...userProfile, bio: e.target.value });
                      }}
                      rows={Math.max(3, Math.ceil((userProfile.bio?.length || 0) / 80))}
                      style={{
                        width: "100%",
                        outline: "none",
                        border: "none",
                        paddingInline: "10px",
                        paddingBlock: "9px",
                        fontFamily: "poppins",
                        fontSize: "1rem",
                      }}
                    />
                  </div>

                  <div className={styles.section}>
                    <h3>Work History</h3>
                    {userProfile.pastWork.map((work, index) => (
                      <div key={index} className={styles.workHistory}>
                        <p
                          style={{
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.8rem",
                          }}
                        >
                          {work.company} : {work.position}
                        </p>
                        <p>{work.years}</p>
                      </div>
                    ))}
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className={styles.addWorkButton}
                    >
                      Add Work
                    </button>
                  </div>

               <div className={styles.section}>
                    <h3>Current Post</h3>
                    <input
                      type="text"
                      value={userProfile.currentPost || ""}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          currentPost: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        outline: "none",
                        border: "none",
                        paddingInline: "10px",
                        paddingBlock: "9px",
                        fontFamily: "poppins",
                        fontSize: "1rem",
                      }}
                    />
                  </div>
                  <div className={styles.section}>
                    <h3>Skills</h3>
                    {userProfile?.skills?.length > 0 ? (
                      <ul>
                        {userProfile.skills.map((skill, idx) => (
                          <li key={idx}>{skill}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No skills listed.</p>
                    )}
                  </div>
                  
                  <div
                    onClick={() => {
                      updateProfile();
                    }}
                    className={styles.updateProfile}
                  >
                    Update Profile
                  </div>
                </div>

                <div className={styles.recentActivity}>
                  <h3>Recent Activity</h3>
                  {userPosts.map((post) => (
                    <div className={styles.card} key={post._id}>
                      <div className={styles.card_profileContainer}>
                        {post.media !== "" ? (
                          <img src={`${BASE_URL}/${post.media}`} />
                        ) : (
                          <div style={{ width: "3rem", height: "3rem" }}></div>
                        )}
                      </div>
                      <p>{post.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isModalOpen && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal}>
                    <h2>Add Work Experience</h2>
                    <input
                      type="text"
                      placeholder="Company"
                      onChange={handleAddWork}
                      name="company"
                      className={styles.modalInput}
                    />
                    <input
                      type="text"
                      placeholder="Position"
                     onChange={handleAddWork}
                     name="position"
                      className={styles.modalInput}
                    />
                    <input
                      type="text"
                      placeholder="Years (e.g., 2020-2022)"
                    onChange={handleAddWork}
                    name="years"
                      className={styles.modalInput}
                    />
                    <div className={styles.modalButtons}>
                      <button
                        onClick={()=>{
                          setUserProfile({...userProfile,pastWork:[...userProfile.pastWork,work]})
                          setIsModalOpen(false)
                        }}
                        className={styles.modalSaveButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className={styles.modalCancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}

export default profilePage;