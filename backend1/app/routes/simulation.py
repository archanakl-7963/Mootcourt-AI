import uuid
from fastapi import APIRouter, HTTPException, Header
from app.schemas.simulation_schema import CreateSessionRequest, SendMessageRequest
from app.database import (
    create_session,
    add_session_message,
    get_session,
    get_session_messages,
    update_session_status,
    save_score,
    get_score,
    list_sessions,
    list_all_student_scores,
)
from app.services.simulation_service import generate_simulation_response, run_evaluation
from app.logger import logger

router = APIRouter()

@router.post("/sessions")
def start_session(req: CreateSessionRequest, x_user_id: str = Header(...)):
    try:
        session_id = str(uuid.uuid4().hex)
        title = req.dispute_description[:50] + "..." if len(req.dispute_description) > 50 else req.dispute_description
        
        # Determine initial message based on mode
        opposing_side = "Respondent" if req.side.lower() == "petitioner" else "Petitioner"
        if req.mode == "judge":
            judge_name = req.judge_personality.capitalize() if req.judge_personality else "Scalia"
            initial_msg = f"The Court is now in session. I am operating under the judicial profile of Justice {judge_name}. As the {req.side.upper()}, please present your oral statement. The Court will critique your claims."
        else:
            initial_msg = f"I represent the {opposing_side.upper()} in this dispute. I have reviewed your fact overview and claims as the {req.side.upper()}. You may begin your statement, Counsel."
            
        create_session(
            session_id=session_id,
            user_id=x_user_id,
            title=title,
            dispute=req.dispute_description,
            side=req.side,
            mode=req.mode,
            judge=req.judge_personality
        )
        
        # Save initial assistant message in DB
        add_session_message(session_id, "assistant", initial_msg)
        
        return {
            "success": True,
            "session_id": session_id,
            "initial_message": initial_msg
        }
    except Exception as e:
        logger.exception("Error starting simulation session")
        raise HTTPException(status_code=500, detail=f"Failed to start session: {str(e)}")

@router.get("/sessions")
def get_all_sessions(x_user_id: str = Header(...)):
    try:
        sessions = list_sessions(x_user_id)
        return {
            "success": True,
            "sessions": sessions
        }
    except Exception as e:
        logger.exception("Error listing sessions")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
def get_session_detail(session_id: str, x_user_id: str = Header(...)):
    try:
        session = get_session(session_id, x_user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        messages = get_session_messages(session_id)
        score = get_score(session_id)
        return {
            "success": True,
            "session": session,
            "messages": messages,
            "score": score
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error retrieving session details")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/message")
def send_message(session_id: str, req: SendMessageRequest, x_user_id: str = Header(...)):
    try:
        session = get_session(session_id, x_user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if session["status"] == "completed":
            raise HTTPException(status_code=400, detail="Cannot send message to a completed session")
            
        # Save user message to database
        add_session_message(session_id, "user", req.message)
        
        # Generate simulation response
        reply = generate_simulation_response(session_id, req.message)
        
        # Save assistant message to database
        add_session_message(session_id, "assistant", reply)
        
        return {
            "success": True,
            "reply": reply
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error processing message in session")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/end")
def end_session(session_id: str, x_user_id: str = Header(...)):
    try:
        session = get_session(session_id, x_user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        # Mark session as completed
        update_session_status(session_id, "completed")
        
        # Generate evaluation scorecard
        score_data = run_evaluation(session_id)
        
        # Save score to database
        save_score(
            session_id=session_id,
            clarity=score_data["clarity"],
            pushback=score_data["pushback"],
            reasoning=score_data["reasoning"],
            persuasiveness=score_data["persuasiveness"],
            overall_score=score_data["overall_score"],
            feedback=score_data["feedback"]
        )
        
        return {
            "success": True,
            "scores": score_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error ending session")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/professor/ledger")
def get_professor_ledger(x_user_id: str = Header(...)):
    try:
        scores = list_all_student_scores()
        return {
            "success": True,
            "scorecards": scores
        }
    except Exception as e:
        logger.exception("Error loading professor ledger")
        raise HTTPException(status_code=500, detail=str(e))
