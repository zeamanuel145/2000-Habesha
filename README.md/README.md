# Habesha Restaurant Chatbot Backend

A FastAPI backend for the restaurant chatbot, integrated with Gemini AI.

## Setup:

1. Add your Gemini API Key in `.env` file:
GEMINI_API_KEY=AIzaSyAWTKrprSJID4gPJjTwNy5jQihvG4Vb88c

2. Install Python packages:
pip install -r requirements.txt

3. Run locally:
uvicorn app.main:app --reload

4. Build Docker Image:
docker build -t habesha-chatbot .

5. Run Docker container:
docker run -p 8000:8000 habesha-chatbot
