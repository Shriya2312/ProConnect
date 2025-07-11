import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/userLayout';
import React, { useEffect, useState } from 'react';
import styles from './style.module.css';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {getConnectionRequest,getMyConnectionRequests,sendConnectionRequest} from '@/config/redux/action/authAction';
import { getAllPosts } from '@/config/redux/action/postAction';

function ViewProfilePage({ userProfile }) {
const router = useRouter();
const dispatch = useDispatch();
const authState = useSelector((state)=>state.auth);
const { posts } = useSelector((state) => state.posts)
const [userPosts,setUserPosts] = useState([]);
const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
const [isConnectionNull,setIsConnectionNull] = useState(true);

const getUserPost = async()=>{
  await dispatch(getAllPosts());
  await dispatch(getConnectionRequest({token:localStorage.getItem('token')}))
  await dispatch(getMyConnectionRequests({token:localStorage.getItem('token')}))
}

useEffect(() => {
  const filtered = posts.filter((post) => {
    return post.userId?.username === router.query.username;
  });
  setUserPosts(filtered);
}, [posts, router.query.username]);

useEffect(() => {
  const matchedConnection = authState.connections?.find(
    (conn) => conn.connectionId?._id === userProfile.userId._id
  );

  if (matchedConnection) {
    setIsCurrentUserInConnection(true);
    setIsConnectionNull(!matchedConnection.status_accepted); // true = pending
  } else {
    setIsCurrentUserInConnection(false);
    setIsConnectionNull(true);
  }

  if(authState.connectionRequest?.some(
    (conn) => conn.userId?._id === userProfile.userId._id
  )){
     setIsCurrentUserInConnection(true);
     if((authState.connectionRequest?.find(
    (conn) => conn.userId?._id === userProfile.userId._id
  ).status_accepted)){
     setIsConnectionNull(false);
  }
  }


}, [authState.connections, userProfile.userId._id,authState.connectionRequest]);

useEffect(()=>{
  getUserPost();
},[])

  const user = userProfile?.userId;

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.wrapper}>
          <div className={styles.profileCard}>
            {/* Banner + Profile Photo */}
            <div className={styles.bannerSection}>
              <div className={styles.banner}></div>
              <img
                src={`${BASE_URL}/${user.profilePicture}` || '/default.jpg'}
                onError={(e) => (e.target.src = '/default.jpg')}
                alt="Profile"
                className={styles.profileImage}
              />
            </div>

          {/* BELOW BannerSection */}
<div className={styles.contentSection}>
  {/* Left: Main Content */}
  <div className={styles.mainInfo}>
    <div className={styles.profileDetails}>
      <h2>{user?.name}</h2>
      <p className={styles.username}>@{user?.username}</p>
      <p className={styles.email}>{user?.email}</p>

     <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
  {isCurrentUserInConnection ? (
    <button className={styles.connectionButton}>
      {isConnectionNull ? "Pending" : "Connected"}
    </button>
  ) : (
    <button
      onClick={async () => {
        const result = await dispatch(
          sendConnectionRequest({
             token: localStorage.getItem("token"),
    connectionId: userProfile.userId._id,
    user_id: userProfile.userId
          })
        );

        if (sendConnectionRequest.fulfilled.match(result)) {
          setIsCurrentUserInConnection(true);
          setIsConnectionNull(true);
        } else if (
          result.payload?.message === "Connection request already sent"
        ) {
          setIsCurrentUserInConnection(true);
          setIsConnectionNull(true); // Show "Pending"
        }
      }}
      className={styles.connectBtn}
    >
      Connect
    </button>
  )}

  {/* Icon beside the button */}
  <div onClick={async()=>{
      const response = await clientServer.get(`/download_resume?id=${userProfile.userId._id}`)
      console.log("Downloading for:", userProfile._id);
      window.open(`${BASE_URL}/${response.data.message}`,"_blank")
  }} style={{ width: "1.5em", height: "1.5em",cursor:"pointer" }}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={{ width: "100%", height: "100%" }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  </div>
</div>

    </div>

    <div className={styles.section}>
      <h3>Bio</h3>
      <p>{userProfile?.bio || 'No bio available.'}</p>
    </div>

    <div className={styles.section}>

      <h3>Work History</h3>
      {userProfile.pastWork.map((work,index)=>{
        return(
          <div key={index} className={styles.workHistory}>
            
            <p style={{fontWeight:"bold",display:"flex",alignItems:"center",gap:"0.8rem"}}>{work.company} : {work.position}</p>
            <p>{work.years}</p>
            
          </div>
        )
      })}
    </div>

    <div className={styles.section}>
      <h3>Current Post</h3>
      <p>{userProfile?.currentPost || 'No current post available.'}</p>
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
  </div>

  {/* Right: Recent Activity */}
  <div className={styles.recentActivity}>
    <h3>Recent Activity</h3>
    {userPosts.map((post) => (
      <div className={styles.card} key={post._id}>
        <div className={styles.card_profileContainer}>
          {post.media !== "" ?<img src={`${BASE_URL}/${post.media}`} />:<div style={{width:"3rem",height:"3rem"}}></div>}
        </div>
        <p>{post.body}</p>
      </div>
    ))}
  </div>
</div>

          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get("/getUserProfile", {
    params: {
      username: context.query.username,
    },
  });

  return {
    props: {
      userProfile: request.data.profile,
    },
  };
}

export default ViewProfilePage;
