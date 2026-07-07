from google import genai

from app.config import settings

client = genai.Client(api_key=settings.gemini_api_key)


def generate_embedding(text: str):
    """
    Generate an embedding vector for a piece of text.
    """

    response = client.models.embed_content(
        model="text-embedding-004",
        contents=text,
    )

    return response.embeddings[0].values