import React, { useState } from "react";
import Orb from "../ui/Orb";
import send from "../../assets/images/send.svg";
function DebtAI() {
    const backendURL = import.meta.env.VITE_BACKEND_URL;
   const [input, setInput] = useState("");
    const [chatReply, setChatReply] = useState("");

    const handleSend = async () => {
        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: input,
                    userData: {
                        income: 30000,
                        expenses: 20000,
                        goal: "clear debt in 1 year",
                    },
                }),
            });

            const data = await response.json();
            console.log(data);
            
            setChatReply(data.reply);
            setInput(""); 
        } catch (error) {
            console.error("Failed to fetch:", error);
        }
    };
  return (
    <>
      <div
        className="bg-gradient-to-tr from-[#FAF3E0] via-[#E5D4FF] to-[#C1A7FF]
 h-screen"
      ></div>
      <div
        className="fixed bottom-0 left-0 w-full bg-gradient-to-tr from-[#e3daf7] via-[#e3d9f2] to-[#f9e0fa]
 py-4 flex justify-center"
      >
        <div className="relative w-[90%] sm:w-150">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="Type your Query"
            className="w-full resize-none rounded-3xl p-3 pr-12 border text-black placeholder-black"
          />
          <button type="button" onClick={handleSend}>
            <img
              src={send}
              alt="Send"
              className="absolute right-3 bottom-4.5 w-6 cursor-pointer"
            />
          </button>
        </div>
      </div>
    </>
  );
}

export default DebtAI;
