"use client";

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Image from "next/image";

let socket;

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [agents, setAgents] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketInitializer();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const socketInitializer = async () => {
    // Ensure we're in client-side code
    if (typeof window !== 'undefined') {
      socket = io('http://localhost:5002', {
        transports: ['websocket'],
        upgrade: false
      });

      socket.on('connect', () => {
        console.log('Connected to server');
      });

      socket.on('agent_list', (agentList) => {
        setAgents(agentList);
      });

      socket.on('receive_message', (data) => {
        setChat(prev => [...prev, data]);
        if (data.audio) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
          audio.play();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
  };

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedAgent) {
      alert('Please select an agent first');
      return;
    }
    if (message.trim()) {
      socket.emit('send_message', {
        message: message,
        agent: selectedAgent.name
      });
      setMessage('');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Market Insight Agency</h1>
        
        {/* Agents Selection */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4">Available Agents</h2>
          <div className="flex flex-wrap gap-4">
            {agents.map((agent) => (
              <button
                key={agent.name}
                onClick={() => handleAgentSelect(agent)}
                className={`p-4 rounded-lg flex items-center gap-2 ${
                  selectedAgent?.name === agent.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                <span>{agent.icon}</span>
                <span>{agent.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="chat-container h-[400px] overflow-y-auto mb-4">
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`chat-message mb-4 p-3 rounded-lg ${
                  msg.agent === 'User'
                    ? 'user-message'
                    : 'agent-message'
                }`}
              >
                <strong>{msg.agent}:</strong> {msg.content}
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
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
