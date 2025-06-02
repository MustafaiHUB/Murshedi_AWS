import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import store from "../../../store";
import { useLoaderData, useNavigation, useParams } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";
import TextareaField from "../TextareaField/TextareaField";
import LatestQuestion from "./LatestQuestion";
import { useChatActions } from "../../../hooks/useChatActions";
import { getChatConversation } from "../../../services/apiChatbot";
import UserMessage from "./UserMessage";
import BotResponse from "./BotResponse";
import SpecialText from "../../../ui/SpecialText";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
function Chat() {
  const [copied, setCopied] = useState(false);
  const conversations = useSelector((state) => state.chat.conversation);
  const [isInitializing, setIsInitializing] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [currentMessages, setCurrentMessages] = useState([]);
  const chatEndRef = useRef(null);
  const uuidMapRef = useRef(new Map());
  const { chatId } = useParams();
  const navigation = useNavigation();

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

  // Ensure loaderData is available before destructuring
  const {
    messages = [],
    chatLoaded = false,
    thread_id = null,
  } = loaderData || {};

  const currentThreadId = conversations.find(
    (conversation) => conversation.id === chatId
  )?.thread_id;

  // Check if we're still navigating (loader is running)
  const isNavigating = navigation.state === "loading";

  useEffect(() => {
    // Don't process if we're still navigating or loader data isn't ready
    if (isNavigating || !loaderData) {
      return;
    }
    setIsInitializing(true);

    if (chatLoaded && messages && messages.length > 0) {
      const conversation = {
        id: chatId,
        thread_id: thread_id,
        messages: messages,
      };
      addConversationHandler(conversation);
      setCurrentMessages(messages);
      updateCurrentThreadIdHandler(thread_id);

      console.log("refresh2");
      setRefresh((prev) => !prev);
    } else if (currentChat?.messages && currentChat.messages.length > 0) {
      updateCurrentThreadIdHandler(currentThreadId);
      setCurrentMessages(currentChat.messages);
    } else {
      setCurrentMessages([]); // Fallback to an empty array if no messages are found
    }
    setIsInitializing(false);
  }, [
    chatLoaded,
    addConversationHandler,
    chatId,
    messages,
    currentChat?.messages,
    currentThreadId,
    thread_id,
    updateCurrentThreadIdHandler,
    isNavigating,
    loaderData,
  ]);

  // dispatch (add the fetched messages to the state to reduce the amount of requests)
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current && !isInitializing) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages, isInitializing]);

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
  // Show loading state while navigating or initializing
  if (isNavigating || isInitializing) {
    return (
      <div className='flex items-center justify-center h-64'>
        <SpecialText>Loading Chat...</SpecialText>
      </div>
    );
  }
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
  // Validate params first
  if (!params || !params.chatId) {
    console.error("Invalid chatId in params");
    return {
      messages: [],
      chatLoaded: false,
      thread_id: null,
      error: "Invalid chat ID",
    };
  }

  const { chatId } = params;

  try {
    // Validate chatId format (assuming it should be a valid string)
    if (typeof chatId !== "string" || chatId.trim().length === 0) {
      console.error("Invalid chatId format:", chatId);
      return {
        messages: [],
        chatLoaded: false,
        thread_id: null,
        error: "Invalid chat ID format",
      };
    }

    // Access the Redux state safely
    let state, conversation, firstQuestion;
    try {
      state = store.getState();
      conversation = state?.chat?.conversation || [];
      firstQuestion = state?.chat?.firstQuestion;
    } catch (storeError) {
      console.error("Error accessing Redux store:", storeError);
      // Continue with empty values if store is not available
      conversation = [];
      firstQuestion = null;
    }

    // Check if the chatId exists in the conversation
    const chatExists =
      Array.isArray(conversation) &&
      conversation.some((chat) => chat?.id === chatId);

    // will work only when logging in, because the state will be empty
    if (!firstQuestion) {
      // it's a new chat, do not fetch the conversation unless if it's not found in the state
      if (!chatExists) {
        try {
          const newConversation = await getChatConversation(chatId);

          if (newConversation && typeof newConversation === "object") {
            const { history, threadId } = newConversation;

            // Validate the response structure
            const validHistory = Array.isArray(history) ? history : [];
            const validThreadId = threadId || null;

            return {
              messages: validHistory,
              chatLoaded: true,
              thread_id: validThreadId,
            };
          } else {
            console.warn(
              "Invalid conversation data received:",
              newConversation
            );
            return { messages: [], chatLoaded: false, thread_id: null };
          }
        } catch (apiError) {
          console.error("Error fetching conversation from API:", apiError);
          // Return safe fallback instead of throwing
          return {
            messages: [],
            chatLoaded: false,
            thread_id: null,
            error: "Failed to load conversation",
          };
        }
      }
    }

    // Default return for existing chats or when firstQuestion exists
    return { messages: [], chatLoaded: false, thread_id: null };
  } catch (error) {
    console.error("Unexpected error in loader:", error);
    // Always return a valid object structure
    return {
      messages: [],
      chatLoaded: false,
      thread_id: null,
      error: "Unexpected error occurred",
    };
  }
}

export default Chat;
