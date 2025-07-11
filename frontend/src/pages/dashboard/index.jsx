import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import {
  createPost,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementLike,
  postComment,
} from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import { BASE_URL } from "@/config";
import { toast } from "react-toastify";
import { resetPostId } from "@/config/redux/reducer/postReducer";

const Dashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();
  const [commentText, setCommentText] = useState("");
  const postState = useSelector((state) => state.posts);

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  }, [authState.isTokenThere]);

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, []);

 
  const handleUpload = async () => {
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
  };

  const handleShare = () => {
    toast.info("Sharing feature coming soon!");
  };
  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.scrollComponent}>
            <div className={styles.createPostContainer}>
              <img
                className={styles.userProfile}
                src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
              />
              <textarea
                onChange={(e) => {
                  setPostContent(e.target.value);
                }}
                placeholder={`what's in your mind ${authState.user.userId.username}?`}
                name=""
                id=""
                value={postContent}
              ></textarea>

              <label htmlFor="fileUpload">
                <div className={styles.Fab}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
              </label>
              <input
                onChange={(e) => {
                  setFileContent(e.target.files[0]);
                }}
                type="file"
                hidden
                id="fileUpload"
              />
              {postContent.length > 0 && (
                <div onClick={handleUpload} className={styles.uploadBtn}>
                  Post
                </div>
              )}
            </div>
            <div className={styles.postContainer}>
              {[...postState.posts]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((post) => (
                  <div key={post._id} className={styles.singlePost}>
                    {post.userId._id === authState.user.userId._id && (
                      <div
                        onClick={async () => {
                          await dispatch(deletePost({ post_id: post._id }));
                          await dispatch(getAllPosts());
                        }}
                        className={styles.deleteIcon}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          width="20"
                          height="20"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </div>
                    )}
                    <div className={styles.postHeader}>
                      <img
                        className={styles.postUserImg}
                        src={`${BASE_URL}/${post.userId.profilePicture}`}
                        alt="user"
                      />
                      <div>
                        <h4 className={styles.username}>
                          {post.userId.username}
                        </h4>
                        <p className={styles.postDate}>
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className={styles.postText}>{post.body}</p>
                    {post.media && (
                      <img
                        src={`${BASE_URL}/${post.media}`}
                        alt="post-media"
                        className={styles.postImage}
                      />
                    )}
                    <div className={styles.iconRow}>
                      {/* Share Icon + Likes */}
                      <div
                        onClick={async () => {
                          await dispatch(incrementLike({ post_id: post._id }));
                          dispatch(getAllPosts());
                        }}
                        className={styles.iconWithLabel}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={styles.icon}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                          />
                        </svg>
                        <span className={styles.iconLabel}>{post.likes}</span>
                      </div>

                      {/* Comment Icon */}
                      <div
                        onClick={() => {
                          dispatch(getAllComments({ post_id: post._id }));
                        }}
                        className={styles.iconWithLabel}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={styles.icon}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                          />
                        </svg>
                      </div>
                      {/* Share Icon */}
                      <div
                        className={styles.iconWithLabel}
                        onClick={() => handleShare()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className={styles.icon}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {postState.postId !== "" && (
            <div
              onClick={() => {
                dispatch(resetPostId());
              }}
              className={styles.commentsContainer}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={styles.allCommentsContainer}
              >
                {postState.comments.comments.length === 0 && (
                  <h2>No Comments</h2>
                )}
                {postState.comments.comments.length !== 0 && (
                  <div>
                    {postState.comments.comments.map((postComment) => (
                      <div key={postComment._id} className={styles.commentItem}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentName}>
                            {postComment.userId
                              ? postComment.userId.name
                              : "Unknown User"}
                          </span>
                          <span className={styles.commentUsername}>
                            @
                            {postComment.userId
                              ? postComment.userId.username
                              : "unknown"}
                          </span>
                          <span className={styles.commentTime}>
                            {new Date(postComment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.commentBody}>
                          {postComment.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}{" "}
                <div className={styles.postCommentContainer}>
                  <input
                    type=""
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="comment"
                  />
                  <div
                    onClick={async () => {
                      await dispatch(
                        postComment({
                          post_id: postState.postId,
                          body: commentText,
                        })
                      );
                      await dispatch(
                        getAllComments({ post_id: postState.postId })
                      );
                    }}
                    className={styles.postCommentContainer_cmtBtn}
                  >
                    <p>Comment</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading...</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }
};

export default Dashboard;
