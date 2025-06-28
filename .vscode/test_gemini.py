import google.generativeai as genai

genai.configure(api_key="YOUR_REAL_GEMINI_KEY")
model = genai.GenerativeModel("gemini-1.5-pro")

try:
    response = model.generate_content("Tell me your restaurant opening hours.")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")