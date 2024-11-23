from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from agency import MarketInsightAgency, create_agency
import os
import signal
import psutil
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode=None,
    logger=True,
    engineio_logger=True
)

# Initialize agency instance with retry mechanism
def initialize_agency():
    max_retries = 3
    retry_count = 0
    while retry_count < max_retries:
        try:
            return create_agency()
        except Exception as e:
            logger.error(f"Failed to initialize agency (attempt {retry_count + 1}): {e}")
            retry_count += 1
            time.sleep(1)  # Wait before retrying
    raise Exception("Failed to initialize Market Insight Agency after multiple attempts")

try:
    agency = initialize_agency()
    logger.info("Agency initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize agency: {e}")
    agency = None

# API Routes
@app.route('/api/agents', methods=['GET'])
def get_agents():
    """Get list of available agents"""
    available_agents = [
        {
            'name': 'MarketInsightCEO',
            'icon': '👨‍💼',
            'description': 'Strategic planning and market insight coordination'
        },
        {
            'name': 'CompetitorTrackingAgent',
            'icon': '🔍',
            'description': 'Monitors and analyzes competitor activities'
        },
        {
            'name': 'SentimentAnalysisAgent',
            'icon': '😊',
            'description': 'Analyzes market sentiment and trends'
        },
        {
            'name': 'ICPGeneratorAgent',
            'icon': '👥',
            'description': 'Generates Ideal Customer Profiles'
        },
        {
            'name': 'FeedbackCollectorAgent',
            'icon': '📝',
            'description': 'Collects and processes market feedback'
        },
        {
            'name': 'MarketAnalysisAgent',
            'icon': '📊',
            'description': 'Performs detailed market analysis'
        },
        {
            'name': 'ReportingAgent',
            'icon': '📈',
            'description': 'Generates comprehensive market reports'
        }
    ]
    return jsonify(available_agents)

@app.route('/api/chat', methods=['POST'])
def chat():
    """Send a message to an agent"""
    if not request.is_json:
        return jsonify({'error': 'Content-Type must be application/json'}), 400
    
    data = request.get_json()
    message = data.get('message')
    agent_name = data.get('agent')
    
    if not message or not agent_name:
        return jsonify({'error': 'Message and agent name are required'}), 400
    
    try:
        # Process agent response
        responses = []
        for response in agency.chat(message, agent=agent_name):
            responses.append(response)
        
        return jsonify({
            'user_message': {
                'type': 'message',
                'agent': 'User',
                'content': message
            },
            'agent_responses': responses
        })
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get the status of the agency"""
    return jsonify({
        'status': 'online' if agency is not None else 'offline',
        'initialized': agency is not None
    })

# WebSocket Routes
@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    
    # Ensure agency is initialized
    global agency
    if agency is None:
        try:
            agency = initialize_agency()
            logger.info("Agency initialized on connection")
        except Exception as e:
            logger.error(f"Failed to initialize agency on connection: {e}")
            emit('error', {'message': 'Failed to initialize AI agents'})
            return

    # Send available agents with their details
    available_agents = [
        {
            'name': 'MarketInsightCEO',
            'icon': '👨‍💼',
            'description': 'Strategic planning and market insight coordination'
        },
        {
            'name': 'CompetitorTrackingAgent',
            'icon': '🔍',
            'description': 'Monitors and analyzes competitor activities'
        },
        {
            'name': 'SentimentAnalysisAgent',
            'icon': '😊',
            'description': 'Analyzes market sentiment and trends'
        },
        {
            'name': 'ICPGeneratorAgent',
            'icon': '👥',
            'description': 'Generates Ideal Customer Profiles'
        },
        {
            'name': 'FeedbackCollectorAgent',
            'icon': '📝',
            'description': 'Collects and processes market feedback'
        },
        {
            'name': 'MarketAnalysisAgent',
            'icon': '📊',
            'description': 'Performs detailed market analysis'
        },
        {
            'name': 'ReportingAgent',
            'icon': '📈',
            'description': 'Generates comprehensive market reports'
        }
    ]
    emit('agent_list', available_agents)
    emit('connection_response', {'data': 'Connected'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('send_message')
def handle_message(data):
    message = data.get('message')
    agent_name = data.get('agent')
    analysis_type = data.get('analysisType')
    
    if message:
        try:
            # First, emit user message
            emit('receive_message', {
                'type': 'message',
                'agent': 'User',
                'content': message,
                'analysisType': analysis_type,
                'timestamp': time.time()
            })
            
            # Then process agent response using the new chat method
            for response in agency.chat(message, agent=agent_name):
                # Add analysis type and timestamp to the response
                if isinstance(response, dict):
                    response['analysisType'] = analysis_type
                    if 'timestamp' not in response:
                        response['timestamp'] = time.time()
                else:
                    response = {
                        'type': 'message',
                        'content': str(response),
                        'agent': agent_name,
                        'analysisType': analysis_type,
                        'timestamp': time.time()
                    }
                
                # Emit the response
                emit('receive_message', response)
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            emit('receive_message', {
                'type': 'error',
                'agent': 'System',
                'content': f"Error: {str(e)}",
                'analysisType': analysis_type,
                'timestamp': time.time()
            })

def kill_process_on_port(port):
    for proc in psutil.process_iter(['pid', 'name', 'connections']):
        try:
            for conn in proc.connections():
                if conn.laddr.port == port:
                    os.kill(proc.pid, signal.SIGTERM)
                    logger.info(f"Killed process {proc.pid} using port {port}")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

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
