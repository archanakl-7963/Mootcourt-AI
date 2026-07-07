import requests
from google import genai
from app.config import settings


def generate_embedding(text: str):
    provider = settings.llm_provider
    if provider == "gemini" and not settings.gemini_api_key:
        provider = "ollama"

    if provider == "gemini":
        try:
            client = genai.Client(api_key=settings.gemini_api_key)
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=text,
            )
            return response.embeddings[0].values
        except Exception as e:
            print("\n===== GEMINI EMBEDDING ERROR, FALLING BACK TO OLLAMA =====")
            print(e)
            provider = "ollama"

    if provider == "ollama":
        try:
            res = requests.post(
                f"{settings.ollama_url}/api/embeddings",
                json={
                    "model": settings.ollama_embedding_model,
                    "prompt": text
                },
                timeout=15
            )
            res.raise_for_status()
            return res.json()["embedding"]

        except Exception as e:
            print("\n===== OLLAMA EMBEDDING ERROR =====")
            print(e)
            raise