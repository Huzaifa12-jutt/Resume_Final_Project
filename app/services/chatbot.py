"""
chatbot.py
----------
Thin wrapper around the Groq API (Llama 3.1 8B Instant) that turns the
ranked candidate list into context an HR user can ask natural-language
questions about ("Who has AWS experience?", "Compare John and Sarah").

Design notes:
    - temperature=0.5 as specified in the brief (consistent, still natural)
    - the system prompt is rebuilt every call with the *current* ranking
      results, so the chatbot always answers from the latest data, not a
      stale snapshot.
    - Chat history is passed in/out as a plain list of {role, content}
      dicts so app.py can keep it in st.session_state without this module
      needing to know anything about Streamlit.
"""

from groq import Groq

MODEL_NAME = "llama-3.1-8b-instant"


def _build_context(ranked_candidates: list, job_description: str) -> str:
    lines = [
        "You are an HR assistant helping a recruiter evaluate candidates "
        "for the following role. Provide professional, well-structured responses "
        "with clear formatting using bullet points, numbered lists, and sections.",
        f"JOB DESCRIPTION:\n{job_description}\n",
        "CANDIDATE RANKINGS (highest score first):",
    ]
    for c in ranked_candidates:
        lines.append(
            f"\n**#{c['rank']} {c['name']}** - Overall Score: {c['overall_score']}%\n"
            f"  **Email:** {c.get('email', 'N/A')}\n"
            f"  **Phone:** {c.get('phone', 'N/A')}\n"
            f"  **Skills:** {', '.join(c.get('skills', [])) or 'None'}\n"
            f"  **Matched Skills:** {', '.join(c['matched_skills']) or 'None'}\n"
            f"  **Missing Skills:** {', '.join(c['missing_skills']) or 'None'}\n"
            f"  **Education:** {c.get('education', 'N/A')}\n"
            f"  **Experience:** {c.get('experience', 'N/A')}\n"
            f"  **Certifications:** {c.get('certifications', 'N/A')}\n"
            f"  **Projects:** {c.get('projects', 'N/A')}\n"
            f"  **Score Breakdown:** Skills: {c['breakdown']['skills']}%, "
            f"Experience: {c['breakdown']['experience']}%, "
            f"Education: {c['breakdown']['education']}%, "
            f"Certifications: {c['breakdown']['certifications']}%, "
            f"Projects: {c['breakdown']['projects']}%\n"
            f"  **Strengths:** {', '.join(c['strengths'])}\n"
            f"  **Weaknesses:** {', '.join(c['weaknesses'])}"
        )
    lines.append(
        "\n**Response Guidelines:**\n"
        "- Use markdown formatting with **bold**, *italic*, and headers\n"
        "- Organize information with bullet points and numbered lists\n"
        "- Create clear sections for different topics\n"
        "- Be specific and reference candidate names and scores\n"
        "- Provide detailed, professional analysis when asked\n"
        "- Use emojis sparingly to enhance readability (✓, ✗, 📊, etc.)\n"
        "- Structure comparisons in table-like format when appropriate\n"
        "- Give actionable insights and recommendations\n"
        "- Keep responses concise but comprehensive"
    )
    return "\n".join(lines)


def ask_chatbot(api_key: str, user_message: str, ranked_candidates: list,
                 job_description: str, chat_history: list) -> str:
    """
    api_key         : the user's Groq API key (never hardcoded/stored)
    user_message    : the new question from the recruiter
    ranked_candidates: output of ranking_engine.rank_candidates(...)
    job_description : the JD text currently in use
    chat_history    : list of {"role": "user"/"assistant", "content": str}
                       from earlier turns in this session (excludes system)
    """
    client = Groq(api_key=api_key)

    system_prompt = _build_context(ranked_candidates, job_description)
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.5,
        max_tokens=600,
    )
    return response.choices[0].message.content


QUICK_QUESTIONS = [
    "Who is the best candidate for this role and why?",
    "Compare the top 2 candidates side by side.",
    "Which candidates are missing critical required skills?",
    "Who has the strongest hands-on project experience?",
]
