import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import store from "../../../store";
import { useLoaderData, useParams } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";
import TextareaField from "../TextareaField/TextareaField";
import LatestQuestion from "./LatestQuestion";
import { useChatActions } from "../../../hooks/useChatActions";
import { getChatConversation } from "../../../services/apiChatbot";
import UserMessage from "./UserMessage";
import BotResponse from "./BotResponse";

function generateUUID() {
  console.log("Generating UUID");
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function Chat() {
  const [copied, setCopied] = useState(false);
  const conversations = useSelector((state) => state.chat.conversation);

  const [currentMessages, setCurrentMessages] = useState([]);
  const chatEndRef = useRef(null);
  const uuidMapRef = useRef(new Map());
  const { chatId } = useParams();
  const {
    updateCurrentIdHandler,
    addConversationHandler,
    updateCurrentThreadIdHandler,
  } = useChatActions();
  const { closeSidebar } = useSidebar();
  const loaderData = useLoaderData();

  const chat = useSelector((state) => state.chat);
  const blindMode = useSelector((state) => state.user.user.blindMode);
  const { latestQuestion, isLoading, conversation } = chat;

  const currentChat = conversation.find((chat) => chat.id === chatId);

  const { messages, chatLoaded, thread_id } = loaderData;

  const currentThreadId = conversations.find(
    (conversation) => conversation.id === chatId
  )?.thread_id;

  useEffect(() => {
    if (chatLoaded && messages && messages.length > 0) {
      console.log("Loading messages from API");
      const conversation = {
        id: chatId,
        thread_id: thread_id,
        messages: messages,
      };
      addConversationHandler(conversation);
      setCurrentMessages(messages);
      updateCurrentThreadIdHandler(thread_id);
    } else if (currentChat?.messages && currentChat.messages.length > 0) {
      console.log("Loading messages from Redux store");
      updateCurrentThreadIdHandler(currentThreadId);
      setCurrentMessages(currentChat.messages);
    } else {
      console.log("No messages found");
      setCurrentMessages([]); // Fallback to an empty array if no messages are found
    }
  }, [
    chatLoaded,
    addConversationHandler,
    chatId,
    messages,
    currentChat,
    conversation,
    currentThreadId,
    thread_id,
    updateCurrentThreadIdHandler,
  ]);

  // dispatch (add the fetched messages to the state to reduce the amount of requests)
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  useEffect(() => {
    closeSidebar();
  }, [chatId, closeSidebar]);

  useEffect(() => {
    updateCurrentIdHandler(chatId);
  }, [chatId, updateCurrentIdHandler]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Hide popup after 2s
  };

  const getStableKey = (index) => {
    if (!uuidMapRef.current.has(index)) {
      uuidMapRef.current.set(index, crypto?.randomUUID?.() || generateUUID());
    }
    return uuidMapRef.current.get(index);
  };

  return (
    <>
      <div
        className='overflow-y-auto px-10 mt-1 mb-2'
        style={{ maxHeight: "85dvh" }}
      >
        <div className='pb-2 w-full max-w-[1000px] mx-auto text-stone-200 mt-3'>
          {currentMessages?.map((q, index) => (
            <div
              key={getStableKey(index)}
              className='mb-4 border-b border-b-gray-500 pb-4'
            >
              <UserMessage question={q?.question} />

              <BotResponse
                blindMode={blindMode}
                answer={q?.answer}
                handleCopy={handleCopy}
                response_id={q.response_id}
              />
            </div>
          ))}

          {/* Show the latest question while waiting for the response */}
          {isLoading && latestQuestion && (
            <LatestQuestion latestQuestion={latestQuestion} />
          )}

          {/* Auto-scroll to bottom */}
          <div ref={chatEndRef} />
        </div>
      </div>
      {copied && (
        <div className='fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50'>
          Copied to clipboard!
        </div>
      )}
      {/* Text area for sending new questions */}
      <TextareaField />
    </>
  );
}

export async function loader({ params }) {
  const { chatId } = params;
  console.log(chatId);
  // Access the Redux state
  const state = store.getState();
  const conversation = state.chat.conversation;
  const firstQuestion = state.chat.firstQuestion;

  // Check if the chatId exists in the conversation
  const chatExists = conversation.some((chat) => chat.id === chatId);

  // will work only when loggin in, because the state will be empty
  if (!firstQuestion) {
    // it's a new chat, do not fetch the conversation unless if it's not found in the state
    if (!chatExists) {
      const newConversation = await getChatConversation(chatId);

      if (newConversation) {
        const { history, threadId } = newConversation;
        return {
          messages: history || [],
          chatLoaded: true,
          thread_id: threadId,
        };
      }
      // return { messages: newConversation || [], chatLoaded: true };
    }
  }
  return { messages: [], chatLoaded: false, thread_id: null };
}

export default Chat;
