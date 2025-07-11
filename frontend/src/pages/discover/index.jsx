import { getAllUsers } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/userLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from './style.module.css'
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';

export default function DiscoverPage() {
  const authState = useSelector((state)=>state.auth);
  const dispatch =useDispatch();
  const router = useRouter();

  useEffect(()=>{
    if(!authState.all_profiles_fetched){
      dispatch(getAllUsers());
    }
  },[]);
  return (
       <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Discover Page</h1>
         <div className={styles.allUserProfile}>
            {authState.all_users
              ?.filter(profile => profile.userId !== null)
              .map((profile, index) => (
                <div onClick={()=>{
                    router.push(`/view_profile/${profile.userId.username}`)
                }} key={index} className={styles.userCard}>
                  <img
                    src={`${BASE_URL}/${profile.userId.profilePicture}`}
                    alt="Profile"
                    className={styles.profileImage}
                     onError={(e) => (e.target.src = "images/defayult.jpg")}
/>
                  
                  <div className={styles.userInfo}>
                    <p className={styles.userName}>{profile.userId.name}</p>
                    <p className={styles.userUsername}>@{profile.userId.email}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </DashboardLayout>
    
    </UserLayout>
  )
}
