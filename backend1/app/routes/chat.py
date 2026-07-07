from fastapi import APIRouter, HTTPException, Header

from app.schemas.chat_schema import ChatRequest
from app.services.chat_service import get_bot_response
from app.logger import logger

router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest, x_user_id: str = Header(...)):

    logger.info("User message: %s", request.message)

    # Check if the message is empty
    if not request.message.strip():
        logger.warning("Empty message received.")

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    try:
        response = get_bot_response(request.message, x_user_id)

        logger.info("AI response generated successfully.")

        return {
            "success": True,
            "message": "Response generated successfully.",
            "data": {
                "reply": response
            }
        }

    except Exception as e:

        logger.exception("Error while generating response: %s", str(e))

        raise HTTPException(
            status_code=500,
            detail="Unable to generate AI response."
        )