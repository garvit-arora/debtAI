import { getAuth } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function Onboarding() {
    const auth = getAuth();
    const navigate = useNavigate();

    const saveUser = async () => {
      const user = auth.currentUser;
      const db = getDatabase();

      await set(ref(db, "users/" + user.uid), {
        email: user.email,
        onboarded: true,
        name:answers[0],
        income:answers[1],
        debts:answers[2],
        createdAt: Date.now(),
      });

      navigate("/dashboard");
    };

  const titleRef = useRef(null);
  const questionRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  const questions = [
    "What is your name?",
    "What is your monthly income?",
    "How many debts do you currently have?",
  ];
  useEffect(() => {
    const el = titleRef.current;
    const rect = el.getBoundingClientRect();

    gsap.fromTo(
      el,
      {
        x: window.innerWidth / 2 - rect.left - rect.width / 2,
        y: window.innerHeight / 2 - rect.top - rect.height / 2,
        scale: 1.6,
        opacity: 1,
      },
      {
        x: 0,
        y: 0,
        scale: 1,
        delay: 1.3,
        opacity: 1,
        duration: 2,
        ease: "power3.out",
        onComplete: () => {
          showQuestion();
          showContent();
        },
      }
    );
  }, []);

  const showQuestion = () => {
    gsap.fromTo(
      [questionRef.current, inputRef.current, buttonRef.current],
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      }
    );
  };

  const showButton = () => {
    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  };
  const showInput = () => {
    gsap.fromTo(
      inputRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  };
const nextQuestion = () => {
    if (!currentAnswer.trim()) return;

    gsap.to([questionRef.current, inputRef.current, buttonRef.current], {
      opacity: 0,
      y: -20,
      duration: 0.4,
      onComplete: () => {
        setAnswers(prev => [...prev, currentAnswer]);
        setCurrentAnswer("");
        setStep(prev => prev + 1);
        setTimeout(showQuestion, 100);
      },
    });
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start pt-24 gap-16 cream">
      {/* Heading */}
      <h1 ref={titleRef} className="text-5xl font-bold tracking-wide">
        Onboarding
      </h1>

      {/* Question Box */}
      {step < questions.length && (
        <div className="flex flex-col items-center gap-6">
          <h2
            style={{ opacity: 0 }}
            ref={questionRef}
            className="text-2xl font-medium text-center max-w-xl"
          >
            {questions[step]}
          </h2>

          <input
            ref={inputRef}
            style={{ opacity: 0 }}
            type="text"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="px-4 py-2 border rounded-lg w-80"
          />

          <button
            style={{ opacity: 0 }}
            ref={buttonRef}
            onClick={nextQuestion}
            className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90"
          >
            Next →
          </button>
        </div>
      )}

      {step >= questions.length && saveUser() && (
        <h2 className="text-2xl font-semibold animate-pulse">
          All set. Let’s build your dashboard
        </h2>
      )}
    </div>
  );
}
