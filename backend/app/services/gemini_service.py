import requests
from google import genai
from app.config import settings
from app.prompts.system_prompt import SYSTEM_PROMPT

from app.memory.conversation_memory import (
    add_message,
    get_history,
)

from app.services.retrieval_service import retrieve_relevant_context

from app.logger import logger


def generate_response(prompt: str, user_id: str) -> str:
    try:
        # Save user message
        add_message("user", prompt)

        # Get conversation history
        history = get_history()

        # Retrieve only the relevant part of the uploaded document
        relevant_context = retrieve_relevant_context(prompt, user_id)

        # Build prompt
        system_prompt = SYSTEM_PROMPT
        if relevant_context:
            system_prompt += f"\n\nRelevant Document Context:\n\n{relevant_context}"

        # Determine provider
        provider = settings.llm_provider
        if provider == "gemini" and not settings.gemini_api_key:
            provider = "ollama"

        if provider == "gemini":
            client = genai.Client(api_key=settings.gemini_api_key)
            conversation = ""
            for message in history:
                conversation += (
                    f"{message['role'].capitalize()}: "
                    f"{message['content']}\n\n"
                )

            full_prompt = f"{system_prompt}\n\nConversation History:\n\n{conversation}User:\n{prompt}\n\nAssistant:\n"
            
            logger.info("Sending prompt to Gemini...")
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
            )
            reply = response.text
            add_message("assistant", reply)
            logger.info("Gemini response generated successfully.")
            return reply

        else:
            ollama_messages = [{"role": "system", "content": system_prompt}]
            for message in history[:-1]:
                ollama_messages.append({
                    "role": "assistant" if message["role"] == "assistant" else "user",
                    "content": message["content"]
                })
            ollama_messages.append({"role": "user", "content": prompt})

            logger.info("Sending chat request to Ollama...")

            res = requests.post(
                f"{settings.ollama_url}/api/chat",
                json={
                    "model": settings.ollama_model,
                    "messages": ollama_messages,
                    "stream": False
                },
                timeout=45
            )
            res.raise_for_status()
            reply = res.json()["message"]["content"]

            # Save assistant reply
            add_message("assistant", reply)

            logger.info("Ollama response generated successfully.")

            return reply

    except Exception as e:
        logger.exception(f"Error generating response: {e}")
        return "An error occurred while generating a response."