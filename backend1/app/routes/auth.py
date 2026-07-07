import uuid
import hashlib
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from app.database import create_user, get_user_by_username, get_db_connection
from app.logger import logger

router = APIRouter()

class UserLoginRequest(BaseModel):
    username: str
    password: str

class UserRegisterRequest(BaseModel):
    username: str
    password: str
    fullName: str = ""
    course: str = ""
    college: str = ""

def hash_password(password: str, salt: str = None) -> tuple:
    if salt is None:
        salt = os.urandom(16).hex()
    pwd_bytes = password.encode('utf-8')
    salt_bytes = salt.encode('utf-8')
    key = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000)
    return key.hex(), salt

@router.post("/auth/register")
def register(req: UserRegisterRequest):
    username = req.username.strip()
    password = req.password
    fullName = req.fullName.strip()
    course = req.course.strip()
    college = req.college.strip()
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password cannot be empty.")
        
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
        
    try:
        # Check if user already exists
        existing = get_user_by_username(username)
        if existing:
            raise HTTPException(status_code=400, detail="Username is already taken.")
            
        user_id = str(uuid.uuid4().hex)
        pwd_hash, salt = hash_password(password)
        
        # Save to database including profile metadata
        create_user(user_id, username, pwd_hash, salt, fullName, course, college)
        logger.info(f"Registered new advocate user: {username} (Name: {fullName}, Course: {course})")
        
        return {
            "success": True,
            "message": "User registered successfully."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during user registration")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/auth/login")
def login(req: UserLoginRequest):
    username = req.username.strip()
    password = req.password
    
    try:
        user = get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password.")
            
        # Verify password
        target_hash, _ = hash_password(password, user["salt"])
        if target_hash != user["password_hash"]:
            raise HTTPException(status_code=401, detail="Invalid username or password.")
            
        logger.info(f"User logged in: {username}")
        return {
            "success": True,
            "message": "Login successful.",
            "data": {
                "userId": user["id"],
                "username": user["username"],
                "fullName": user.get("full_name") or user["username"],
                "course": user.get("course") or "LLB Student",
                "college": user.get("college") or "Law School",
                "profileImage": user.get("profile_image")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during user login")
        raise HTTPException(status_code=500, detail="Login server error.")

@router.post("/auth/profile-image")
async def upload_profile_image(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        # Create static avatars directory inside backend directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        avatars_dir = os.path.join(base_dir, "app", "static", "avatars")
        os.makedirs(avatars_dir, exist_ok=True)
        
        file_ext = os.path.splitext(file.filename)[1]
        if file_ext.lower() not in [".jpg", ".jpeg", ".png"]:
            raise HTTPException(status_code=400, detail="Only JPG, JPEG, and PNG images are supported.")
            
        file_name = f"{user_id}{file_ext}"
        file_path = os.path.join(avatars_dir, file_name)
        
        # Write file content
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
            
        # Update user record in SQLite
        relative_url = f"/static/avatars/{file_name}"
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET profile_image = ? WHERE id = ?", (relative_url, user_id))
        conn.commit()
        conn.close()
        
        logger.info(f"Updated profile image for user {user_id} -> {relative_url}")
        return {
            "success": True,
            "profileImage": relative_url
        }
    except Exception as e:
        logger.exception("Failed to process profile image upload")
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
