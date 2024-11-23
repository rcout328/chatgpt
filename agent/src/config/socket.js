import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002';

// Message queue to store pending messages during disconnection
let messageQueue = [];
let responseCallbacks = new Map();

// Create socket connection with more resilient settings
const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000, // Increased timeout
    transports: ['polling', 'websocket'],
    withCredentials: false,
    extraHeaders: {
        'Access-Control-Allow-Origin': '*'
    }
});

let isConnected = false;

// Add connection event listeners with better error handling
socket.on('connect', () => {
    console.log('Connected to server');
    isConnected = true;
    
    // Resend any pending messages
    while (messageQueue.length > 0) {
        const { eventName, data, callback } = messageQueue.shift();
        socket.emit(eventName, data, callback);
    }
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    isConnected = false;
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    isConnected = false;
    
    // Attempt to reconnect if disconnected
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
    isConnected = false;
});

// Helper function to safely emit events with retry mechanism
const safeEmit = (eventName, data, timeout = 60000) => {
    return new Promise((resolve, reject) => {
        const tryEmit = (retryCount = 0) => {
            if (retryCount >= 3) {
                reject(new Error('Max retry attempts reached'));
                return;
            }

            if (!isConnected) {
                console.warn('Socket not connected. Queueing message...');
                messageQueue.push({
                    eventName,
                    data,
                    callback: (response) => resolve(response)
                });
                socket.connect();
                return;
            }

            const messageId = Date.now().toString();
            const timer = setTimeout(() => {
                responseCallbacks.delete(messageId);
                tryEmit(retryCount + 1);
            }, timeout);

            responseCallbacks.set(messageId, (response) => {
                clearTimeout(timer);
                responseCallbacks.delete(messageId);
                resolve(response);
            });

            socket.emit(eventName, { ...data, messageId });
        };

        tryEmit();
    });
};

// Add listener for responses
socket.on('receive_message', (response) => {
    const callback = responseCallbacks.get(response.messageId);
    if (callback) {
        callback(response);
    }
});

// Helper to check connection status
const checkConnection = () => isConnected;

// Helper to clear message queue
const clearMessageQueue = () => {
    messageQueue = [];
    responseCallbacks.clear();
};

export { socket, safeEmit, checkConnection, clearMessageQueue }; 