import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

function Login() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [userLoginMethod, setUserLoginMethod] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Prevent redirect during registration
    if (isRegistering) return;

    // Redirect to dashboard if logged in and token exists
    const token = localStorage.getItem("token");
    if (authState.loggedIn && token) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router, isRegistering]);

  useEffect(() => {
    // Clear message when switching modes
    dispatch(emptyMessage());
  }, [userLoginMethod, dispatch]);

  useEffect(() => {
    // Switch to Sign In after successful registration
    if (authState.message.message && !authState.isError && !userLoginMethod && isRegistering) {
      setIsRegistering(false);
      setUserLoginMethod(true);
      setUsername("");
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [authState.message.message, authState.isError, userLoginMethod, isRegistering]);

  const handleRegister = () => {
    if (!username || !email || !password || !name) {
      dispatch({ type: "AUTH_ERROR", payload: { message: "All fields are required" } });
      return;
    }
    setIsRegistering(true);
    dispatch(registerUser({ username, email, password, name }));
  };

  const handleLogin = () => {
    if (!email || !password) {
      dispatch({ type: "AUTH_ERROR", payload: { message: "Email and password are required" } });
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <p className={styles.cardleft_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>
            <div className={styles.messageContainer}>
              <p
                className={`${styles.message} ${
                  authState.isError ? styles.error : styles.success
                } ${authState.message.message ? styles.visible : ""}`}
              >
                {authState.message.message || " "}
              </p>
            </div>
            <div className={styles.inputContainer}>
              <div className={styles.inputRow}>
                {!userLoginMethod && (
                  <>
                    <input
                      onChange={(e) => setUsername(e.target.value)}
                      className={`${styles.inputField} ${
                        userLoginMethod ? styles.hidden : styles.visible
                      }`}
                      type="text"
                      placeholder="Username"
                      value={username}
                    />
                    <input
                      onChange={(e) => setName(e.target.value)}
                      className={`${styles.inputField} ${
                        userLoginMethod ? styles.hidden : styles.visible
                      }`}
                      type="text"
                      placeholder="Name"
                      value={name}
                    />
                  </>
                )}
              </div>
              <input
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                type="email"
                placeholder="Email"
                value={email}
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                type="password"
                placeholder="Password"
                value={password}
              />
              <div
                onClick={() => {
                  if (userLoginMethod) {
                    handleLogin();
                  } else {
                    handleRegister();
                  }
                }}
                className={`${styles.buttonWithOutline} ${
                  authState.isLoading ? styles.loading : ""
                }`}
              >
                <p>{authState.isLoading ? "Loading..." : userLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>
            </div>
          </div>
          <div className={styles.cardContainer_right}>
            <p>
              {userLoginMethod
                ? "Don't Have an Account?"
                : "Already Have an Account?"}
            </p>
            <div
              onClick={() => {
                setUserLoginMethod(!userLoginMethod);
              }}
              className={styles.buttonWithOutline_right}
            >
              <p>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default Login;