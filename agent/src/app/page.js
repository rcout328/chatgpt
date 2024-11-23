"use client";

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Image from "next/image";

let socket;
const API_URL = 'http://localhost:5002';

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Initialize socket connection and fetch initial data
  useEffect(() => {
    initializeApp();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeApp = async () => {
    // Initialize socket connection
    await socketInitializer();
    
    // Fetch initial agency status
    try {
      const response = await fetch(`${API_URL}/api/status`);
      const status = await response.json();
      setIsConnected(status.initialized);
    } catch (error) {
      console.error('Error fetching agency status:', error);
    }
  };

  const socketInitializer = async () => {
    if (typeof window !== 'undefined') {
      socket = io(API_URL, {
        transports: ['websocket'],
        upgrade: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        fetchAgents(); // Fetch agents when connected
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('agent_list', (agentList) => {
        console.log('Received agent list:', agentList);
        setAgents(agentList);
      });

      socket.on('receive_message', (data) => {
        console.log('Received message:', data);
        if (data.type === 'error') {
          console.error('Error:', data.content);
        }
        setChat(prev => [...prev, data]);
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        if (!isConnected) {
          console.log('Attempting to reconnect...');
        }
      });
    }
  };

  // Fetch agents using REST API
  const fetchAgents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/agents`);
      const agentList = await response.json();
      setAgents(agentList);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Send message using both WebSocket and REST API
  const sendMessage = async (messageText, agentName) => {
    try {
      setIsLoading(true);

      // Send via WebSocket
      socket.emit('send_message', {
        message: messageText,
        agent: agentName
      });

      // Send via REST API as backup
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          agent: agentName
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error('Error from API:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChat(prev => [...prev, {
        type: 'error',
        agent: 'System',
        content: 'Failed to send message. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    console.log('Selected agent:', agent);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedAgent) {
      alert('Please select an agent first');
      return;
    }
    if (message.trim() && !isLoading) {
      console.log('Sending message:', message, 'to agent:', selectedAgent.name);
      sendMessage(message.trim(), selectedAgent.name);
      setMessage('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-geist-sans">
            Market Insight Agency
          </h1>
          <div className="text-sm text-gray-500">
            {isConnected ? 
              <span className="text-green-500">●</span> : 
              <span className="text-red-500">●</span>
            } {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </header>

        {/* Agents Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Available Agents</h2>
          <div className="flex flex-wrap gap-4">
            {agents.map((agent) => (
              <button
                key={agent.name}
                onClick={() => handleAgentSelect(agent)}
                className={`p-4 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  selectedAgent?.name === agent.name
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white hover:bg-gray-50 text-gray-800 shadow-md hover:scale-102'
                }`}
              >
                <span className="text-xl">{agent.icon}</span>
                <span className="font-medium">{agent.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="chat-container h-[400px] overflow-y-auto mb-4 space-y-4">
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`chat-message p-4 rounded-lg ${
                  msg.agent === 'User'
                    ? 'user-message bg-blue-50 text-gray-800'
                    : msg.type === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'agent-message bg-gray-50 text-gray-800'
                }`}
              >
                <div className="font-medium mb-1">{msg.agent}</div>
                <div className="text-gray-700">{msg.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={!isConnected || isLoading}
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!isConnected || isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isConnected && !isLoading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
