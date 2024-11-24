"use client";

import { useState, useRef, useEffect } from 'react';
import { socket, safeEmit } from '@/config/socket';

export default function ChatDialog({ isOpen, onClose, currentPage }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load analysis data when chat opens
  useEffect(() => {
    if (isOpen) {
      // Get the analysis data based on current page
      const analysisKey = `${currentPage}_${localStorage.getItem('businessInput')}`;
      const storedAnalysis = localStorage.getItem(analysisKey);
      if (storedAnalysis) {
        setSessionData(storedAnalysis);
        // Send initial greeting with context
        sendInitialGreeting(storedAnalysis, currentPage);
      }
    } else {
      // Clear session data when chat closes
      setSessionData(null);
      setMessages([]);
      setLastUserMessage('');
    }
  }, [isOpen, currentPage]);

  const sendInitialGreeting = async (analysisData, page) => {
    try {
      await safeEmit('send_message', {
        message: `Hi, I'd like to discuss the ${page} analysis results.`,
        agent: 'MarketInsightCEO',
        analysisType: 'chat',
        context: {
          currentAnalysis: analysisData,
          analysisType: page,
          businessInput: localStorage.getItem('businessInput')
        }
      });
    } catch (error) {
      console.error('Error sending initial greeting:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log('Received chat message:', data);
      setIsLoading(false);
      
      // Handle both chat-specific and success-type messages
      if ((data.analysisType === 'chat' || data.type === 'success') && data.agent) {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: data.content,
          agent: data.agent,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(inputMessage);
    setInputMessage('');

    try {
      await safeEmit('send_message', {
        message: inputMessage,
        agent: 'MarketInsightCEO',
        analysisType: 'chat',
        context: {
          currentAnalysis: sessionData,
          analysisType: currentPage,
          businessInput: localStorage.getItem('businessInput'),
          chatHistory: messages
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Chat with Market Insight Agent</h2>
          <button
            onClick={() => {
              setSessionData(null);
              setMessages([]);
              setLastUserMessage('');
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 italic">
              Starting conversation with our Market Insight Agent...
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.role === 'system'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'agent' && (
                  <div className="text-xs text-gray-500 mb-1">
                    {message.agent}
                  </div>
                )}
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

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 py-2 rounded-lg font-medium ${
                isLoading || !inputMessage.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 