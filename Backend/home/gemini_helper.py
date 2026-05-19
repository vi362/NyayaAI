import os
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv
from decouple import config

#load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

genai.configure(
    api_key=os.getenv(
        "API_KEY"
    )
)

model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def generate_legal_response(
    query,
    legal_sections
):

    prompt = f"""
You are Nyaya AI.

You are an Indian legal assistant.

STRICT RULES:
1. Use ONLY the legal information provided.
2. Never invent IPC/BNS sections.
3. Explain in simple language.
4. Help common citizens,
   police and lawyers.
5. Mention:
   - Crime identified
   - Relevant sections
   - Punishment
   - Citizen rights
   - Police responsibilities
   - Evidence required
   - FIR guidance
   - Next legal steps

User Query:
{query}

Trusted Legal Information:
{legal_sections}
"""

    response = model.generate_content(
        prompt
    )

    return response.text