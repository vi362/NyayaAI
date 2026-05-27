import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# ==========================
# Gemini Client
# ==========================
client = genai.Client(
    api_key=os.getenv(
        "GEMINI_API_KEY"
    )
)


def generate_legal_response(
    query,
    legal_sections
):

    prompt = f"""
You are Nyaya AI,
an Indian legal assistant.

IMPORTANT RULES:

1. Answer ONLY
based on Indian law.

2. Use ONLY
provided legal context.

3. Never invent
IPC/BNS sections.

4. If exact section
is unavailable,
say:
"Specific section
requires legal review."

5. Explain in
simple language.

6. Mention:
- Legal issue identified
- Relevant laws/sections
- Rights of citizen
- Punishment (if applicable)
- FIR guidance
- Legal next steps

7. If query is about:
- Constitution →
Explain articles,
rights, duties,
constitutional meaning.

- Judiciary →
Explain courts,
appeals, PIL,
judicial system.

- Legal Process →
Explain FIR,
bail, arrest,
court procedure.

- Cyber Law →
Explain IT Act,
fraud prevention,
cyber complaint.

- Consumer Rights →
Explain complaint
process and remedies.

- Women Rights →
Explain protection laws.

User Query:
{query}

Relevant Legal Context:
{legal_sections}

Provide structured,
clear and legally
responsible response.
"""

    try:
        response = (
            client.models
            .generate_content(
                model=
                "gemini-1.5-flash",

                contents=
                prompt
            )
        )

        return (
            response.text
            if response.text
            else
            "No legal response generated."
        )

    except Exception as e:

        print(
            "Gemini Error:",
            str(e)
        )

        return (
            "Unable to generate "
            "legal response "
            "right now."
        )