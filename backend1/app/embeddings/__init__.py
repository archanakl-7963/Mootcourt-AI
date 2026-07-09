from google import genai
from app.config import settings

client = None

def get_gemini_client():
    global client
    if not client and settings.gemini_api_key:
        try:
            client = genai.Client(api_key=settings.gemini_api_key)
        except Exception as e:
            print("Failed to initialize Gemini Client:", e)
    return client

def generate_embedding(text: str):
    """
    Generate an embedding vector for a piece of text.
    """
    c = get_gemini_client()
    if not c:
        print("WARNING: GEMINI_API_KEY is not set or invalid. Returning fallback embedding vector.")
        return [0.0] * 768

    response = c.models.embed_content(
        model="text-embedding-004",
        contents=text,
    )

    return response.embeddings[0].values