from flask import Flask, render_template, request, jsonify, Response
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from agency import agency
import os
import signal
import psutil
import logging
import tempfile
from dotenv import load_dotenv
from deepgram import DeepgramClient, SpeakOptions
import base64
import time
import asyncio
from functools import partial

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Deepgram client
deepgram = DeepgramClient(os.getenv("DEEPGRAM_API_KEY"))

# Initialize SocketIO with async mode
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='eventlet',  # Use eventlet for async support
    logger=True,
    engineio_logger=True
)

# Agent voice mapping
AGENT_VOICES = {
    'MarketInsightCEO': 'aura-orpheus-en',
    'CompetitorTrackingAgent': 'aura-asteria-en',
    'SentimentAnalysisAgent': 'aura-athena-en',
    'ICPGeneratorAgent': 'aura-hera-en',
    'FeedbackCollectorAgent': 'aura-zeus-en',
    'MarketAnalysisAgent': 'aura-apollo-en',
    'ReportingAgent': 'aura-artemis-en'
}

def generate_speech(text, voice_model):
    """Generate speech using Deepgram"""
    try:
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
        options = SpeakOptions(
            model=voice_model
        )
        
        speak_text = {"text": text}
        response = deepgram.speak.rest.v("1").save(temp_file.name, speak_text, options)
        
        with open(temp_file.name, 'rb') as audio_file:
            audio_data = base64.b64encode(audio_file.read()).decode('utf-8')
        
        os.unlink(temp_file.name)
        return audio_data
        
    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        return None

def run_async(coro):
    """Helper function to run coroutines in the event loop"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    emit('agent_list', [
        {
            'name': 'MarketInsightCEO',
            'icon': '👨‍💼',
            'voice': 'aura-orpheus-en',
            'description': 'Strategic planning and market insight coordination'
        },
        {
            'name': 'CompetitorTrackingAgent',
            'icon': '🔍',
            'voice': 'aura-asteria-en',
            'description': 'Monitors and analyzes competitor activities'
        },
        {
            'name': 'SentimentAnalysisAgent',
            'icon': '😊',
            'voice': 'aura-athena-en',
            'description': 'Analyzes market sentiment and trends'
        },
        {
            'name': 'ICPGeneratorAgent',
            'icon': '👥',
            'voice': 'aura-hera-en',
            'description': 'Generates Ideal Customer Profiles'
        },
        {
            'name': 'FeedbackCollectorAgent',
            'icon': '📝',
            'voice': 'aura-zeus-en',
            'description': 'Collects and processes market feedback'
        },
        {
            'name': 'MarketAnalysisAgent',
            'icon': '📊',
            'voice': 'aura-apollo-en',
            'description': 'Performs detailed market analysis'
        },
        {
            'name': 'ReportingAgent',
            'icon': '📈',
            'voice': 'aura-artemis-en',
            'description': 'Generates comprehensive market reports'
        }
    ])
    emit('connection_response', {'data': 'Connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('send_message')
def handle_message(data):
    message = data.get('message')
    agent_name = data.get('agent')
    
    if not message or not agent_name:
        emit('receive_message', {
            'type': 'error',
            'agent': 'System',
            'content': 'Message and agent name are required'
        })
        return

    # Emit user message
    emit('receive_message', {
        'type': 'message',
        'agent': 'User',
        'content': message
    })

    try:
        # Get the specific agent
        target_agent = None
        for agent in agency.agents:
            if agent.name == agent_name:
                target_agent = agent
                break

        if not target_agent:
            raise ValueError(f"Agent {agent_name} not found")

        # Run the agent's process_message method
        async def process_message():
            response = await target_agent.process_message(message)
            return response

        # Run the async function
        response = run_async(process_message())

        # Process the response
        if isinstance(response, str):
            response_data = {
                'type': 'message',
                'agent': agent_name,
                'content': response
            }
        else:
            response_data = response

        # Generate speech if needed
        if response_data.get('type') == 'message':
            voice_model = AGENT_VOICES.get(agent_name, 'aura-asteria-en')
            audio_data = generate_speech(response_data['content'], voice_model)
            if audio_data:
                response_data['audio'] = audio_data

        # Emit the response
        emit('receive_message', response_data)

    except Exception as e:
        logger.error(f"Error processing message: {e}", exc_info=True)
        emit('receive_message', {
            'type': 'error',
            'agent': 'System',
            'content': f"Error: {str(e)}"
        })

if __name__ == '__main__':
    try:
        port = 5002
        kill_process_on_port(port)
        
        logger.info(f"Server running on http://localhost:{port}")
        socketio.run(
            app,
            host='0.0.0.0',
            port=port,
            debug=True,
            allow_unsafe_werkzeug=True
        )
                    
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        try:
            port = 5003
            logger.info(f"Trying alternative port {port}...")
            socketio.run(
                app,
                host='0.0.0.0',
                port=port,
                debug=True,
                allow_unsafe_werkzeug=True
            )
        except Exception as e:
            logger.error(f"Error starting server on alternative port: {e}") 