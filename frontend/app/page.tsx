/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiSend, FiTrash2, FiMic, FiMicOff } from "react-icons/fi";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: any[];
  loading?: boolean;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  // const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [docs, setDocs] = useState<any[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [listening, setListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const savedChats = localStorage.getItem("chats");

    if (savedChats) {
      const parsed = JSON.parse(savedChats);

      setChats(parsed);

      if (parsed.length > 0) {
        setCurrentChatId(parsed[0].id);
      }
    }

    setInitialized(true);
    getDocs();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const createChat = () => {
    const newChat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (id: string) => {
    const remainingChats = chats.filter((chat) => chat.id !== id);

    setChats(remainingChats);

    if (remainingChats.length === 0) {
      createChat();
    }

    if (currentChatId === id) {
      setCurrentChatId(remainingChats.length ? remainingChats[0].id : "");
    }
  };

  const currentChat = chats.find((c) => c.id === currentChatId) ?? {
    messages: [],
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userQuestion = question;
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== currentChatId) return chat;

        return {
          ...chat,
          title:
            chat.title === "New Chat"
              ? userQuestion.slice(0, 40) + "..."
              : chat.title,
        };
      }),
    );
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  role: "user",
                  content: userQuestion,
                },
                {
                  role: "assistant",
                  content: "Thinking...",
                  loading: true,
                },
              ],
            }
          : chat,
      ),
    );
    setQuestion("");
    setLoading(true);

    try {
      const recentHistory = currentChat?.messages.slice(-6) || [];
      const res = await axios.post("http://localhost:8000/chat", {
        question: userQuestion,
        history: recentHistory,
      });
      setAnswer(res.data.answer);
      setCitations(res.data.citations);
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentChatId) return chat;

          const updatedMessages = [...chat.messages];

          updatedMessages[updatedMessages.length - 1] = {
            role: "assistant",
            content: res.data.answer,
            citations: res.data.citations,
          };

          return {
            ...chat,
            messages: updatedMessages,
          };
        }),
      );
    } catch (error) {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== currentChatId) return chat;

          const updatedMessages = [...chat.messages];

          updatedMessages[updatedMessages.length - 1] = {
            role: "assistant",
            content: "Backend error",
          };
          return {
            ...chat,
            messages: updatedMessages,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const getDocs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/documents");
      setDocs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    console.log(SpeechRecognition);

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;

      console.log(transcript);

      setQuestion(transcript);

      recognition.onerror = () => {
        setListening(false);
      };
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chats]);

  return (
    <div className="h-screen bg-zinc-950 text-white flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
    fixed lg:static
    top-0 left-0 h-screen
    w-72
    bg-zinc-950
    border-r border-zinc-800
    p-4
    flex flex-col
    z-50
    transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        <button
          onClick={createChat}
          className="w-full bg-blue-600 rounded-lg p-3 mb-4"
        >
          + New Chat
        </button>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-zinc-500 uppercase mb-2">Chats</p>

          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                currentChatId === chat.id ? "bg-zinc-800" : "hover:bg-zinc-900"
              }`}
            >
              <span
                onClick={() => setCurrentChatId(chat.id)}
                className="flex-1 truncate"
              >
                {chat.title}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="border-t border-zinc-800 pt-4 mt-4">
          <p className="text-xs text-zinc-500 uppercase mb-2">Documents</p>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {docs.map((doc: any) => (
              <div
                key={doc.filename}
                className="bg-zinc-900 rounded-lg px-3 py-2 text-sm"
              >
                <p className="truncate">{doc.filename}</p>

                <p className="text-xs text-zinc-500">{doc.pages} pages</p>
              </div>
            ))}
          </div>

          <Link
            href="/upload"
            className="block mt-3 text-center bg-zinc-800 hover:bg-zinc-700 rounded-lg py-2 text-sm"
          >
            Manage Documents
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-zinc-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <h1 className="text-xl font-semibold">
                Document Intelligence Chat
              </h1>
            </div>
            <Link
              href="/upload"
              className="bg-gray-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-500 transition text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Upload Documents</span>
              <span className="sm:hidden">Upload</span>
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentChat?.messages.map((msg, idx) => (
            <div key={idx}>
              <div
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`w-fit max-w-[95%] sm:max-w-3xl rounded-2xl px-4 py-3 ${
                    msg.role === "user" ? "bg-blue-600" : "bg-zinc-900"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>

                  {msg.role === "assistant" && msg.citations && (
                    <div className="mt-4">
                      <p className="text-sm text-zinc-400 mb-2">Sources</p>

                      <div className="flex gap-3 flex-wrap">
                        {msg.citations.map((c: any, i: number) => (
                          <div key={i} className="bg-zinc-800 rounded-xl p-2">
                            <img
                              src={`http://localhost:8000/image?path=${encodeURIComponent(
                                c.image_page,
                              )}`}
                              onClick={() => setSelectedImage(c.image_page)}
                              className="w-28 h-36 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            />

                            <p className="text-xs mt-2">Page {c.page}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div ref={bottomRef} />
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 p-4">
          <div className="max-w-4xl mx-auto flex gap-2 w-full">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !loading &&
                  question.trim()
                ) {
                  e.preventDefault();
                  askQuestion();
                }
              }}
              placeholder="Ask about your documents..."
              className="flex-1 bg-zinc-900 rounded-xl px-4 py-3 outline-none border border-zinc-800"
            />

            <button
              onClick={toggleMic}
              className={`px-4 rounded-lg ${
                listening ? "bg-red-600" : "bg-zinc-800"
              }`}
            >
              {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
            </button>
            <button
              disabled={loading}
              onClick={askQuestion}
              className="bg-blue-600 px-4 sm:px-5 rounded-xl hover:bg-blue-500"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage("")}
        >
          <img
            src={`http://localhost:8000/image?path=${encodeURIComponent(
              selectedImage,
            )}`}
            className="max-w-[90vw] max-h-[90vh] rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute top-5 right-5 text-4xl"
            onClick={() => setSelectedImage("")}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// return (
//   <div className="p-10">
//     <h1 className="text-2xl font-bold mb-4">Chatbot</h1>

//     <input
//       className="border p-2 w-full"
//       value={question}
//       onChange={(e) => setQuestion(e.target.value)}
//     />

//     <button
//       className="bg-black text-white px-4 py-2 mt-3"
//       onClick={askQuestion}
//     >
//       Ask
//     </button>

//     <div className="mt-5">{answer}</div>

//     <div className="mt-5">
//       {citations.map((c: any, index) => (
//         <div key={index}>
//           <p>{c.document}</p>
//           <p>Page {c.page}</p>
//           <img
//             src={`http://localhost:8000/image?path=${c.image_page}`}
//             onClick={() => setSelectedImage(c.image_page)}
//             className="w-32"
//           />
//         </div>
//       ))}
//       {selectedImage && (
//         <div
//           className="fixed inset-0 bg-black/70 flex items-center justify-center"
//           onClick={() => setSelectedImage("")}
//         >
//           <img
//             src={`http://localhost:8000/image?path=${encodeURIComponent(selectedImage)}`}
//             className="max-h-[90vh] max-w-[90vw]"
//             onClick={(e) => e.stopPropagation()}
//           />
//           <button
//             className="absolute top-4 right-4 text-white text-3xl cursor-pointer"
//             onClick={() => setSelectedImage("")}
//           >
//             ×
//           </button>
//         </div>
//       )}
//     </div>
//     <div className="mt-5">
//       {messages.map((msg, idx) => (
//         <div key={idx} className="">
//           {msg.role === "user" ? (
//             <p>You: {msg.content}</p>
//           ) : (
//             <p>Assistant: {msg.content}</p>
//           )}
//         </div>
//       ))}
//     </div>
//   </div>
// );
