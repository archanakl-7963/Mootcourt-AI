from app.services.gemini_service import generate_response


def get_bot_response(message: str, user_id: str) -> str:
    return generate_response(message, user_id)