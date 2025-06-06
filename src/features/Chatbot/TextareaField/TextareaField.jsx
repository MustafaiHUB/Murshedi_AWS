import { useCallback, useEffect, useRef, useState } from "react";
import RecordIcon from "../../../icons/RecordIcon";
import SubmitIcon from "../../../icons/SubmitIcon";
import { useNavigate, useParams } from "react-router-dom";
import Copyright from "../../../ui/Copyright";
import TextareaInput from "./TextareaInput";
import { useSelector } from "react-redux";
import { useChatActions } from "../../../hooks/useChatActions";
import summarizeText from "../../../services/summarizeText";
import StopRecordIcon from "../../../icons/StopRecordIcon";
let newChatId;

// Simple UUID generator fallback
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function TextareaField() {
  const currentId = useSelector((state) => state.chat.currentId);
  const currentThreadId = useSelector((state) => state.chat.current_thread_id);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { chatId } = useParams();

  const { createNewChat, sendQuestionHandler, setErrorHandler } =
    useChatActions();
  const [question, setQuestion] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const blindMode = useSelector((state) => state.user.user.blindMode);
  const userLanguageSTT = useSelector((state) => state.user.userLanguageSTT);
  const isMultiline = question.length > 100;

  const hideRecordIcon = question.trim() !== "";
  // Handle sending the question
  const handleQuestion = useCallback(
    async function (e, directQuestion = null) {
      e?.preventDefault();
      const finalQuestion = directQuestion || question;
      if (!finalQuestion.trim()) {
        return;
      }

      if (!chatId) {
        // new chatId only on new chat (for the first question within the chat)
        newChatId = crypto?.randomUUID?.() || generateUUID();
        createNewChat(newChatId, summarizeText(finalQuestion));
        navigate(`/chatbot/${newChatId}`);
        setQuestion("");
        await sendQuestionHandler(newChatId, finalQuestion);
      } else {
        setQuestion("");
        await sendQuestionHandler(currentId, finalQuestion, currentThreadId);
      }
    },
    [
      question,
      sendQuestionHandler,
      navigate,
      chatId,
      createNewChat,
      currentId,
      currentThreadId,
    ]
  );

  // Initialize SpeechRecognition API with mobile support
  useEffect(() => {
    const isSpeechSupported =
      "SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window ||
      (navigator.mediaDevices && "getUserMedia" in navigator.mediaDevices);

    if (!isSpeechSupported) {
      setErrorHandler(
        "Please enable microphone permissions in your browser settings"
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    // Check if the browser supports SpeechRecognition
    if (!SpeechRecognition) {
      return;
    }
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true; // Changed to true to prevent automatic stopping
    recognitionInstance.lang = userLanguageSTT;
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setQuestion((prev) => (prev += `${transcript}`));

      if (blindMode && transcript.trim()) {
        handleQuestion(undefined, transcript);
        recognitionInstance.stop();
        setIsRecording(false);
      }
    };

    recognitionInstance.onerror = (event) => {
      if (event.error === "not-allowed") {
        setErrorHandler(
          "Please enable microphone permissions in your browser settings"
        );
      } else {
        setErrorHandler(`Speech recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    // Don't automatically stop recording on the onend event
    recognitionInstance.onend = () => {
      // Only handle automatic stops (errors, etc.)
      if (isRecording) {
        // Try to restart if it was stopped automatically
        try {
          recognitionInstance.start();
        } catch (err) {
          setIsRecording(false);
          setErrorHandler("Recording stopped unexpectedly: " + err.message);
        }
      }
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [
    setErrorHandler,
    handleQuestion,
    blindMode,
    userLanguageSTT,
    isRecording,
  ]);

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      setErrorHandler(
        "Microphone access was denied. Please check your browser permissions."
      );
      return false;
    }
  };

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      setErrorHandler(
        "Please enable microphone permissions in your browser settings"
      );
      return;
    }

    if (!isRecording) {
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (err) {
          setErrorHandler("Failed to start recording: " + err.message);
        }
      }
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(
    function () {
      const handleKeyDown = (e) => {
        if (e.key === "Enter" && e.shiftKey) {
          return;
        }
        if (e.key === "Enter") {
          handleQuestion(e);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    },
    [handleQuestion]
  );

  return (
    <div className='flex flex-col items-center w-full px-5'>
      <div className='relative w-full max-w-[700px]'>
        <form onSubmit={handleQuestion}>
          <TextareaInput
            handleQuestion={handleQuestion}
            question={question}
            isMultiline={isMultiline}
            setQuestion={setQuestion}
          />
        </form>
        {/* Record button logic: Show record icon when not recording and no text entered */}
        {!hideRecordIcon && !isRecording && (
          <RecordIcon toggleRecording={toggleRecording} />
        )}

        {/* Stop Recording button: Show when recording is active */}
        {isRecording && <StopRecordIcon toggleRecording={toggleRecording} />}

        {/* Submit button: Show when there is text */}
        {hideRecordIcon && !isRecording && (
          <SubmitIcon handleQuestion={handleQuestion} />
        )}
      </div>

      <Copyright className='py-3' />
    </div>
  );
}

export default TextareaField;
