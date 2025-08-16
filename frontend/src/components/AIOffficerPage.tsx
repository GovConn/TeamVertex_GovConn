"use client";

import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIOffficerPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello I'm a Sri Lankan e-gov service providing AI agent. How can I help you.",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://govconn-ai-assistant.ashymushroom-20e1d563.centralus.azurecontainerapps.io/query/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Secret-token": "rootcode",
          },
          body: JSON.stringify({
            thread_id: user?.nic || "anonymous", // Fixed: proper underscore and fallback
            user_input: trimmedInput, // Fixed: proper underscore
            lang: "en",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Fixed: proper template literal
      }

      const data = await response.json();
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer || data.response || "I received your message but couldn't generate a proper response.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("AI Assistant Error:", error);
      
      let errorMessage = "Sorry, something went wrong while processing your request. Please try again later.";
      
      // Enhanced error handling for specific cases
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('unsupported_country')) {
          errorMessage = "This service is currently not available in your region. Please contact support for assistance.";
        } else if (error.message.includes('500')) {
          errorMessage = "The service is temporarily unavailable. Please try again in a few minutes.";
        }
      }
      
      const errorMessageObj: Message = {
        id: (Date.now() + 2).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bgWhite">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-strokeGrey bg-bgWhite sm:px-6">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-bgDisabled transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-textGrey" />
          </Link>
          <div className="flex items-center gap-3">
            {/* Sri Lankan Flag Icon */}
            <div className="flex-shrink-0 w-10 h-10  rounded-full flex items-center justify-center">
              <img src="/images/logonochar.png" alt="Sri Lankan Flag" className="w-8 h-8" />


              
             
            </div>
            <h1 className="text-lg font-semibold text-textBlack sm:text-xl">
              AI Officer
            </h1>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`} // Fixed: proper template literal
            >
              {!message.isUser && (
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-mainYellow rounded-full flex items-center justify-center">
                     <img src="/images/logonochar.png" alt="Sri Lankan Flag" className="w-8 h-8" />

                  </div>
                </div>
              )}
              
              <div
                className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-3 rounded-2xl ${
                  message.isUser
                    ? "bg-strokeGrey/10 text-textBlack rounded-br-md"
                    : "bg-buttonPrimaryDisabled text-textBlack rounded-bl-md"
                }`} // Fixed: proper template literal
              >
                <p className="text-sm sm:text-base leading-relaxed">
                  {message.text}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-buttonPrimaryDisabled rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-textBlack">🇱🇰</span>
                </div>
              </div>
              <div className="bg-buttonPrimaryDisabled px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-textBlack" />
                  <span className="text-sm text-textBlack">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-strokeGrey bg-bgWhite px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type in your message"
                className="w-full px-4 py-3 pr-12 rounded-full border border-strokeGrey bg-bgWhite text-textBlack placeholder-textGrey focus:outline-none focus:border-strokeFocused focus:ring-2 focus:ring-strokeFocused/20 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 bg-textBlack rounded-full flex items-center justify-center hover:bg-textBlack/80 disabled:bg-bgDisabled disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-textWhite animate-spin" />
              ) : (
                <Send className="h-5 w-5 text-textWhite" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
