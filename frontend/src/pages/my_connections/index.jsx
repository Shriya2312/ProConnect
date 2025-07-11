import { AcceptConnection, getMyConnectionRequests } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/userLayout';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './style.module.css';
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function MyConnections() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem('token') }));
  }, []);

  useEffect(() => {
    if (authState.connectionRequest.length !== 0) {
      console.log(authState.connectionRequest);
    }
  }, [authState.connectionRequest]);


  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{display:"flex", flexDirection:"column",gap:"1.7rem"}}>
          <h4>My Connections</h4>
          {authState.connectionRequest.length === 0 && <h2>No Connection Requests Pending</h2>}
          {authState.connectionRequest.length !== 0 &&
            authState.connectionRequest.filter((connection)=> connection.status_accepted === null).map((user, index) => (
              <div className={styles.userCard} key={index}>
                <div
                  className={styles.userInfoWrapper}
                  onClick={() => router.push(`/view_profile/${user.userId.username}`)}
                >
                  <div className={styles.profilePicture}>
                    <img src={`${BASE_URL}/${user.userId.profilePicture}`} alt="profile" />
                  </div>
                  <div className={styles.userInfo}>
                    <h3>{user.userId.name}</h3>
                    <h3>@{user.userId.username}</h3>
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  <button
                 onClick={(e)=>{
                  e.stopPropagation();
                  dispatch(AcceptConnection({
                    connectionId:user._id,
                    token:localStorage.getItem('token'),
                    action:'accept'
                  }))
                 }}
                    className={`${styles.iconButton} ${styles.accept}`}
                  >
                    <CheckIcon className={styles.icon} />
                  </button>
                  <button
                    onClick={() => handleReject(user.userId._id)}
                    className={`${styles.iconButton} ${styles.reject}`}
                  >
                    <XMarkIcon className={styles.icon} />
                  </button>
                </div>
              </div>
            ))}

             <h4>My Network</h4>
            {authState.connectionRequest.filter((connection)=> connection.status_accepted  !== null).map((user, index) => (
              <div className={styles.userCard} key={index}>
                <div
                  className={styles.userInfoWrapper}
                  onClick={() => router.push(`/view_profile/${user.userId.username}`)}
                >
                  <div className={styles.profilePicture}>
                    <img src={`${BASE_URL}/${user.userId.profilePicture}`} alt="profile" />
                  </div>
                  <div className={styles.userInfo}>
                    <h3>{user.userId.name}</h3>
                    <h3>@{user.userId.username}</h3>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
