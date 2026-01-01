import React, { useEffect, useState } from "react";
import logo from "../../assets/icons/logo.jpeg";
import { getDatabase, ref, get, set } from "firebase/database";
import Loader from "../Loader.jsx";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  getRedirectResult,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithRedirect,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../../firebase";
import { MdSupportAgent, MdAccountBox } from "react-icons/md";
import image1 from "../../assets/images/image1.png";

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

    setLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await afterLogin(result.user);
        return;
      }
      if (methods.includes("password")) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await afterLogin(result.user);
        return;
      }
      if (methods.includes("google.com")) {
        alert("This email is linked with Google. Please sign in using Google.");
        return;
      }

      if (methods.includes("github.com")) {
        alert("This email is linked with GitHub. Please sign in using GitHub.");
        return;
      }

      alert("This email is registered with another provider.");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        try {
          const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          await afterLogin(result.user);
        } catch (loginError) {
          alert("Wrong password or account issue.");
        }
      } else if (error.code === "auth/wrong-password") {
        alert("Wrong password.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format.");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        alert("Use Google or GitHub to login.");
      } else {
        console.error(error);
        alert("Something went wrong.");
      }
    }
  };

  const provider = new GoogleAuthProvider();

  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      await afterLogin(result.user);
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData.email;
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.includes("password")) {
          alert("This email is registered with Email & Password.");
        } else if (methods.includes("github.com")) {
          alert("This email is registered with GitHub.");
        } else {
          alert("This email already exists.");
        }
      } else {
        console.error(error);
        alert("Google sign-in failed.");
      }
    } finally {
      setLoading(false);
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
      <div className="cream min-h-screen global">
        {loading && <Loader />}
        <div className="upper flex flex-col sm:flex-row justify-between">

          <div className="headings  flex flex-col ">
            <h1 className="text-3xl py-2 text-center px-10 sm:text-left">DebtAI</h1>
            <h3 className=" px-10">
              Track. Understand. Take control — without the overwhelm.
            </h3>
          </div>
          <div className="icons px-32 py-7">
            <button className="p-2 bg-white rounded-xl cursor-pointer">
              <span className="flex gap-2">
                <MdSupportAgent size="1.5em" />
                <h1>Get Support</h1>
              </span>
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between px-10 ">
          <div className="images">
            <img src={image1} alt="Releif From Debt" className="w-6xl " />
          </div>
          <div className="border-2 h-auto py-10 px-6 min-h-[80vh] border-amber-900 w-auto rounded-2xl ">
            <MdAccountBox size="4em" />
            <h1 className="text-4xl">Welcome To  <b>DebtAI</b> </h1>
            <h2>Clarity over chaos. Control over credit.</h2>
            <br />
            <form>
              <div className="fields flex flex-col gap-4">
                <div className="field1 flex flex-col gap-1">
                  <label className="font-bold px-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmail}
                    placeholder="Enter your E-mail"
                    className="border gray-border rounded-xl p-1.5 sm:w-lg w-xs"
                  />
                </div>
                <div className="field2 flex flex-col gap-1">
                  <label className="font-bold px-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={handlePassword}
                    placeholder="Enter your Password"
                    className="border gray-border rounded-xl p-1.5 sm:w-lg w-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEmailAuth}
                  className="sm:w-lg w-xs p-2 bg-amber-950 text-white rounded-2xl cursor-pointer"
                >
                  Let's Start This
                </button>
                <h3 className="text-center">OR</h3>
                <div className="buttons flex flex-col gap-2">
                  <button
                    type="button"
                    className="font-semibold cursor-pointer p-2 border-2 border-amber-700 rounded-xl hover:scale-101 hover:ease-in-out "
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
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
                    type="button"
                    className="font-semibold hover:scale-101 hover:ease-in-out cursor-pointer p-2 border-2 border-amber-700 rounded-xl"
                    onClick={loginWithGithub}
                    disabled={loading}
                  >
                    <span className="inline-flex gap-2 items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-github"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                      </svg>
                      Continue with Github
                    </span>
                  </button>
                </div>
                <p className="text-center">
                  By Continuing, You agree to our{" "}
                  <a
                    href="https://debtai.in/terms-and-policies"
                    className="text-blue-700 hover:underline"
                  >
                    Terms and Policies
                  </a>
                  .{" "}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
