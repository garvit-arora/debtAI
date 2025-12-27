import React, { useEffect, useState } from "react";
import logo from "../../assets/icons/logo.png";
import { getDatabase, ref, get, set } from "firebase/database";
import Loader from "../Loader";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../../firebase";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = (event) => {
    setEmail(event.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  // const handleSubmit = (event) => {
  //   event.preventDefault();
  // };
  // const [user, setUser] = useState(null);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();
  const afterLogin = async (user) => {
    const db = getDatabase(app);
    const userRef = ref(db, "users/" + user.uid);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      await set(userRef, {
        email: user.email,
        createdAt: Date.now(),
      });
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  const handleEmailAuth = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    setLoading(true);

    const result = await signInWithEmailAndPassword(auth, email, password);
    await afterLogin(result.user);

  } catch (error) {
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-credential"
    ) {
      // User does not exist → create account
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await afterLogin(result.user);
    } else {
      alert(error.message);
    }
  } finally {
    setLoading(false);
  }
};


  const provider = new GoogleAuthProvider();

  const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await afterLogin(result.user);

  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData.email;

      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes("password")) {
        alert("This email is already registered with Email & Password. Please login using email.");
      } 
      else if (methods.includes("github.com")) {
        alert("This email is linked with GitHub. Please login using GitHub.");
      } 
      else if (methods.includes("google.com")) {
        alert("This email is linked with Google. Please login using Google.");
      } 
      else {
        alert("This email already exists. Please use the original login method.");
      }
    } else {
      alert(error.message);
    }
  }
};

  const loginWithGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    await afterLogin(result.user);

  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData.email;
      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes("google.com")) {
        alert("This account uses Google login. Please sign in with Google.");
      } else if (methods.includes("password")) {
        alert("This account uses Email & Password login.");
      } else {
        alert("Account exists with another provider.");
      }
    } else {
      alert(error.message);
    }
  }
};


  return (
    <>
      {loading && <Loader />}
      <div className="cream h-screen flex justify-center items-center gap-40 ">
        <div className="headings">
          <h1 className="brownish leading-tight pacifico font-bold text-center text-5xl">
            Tired of Debts ?
          </h1>
          <br />
          <h2 className="pacifico font-bold text-center">
            The AI for Debt-Trapped People
          </h2>
          <br />
          <div className="box1 w-100 h-100 flex flex-col border-2 items-center justify-center border-amber-700 rounded-3xl">
            <div className="buttons flex flex-col gap-2">
              <button
                className="font-semibold w-72 hover:bg-amber-600 hover:text-white cursor-pointer p-2 border-2 border-amber-700 rounded-xl"
                onClick={loginWithGoogle}
                disabled={loading}
              >
                <span className="inline-flex gap-2 items-center">
                  <svg
                    className="h-4"
                    viewBox="-3 0 262 262"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                    fill="#000000"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                        fill="#4285F4"
                      ></path>
                      <path
                        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                        fill="#34A853"
                      ></path>
                      <path
                        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                        fill="#FBBC05"
                      ></path>
                      <path
                        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                        fill="#EB4335"
                      ></path>
                    </g>
                  </svg>
                  Continue with Google
                </span>
              </button>
              <button
                className="font-semibold w-72 hover:bg-amber-600 hover:text-white cursor-pointer p-2 border-2 border-amber-700 rounded-xl"
                onClick={loginWithGithub}
                disabled={loading}
              >
                <span className="inline-flex gap-2 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-github"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                  </svg>
                  Continue with Github
                </span>
              </button>
            </div>
            <h3>OR</h3>
            <form className="items-center flex flex-col gap-3 mt-4">
              <input
                type="email"
                value={email}
                onChange={handleEmail}
                className="border w-72 font-semibold p-1.5 text-white rounded bg-gray-400 border-gray-500"
                placeholder="Enter your E-mail"
              />
              <input
                type="password"
                value={password}
                onChange={handlePassword}
                className="border w-72 font-semibold p-1.5 text-white rounded bg-gray-400 border-gray-500"
                placeholder="Enter your Password"
              />

              <button
                type="button"
                disabled={loading}
                onClick={handleEmailAuth}
                className="h-auto hover:bg-amber-200 cursor-pointer w-72 border-2 p-2 border-amber-600 bg-amber-700 text-white font-bold rounded-xl"
              >
                {loading ? "Processing..." : "Continue with Email"}
              </button>
            </form>
          </div>
        </div>
        <div className="media">
          <img src={logo} alt="Logo" className="w-100 border-4 h-auto" />
        </div>
      </div>
    </>
  );
}

export default Login;
