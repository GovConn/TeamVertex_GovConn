import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# BACKEND_URL API Configuration
BACKEND_URL  = os.getenv("BACKEND_URL")

# ChromaDB Configuration
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_data")

# LLM Configuration
MODELS = ['text-embedding-3-small', 'gpt-3.5-turbo', 'gpt-4o-mini']
TEMPERATURE = 0.1