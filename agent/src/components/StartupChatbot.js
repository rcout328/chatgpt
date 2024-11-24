"use client";

import { useState, useEffect, useRef } from 'react';
import { callGroqApi } from '@/utils/groqApi';
import { useRouter } from 'next/navigation';

export default function StartupChatbot({ onClose, setUserInput }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasEnoughInfo, setHasEnoughInfo] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start the conversation when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      startConversation();
    }
  }, []);

  // Check if we have enough information
  useEffect(() => {
    if (messages.length >= 6) { // After a few exchanges
      const userMessages = messages.filter(m => m.role === 'user');
      const totalLength = userMessages.reduce((acc, msg) => acc + msg.content.length, 0);
      
      if (totalLength > 200 && !hasEnoughInfo) { // If user has provided substantial information
        setHasEnoughInfo(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I think I have a good understanding of your startup now. You can continue sharing more details or type 'end' when you're ready for me to create a comprehensive summary.",
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [messages, hasEnoughInfo]);

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const response = await callGroqApi([{
        role: "system",
        content: `You are an expert startup consultant conducting an interview to gather information about a startup. 
        Your goal is to ask relevant questions one at a time to understand the startup thoroughly.
        Start with a friendly introduction and your first question.
        Keep your responses conversational and engaging.
        Ask follow-up questions based on the user's responses.
        Cover important aspects like:
        - Problem being solved
        - Target market
        - Solution/product
        - Business model
        - Competition
        - Current stage
        - Team
        - Growth plans`
      }]);

      setMessages([{
        role: 'system',
        content: "👋 Welcome! I'll help you describe your startup idea. Type 'end' whenever you feel you've shared all the important details.",
        timestamp: new Date().toISOString()
      }, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStartupDescription = async (conversation) => {
    try {
      const response = await callGroqApi([
        {
          role: "system",
          content: "You are an expert at creating comprehensive startup descriptions. Based on the interview conversation provided, create a well-structured description that covers all key aspects of the startup."
        },
        {
          role: "user",
          content: `Based on this conversation, create a detailed but concise startup description:
          ${conversation.map(m => `${m.role}: ${m.content}`).join('\n\n')}`
        }
      ]);

      return response;
    } catch (error) {
      console.error('Error generating description:', error);
      return null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    if (userMessage.toLowerCase() === 'end') {
      // Generate final description
      const description = await generateStartupDescription(messages);
      if (description) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Great! I've created a description of your startup. Here it is:\n\n" + description,
          timestamp: new Date().toISOString()
        }]);

        // Store the description and trigger input update
        localStorage.setItem('businessInput', description);
        if (setUserInput) setUserInput(description);
        
        // Add final message about manual input
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I've added this description to the manual input field. You can now close this chat and click 'Start Analysis' to begin the analysis, or edit the description first if you'd like to make any changes.",
          timestamp: new Date().toISOString()
        }]);

        setIsComplete(true);
        
        // Close chatbot after a short delay and refresh the page
        setTimeout(() => {
          onClose();
          window.dispatchEvent(new Event('storage')); // Trigger storage event to update input
        }, 5000);
      }
    } else {
      try {
        // Get AI response based on conversation history
        const response = await callGroqApi([
          {
            role: "system",
            content: `You are an expert startup consultant conducting an interview.
            Ask relevant follow-up questions based on the conversation history.
            Keep your responses conversational and engaging.
            Ask one question at a time.
            If you have gathered enough information about a topic, move on to other important aspects.`
          },
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          {
            role: "user",
            content: userMessage
          }
        ]);

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        setMessages(prev => [...prev, {
          role: 'system',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        }]);
      }
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    router.refresh(); // Refresh the page
    onClose(); // Close the chatbot
  };

  // Add storage event listener to handle updates
  useEffect(() => {
    const handleStorageChange = () => {
      const storedInput = localStorage.getItem('businessInput');
      if (storedInput) {
        setUserInput(storedInput);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="w-full max-w-2xl bg-gradient-to-b from-purple-500/10 to-transparent p-[1px] rounded-2xl backdrop-blur-xl">
      <div className="bg-[#1D1D1F]/90 p-8 rounded-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            AI Assistant
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div className="h-[400px] overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : message.role === 'system'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-[#131314] text-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#131314] rounded-xl p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form or Back Button */}
        {isComplete ? (
          <button
            onClick={handleBack}
            className="w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 
                     bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 
                     hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25"
          >
            Back to Input
          </button>
        ) : (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isComplete ? "Interview complete!" : "Type your message..."}
              className="flex-1 p-3 bg-[#131314] text-gray-200 rounded-xl border border-purple-500/20 
                       placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              disabled={isComplete || isLoading}
            />
            <button
              type="submit"
              disabled={isComplete || isLoading || !inputMessage.trim()}
              className={`px-6 rounded-xl font-medium transition-all duration-200 
                        ${isComplete || isLoading || !inputMessage.trim()
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'}`}
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 