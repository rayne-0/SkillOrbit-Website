"""
chatbot/views.py

Secure OpenAI proxy for the SkillOrbit AI Mentor.
The frontend never touches the API key — this backend view handles all OpenAI calls.
"""

import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from accounts.decorators import login_required


def _ok(data, status=200):
    return JsonResponse({"success": True, **data}, status=status)


def _err(msg, status=400):
    return JsonResponse({"success": False, "error": msg}, status=status)


def _json_body(request):
    try:
        return json.loads(request.body)
    except Exception:
        return {}


# ──────────────────────────────────────────────────
# Mock responses for when OpenAI key is placeholder
# ──────────────────────────────────────────────────
MOCK_RESPONSES = [
    "Great question! Let me explain that concept step by step. In programming, this is one of those foundational ideas that unlocks many advanced patterns. The key insight is that you need to understand the **why** before the **how**. Have you tried applying this in a small example yet?",
    "That's a really insightful observation! 🧠 Here's a hint: think about what happens when the function reaches its base case. The call stack then unwinds — each frame returning its result to the frame below it. Does that help clarify things?",
    "Excellent! Let me quiz you on this: **What would happen if you forgot to include the base case in a recursive function?** Take a moment to think — the answer is critical to understanding recursive algorithms!",
    "I see you're working through this carefully — that's exactly the right approach. Remember: **understanding > memorization**. The concept you're asking about is used constantly in real-world projects. Here's a practical example you might recognize... 💡",
    "You're making great progress! 🚀 This topic trips up a lot of learners at first. The trick is to visualize it: imagine each iteration as a step on a staircase. By the end, you'll have climbed to a completely new understanding. What part feels most unclear right now?",
]

_mock_index = 0


def get_mock_response(message: str, lesson_title: str) -> str:
    global _mock_index
    # Tailor mock based on common intents
    msg_lower = message.lower()
    if "quiz" in msg_lower or "test me" in msg_lower or "question" in msg_lower:
        return f"📝 **Quiz Time!** Here's a question about *{lesson_title}*:\n\nWhat is the most important thing to remember when applying the concepts from this lesson? Think about it carefully, then type your answer — I'll give you detailed feedback!"
    if "explain" in msg_lower or "what is" in msg_lower or "how does" in msg_lower:
        return f"Let me break down *{lesson_title}* in simple terms:\n\n1. **Core concept**: This is about building a foundational understanding\n2. **Key components**: Each piece works together to form the whole\n3. **Practical application**: You'll use this in real projects immediately\n\nWould you like me to dive deeper into any of these points? 🎯"
    if "hint" in msg_lower or "help" in msg_lower or "stuck" in msg_lower:
        return f"💡 **Hint for {lesson_title}**: Think about the simplest possible version of the problem. Start there and build up complexity gradually. Often the solution becomes obvious when you break it into smaller steps. Try it and come back if you need more help!"
    
    response = MOCK_RESPONSES[_mock_index % len(MOCK_RESPONSES)]
    _mock_index += 1
    return response


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def chat(request):
    """
    POST /api/chatbot/chat/
    Body: {
        "message": "User's question",
        "lesson_title": "Current lesson title",
        "lesson_overview": "Brief overview of the lesson",
        "history": [{"role": "user"|"assistant", "content": "..."}]
    }
    Returns: { "reply": "AI response text" }
    """
    data = _json_body(request)
    message = data.get("message", "").strip()
    lesson_title = data.get("lesson_title", "this lesson")
    lesson_overview = data.get("lesson_overview", "")
    history = data.get("history", [])

    if not message:
        return _err("message is required")

    api_key = os.environ.get("OPENAI_API_KEY", "")
    
    # Use mock responses if no real key is configured
    if not api_key or api_key.startswith("YOUR_") or api_key == "PLACEHOLDER":
        reply = get_mock_response(message, lesson_title)
        return _ok({"reply": reply, "mock": True})

    try:
        import urllib.request as urlreq
        import urllib.error

        system_prompt = (
            f"You are SkillOrbit AI Mentor — an expert, encouraging tutor teaching the lesson: '{lesson_title}'. "
            f"Lesson summary: {lesson_overview}. "
            "Your role is to:\n"
            "1. Answer student questions clearly and concisely\n"
            "2. Use analogies and examples to explain concepts\n"
            "3. Ask follow-up questions to check understanding\n"
            "4. Encourage and motivate the student\n"
            "5. When asked to quiz, create a relevant question and wait for the answer\n"
            "Keep responses focused, engaging, and under 200 words unless the student asks for deeper explanation. "
            "Use markdown formatting (bold, bullet points) for clarity."
        )

        messages = [{"role": "system", "content": system_prompt}]
        # Include last 6 messages of history to stay within context
        for h in history[-6:]:
            if h.get("role") in ("user", "assistant") and h.get("content"):
                messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        payload = json.dumps({
            "model": "gpt-4o-mini",
            "messages": messages,
            "max_tokens": 400,
            "temperature": 0.7,
        }).encode("utf-8")

        req = urlreq.Request(
            "https://api.openai.com/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )

        with urlreq.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            reply = result["choices"][0]["message"]["content"]
            return _ok({"reply": reply, "mock": False})

    except Exception as e:
        print(f"OpenAI API error: {e}")
        # Graceful fallback to mock
        reply = get_mock_response(message, lesson_title)
        return _ok({"reply": reply, "mock": True, "fallback": True})
