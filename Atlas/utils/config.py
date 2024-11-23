from dotenv import load_dotenv
import os
from pathlib import Path

# Get the project root directory
ROOT_DIR = Path(__file__).parent.parent

# Load environment variables from .env file
load_dotenv(ROOT_DIR / '.env')

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4-1106-preview')
OPENAI_ORGANIZATION = os.getenv('OPENAI_ORGANIZATION')

# Agent Configuration
MAX_TOKENS = int(os.getenv('MAX_TOKENS', 4000))
TEMPERATURE = float(os.getenv('TEMPERATURE', 0.3)) 