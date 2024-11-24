import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002';

const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
    transports: ['polling', 'websocket'],
    withCredentials: false,
    extraHeaders: {
        'Access-Control-Allow-Origin': '*'
    }
});

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    console.log('Attempting to reconnect...');
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    if (reason === 'io server disconnect') {
        console.log('Reconnecting...');
        socket.connect();
    }
});

export { socket }; 