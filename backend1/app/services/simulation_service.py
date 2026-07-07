import json
import requests
from google import genai
from google.genai.errors import ServerError
from app.config import settings
from app.database import get_session, get_session_messages
from app.services.retrieval_service import retrieve_relevant_context
from app.logger import logger

def get_llm_client():
    if settings.gemini_api_key:
        return genai.Client(api_key=settings.gemini_api_key)
    return None

def get_system_prompt(mode: str, side: str, dispute: str, judge_personality: str = None) -> str:
    if mode == "judge":
        judge_descriptions = {
            "chandrachud": "Justice D.Y. Chandrachud (Progressive Intellectual). Former Chief Justice of India. Focuses on constitutional morality, privacy, gender justice, and fundamental rights. He expects arguments on core principles, liberal interpretations, and references to global jurisprudence.",
            "krishnaiyer": "Justice V.R. Krishna Iyer (Judicial Activist & Humanist). Known for judicial activism, human rights focus, and converting courts into courts for the common man. Speaks in rich, heavy, poetic English prose and values substantive justice over procedural technicalities.",
            "bhagwati": "Justice P.N. Bhagwati (Pioneer of Public Interest Litigation - PIL). He relaxes procedural constraints to secure basic human rights. Focuses heavily on Article 21 (Right to Life and Personal Liberty) and socio-economic justice."
        }
        judge_desc = judge_descriptions.get(judge_personality, "Justice D.Y. Chandrachud")
        
        return f"""You are acting as an AI Moot Court Judge in an Indian Moot Court session.
Your specific judicial personality is: {judge_desc}.
The student is arguing as the {side.upper()} in this dispute.
The legal dispute is described as:
"{dispute}"

You are presiding under the jurisdiction of the Supreme Court of India or a state High Court.
Address the student as "Counsel" or "Learned Counsel".
Use Indian legal terminology (e.g., "my learned friend", "writ petition under Article 32/226", "Special Leave Petition (SLP)", "constitutional morality", "AIR/SCC citations").
When the student argues their case, respond with hard questions that challenge their reasoning.
Demand reference to Indian precedents (e.g., Kesavananda Bharati, Maneka Gandhi, K.S. Puttaswamy, Lalita Kumari, MC Mehta) and Indian statutes (Constitution of India, 1950, Indian Contract Act 1872, IPC/BNS, CPC, etc.).
Never agree with the student — always push back. Be firm, highly intellectual, and polite but strict.
Keep your responses under 150 words. Be concise and sharp.
"""
    else:
        opposing_side = "RESPONDENT" if side.lower() == "petitioner" else "PETITIONER"
        return f"""You are the opposing advocate ({opposing_side}) in an Indian Moot Court.
The student is arguing as the {side.upper()} side. You argue the {opposing_side} side forcefully.
The legal dispute is described as:
"{dispute}"

Use Indian court terms (address them as "Learned Counsel" or "My Learned Friend").
Rebut every point the student makes. Use legal reasoning and cite Indian legal principles, statutory sections (like Indian Contract Act, Constitution of India, BNS, etc.), or precedents that support your side and challenge theirs.
Be aggressive, tough, and persistent, but remain professional, polite, and respectful.
Keep your responses under 150 words. Be concise and sharp.
"""

def call_llm(system_prompt: str, history: list, user_message: str) -> str:
    """Helper to query Gemini or fall back to Ollama based on configuration/keys."""
    provider = settings.llm_provider
    if not settings.gemini_api_key:
        provider = "ollama"
        
    if provider == "gemini":
        try:
            client = get_llm_client()
            # Compile messages
            conversation = ""
            for msg in history:
                role = msg["role"]
                content = msg["content"]
                conversation += f"{role.capitalize()}: {content}\n\n"
                
            full_prompt = f"{system_prompt}\n\nConversation History:\n\n{conversation}User: {user_message}\n\nAssistant:"
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error, falling back to Ollama: {e}")
            provider = "ollama"
            
    if provider == "ollama":
        try:
            # Build messages for Ollama chat API
            ollama_messages = [{"role": "system", "content": system_prompt}]
            for msg in history:
                role = "assistant" if msg["role"] == "assistant" else "user"
                ollama_messages.append({"role": role, "content": msg["content"]})
            ollama_messages.append({"role": "user", "content": user_message})
            
            res = requests.post(
                f"{settings.ollama_url}/api/chat",
                json={
                    "model": settings.ollama_model,
                    "messages": ollama_messages,
                    "stream": False
                },
                timeout=30
            )
            return res.json()["message"]["content"]
        except Exception as e:
            logger.error(f"Ollama API error: {e}")
            raise Exception("LLM Generation failed: both Gemini and Ollama were unavailable.")

def generate_simulation_response(session_id: str, user_message: str) -> str:
    session = get_session(session_id)
    if not session:
        raise Exception("Session not found")
        
    history = get_session_messages(session_id)
    
    # Retrieve RAG context if applicable (passing user_id for isolation)
    user_id = session["user_id"]
    relevant_context = retrieve_relevant_context(user_message, user_id)
    
    system_prompt = get_system_prompt(
        mode=session["mode"],
        side=session["side"],
        dispute=session["dispute_description"],
        judge_personality=session["judge_personality"]
    )
    
    if relevant_context:
        system_prompt += f"\n\nUse the following relevant case document facts to help inform your arguments or questions:\n{relevant_context}"
        
    return call_llm(system_prompt, history, user_message)

def run_evaluation(session_id: str) -> dict:
    session = get_session(session_id)
    if not session:
        raise Exception("Session not found")
        
    messages = get_session_messages(session_id)
    
    # Format the transcript
    transcript = ""
    for msg in messages:
        role = "Student" if msg["role"] == "user" else "AI"
        transcript += f"{role}: {msg['content']}\n\n"
        
    scorer_prompt = f"""
You are the End-of-Session Scorer for a Moot Court trial.
Read this moot court session transcript and score the student out of 10 on:
1. Clarity of argument
2. How well they handled pushback
3. Use of legal reasoning
4. Overall persuasiveness

Give a short explanation for each score. Be encouraging but honest.

You must output your response in JSON format matching the schema below. Do not wrap it in markdown code blocks, do not include any other text besides the JSON.

JSON Schema:
{{
  "clarity": 8.0,
  "pushback": 7.5,
  "reasoning": 8.0,
  "persuasiveness": 9.0,
  "overall_score": 8.1,
  "feedback": "Write overall feedback here, detailing strengths, weaknesses, and a short explanation for each score."
}}

Here is the transcript of the moot court session:
{transcript}
"""
    
    reply = call_llm("You are a professional Moot Court Scorer.", [], scorer_prompt)
    
    # Clean up JSON formatting from LLM response
    cleaned_reply = reply.strip()
    if cleaned_reply.startswith("```json"):
        cleaned_reply = cleaned_reply[7:]
    if cleaned_reply.startswith("```"):
        cleaned_reply = cleaned_reply[3:]
    if cleaned_reply.endswith("```"):
        cleaned_reply = cleaned_reply[:-3]
    cleaned_reply = cleaned_reply.strip()
    
    try:
        score_data = json.loads(cleaned_reply)
        required = ["clarity", "pushback", "reasoning", "persuasiveness", "overall_score", "feedback"]
        for field in required:
            if field not in score_data:
                score_data[field] = 5.0 if field != "feedback" else "Unable to parse feedback."
        return score_data
    except Exception as e:
        logger.error(f"Failed to parse LLM evaluation JSON: {e}. Raw response: {reply}")
        return {
            "clarity": 6.0,
            "pushback": 6.0,
            "reasoning": 6.0,
            "persuasiveness": 6.0,
            "overall_score": 6.0,
            "feedback": f"Could not parse scorer JSON. Raw response from scorer LLM:\n\n{reply}"
        }
