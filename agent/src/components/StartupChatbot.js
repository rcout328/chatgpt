"use client";

import { useState, useEffect, useRef } from 'react';
import { callGroqApi } from '@/utils/groqApi';

export default function StartupChatbot({ onComplete }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasEnoughInfo, setHasEnoughInfo] = useState(false);
  const messagesEndRef = useRef(null);

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
        setIsComplete(true);
        onComplete(description);
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

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Startup Interview</h2>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">How this works:</span>
            <br />
            1. I'll ask you questions about your startup
            <br />
            2. Share as much detail as you'd like
            <br />
            3. When you feel you've covered everything, type 'end'
            <br />
            4. I'll create a comprehensive summary for analysis
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'system'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-800'
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
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isComplete ? "Interview complete!" : "Type your answer..."}
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={isComplete || isLoading}
        />
        <button
          type="submit"
          disabled={isComplete || isLoading || !inputMessage.trim()}
          className={`px-4 py-2 rounded-lg font-medium ${
            isComplete || isLoading || !inputMessage.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  );
} 