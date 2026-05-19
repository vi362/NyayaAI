import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env
load_dotenv()

# Get API key
API_KEY = os.getenv("GEMINI_API_KEY")

print("Loaded Key:", API_KEY[:15] if API_KEY else "No API Key")

# Configure Gemini
genai.configure(api_key=API_KEY)

# Create model
model = genai.GenerativeModel("gemini-1.5-flash")


def generate_legal_response(query, legal_sections):

    prompt = f"""
You are Nyaya AI.

You are an Indian legal assistant.

STRICT RULES:
1. Use ONLY the legal information provided.
2. Never invent IPC/BNS sections.
3. Explain in simple language.

Mention:
- Crime identified
- Relevant sections
- Punishment
- FIR guidance
- Next legal steps

User Query:
{query}

Legal Information:
{legal_sections}

Provide response in a structured format.
"""

    try:
        response = model.generate_content(prompt)
        print("Gemini Response:", response.text)
        return response.text

    except Exception as e:
        print("Gemini Error:", e)
        raise e