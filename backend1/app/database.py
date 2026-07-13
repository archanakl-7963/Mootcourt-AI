import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mootcourt.db")

# Automatically use Hugging Face Persistent Storage if enabled in Space settings
if os.path.exists("/data") and os.access("/data", os.W_OK):
    DB_PATH = "/data/mootcourt.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database tables and handles migrations."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Simple migration: drop old tables if they don't contain the 'user_id' segregation column
    try:
        cursor.execute("SELECT user_id FROM sessions LIMIT 1")
    except sqlite3.OperationalError:
        print("Old schema detected. Migrating database to support authentication...")
        cursor.execute("DROP TABLE IF EXISTS scores")
        cursor.execute("DROP TABLE IF EXISTS messages")
        cursor.execute("DROP TABLE IF EXISTS sessions")
        cursor.execute("DROP TABLE IF EXISTS documents")
    
    # Simple migration: drop old users table if it doesn't contain profile columns
    try:
        cursor.execute("SELECT full_name FROM users LIMIT 1")
    except sqlite3.OperationalError:
        print("Migrating users table to add law student profile metadata...")
        cursor.execute("DROP TABLE IF EXISTS users")
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            full_name TEXT,
            course TEXT,
            college TEXT,
            profile_image TEXT,
            created_at TEXT NOT NULL
        )
    """)
    
    # Create sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            dispute_description TEXT NOT NULL,
            side TEXT NOT NULL,
            mode TEXT NOT NULL,
            judge_personality TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    
    # Create messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        )
    """)
    
    # Create scores table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scores (
            session_id TEXT PRIMARY KEY,
            clarity REAL NOT NULL,
            pushback REAL NOT NULL,
            reasoning REAL NOT NULL,
            persuasiveness REAL NOT NULL,
            overall_score REAL NOT NULL,
            feedback TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        )
    """)
    
    # Create documents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            text_content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()

# User CRUD Operations
def create_user(user_id: str, username: str, password_hash: str, salt: str, full_name: str = "", course: str = "", college: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO users (id, username, password_hash, salt, full_name, course, college, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, username, password_hash, salt, full_name, course, college, created_at))
    conn.commit()
    conn.close()

def get_user_by_username(username: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# Session CRUD segregated by User ID
def create_session(session_id: str, user_id: str, title: str, dispute: str, side: str, mode: str, judge: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO sessions (id, user_id, title, dispute_description, side, mode, judge_personality, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
    """, (session_id, user_id, title, dispute, side, mode, judge, created_at))
    conn.commit()
    conn.close()

def add_session_message(session_id: str, role: str, content: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO messages (session_id, role, content, created_at)
        VALUES (?, ?, ?, ?)
    """, (session_id, role, content, created_at))
    conn.commit()
    conn.close()

def get_session(session_id: str, user_id: str = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
    else:
        cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_session_messages(session_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_session_status(session_id: str, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE sessions SET status = ? WHERE id = ?", (status, session_id))
    conn.commit()
    conn.close()

def save_score(session_id: str, clarity: float, pushback: float, reasoning: float, persuasiveness: float, overall_score: float, feedback: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT OR REPLACE INTO scores (session_id, clarity, pushback, reasoning, persuasiveness, overall_score, feedback, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (session_id, clarity, pushback, reasoning, persuasiveness, overall_score, feedback, created_at))
    conn.commit()
    conn.close()

def get_score(session_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scores WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def list_sessions(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.*, sc.overall_score, sc.feedback as score_feedback
        FROM sessions s
        LEFT JOIN scores sc ON s.id = sc.session_id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

# Document CRUD segregated by User ID
def add_document_record(doc_id: str, user_id: str, filename: str, content: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO documents (id, user_id, filename, text_content, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (doc_id, user_id, filename, content, created_at))
    conn.commit()
    conn.close()

def list_documents(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, filename, created_at, LENGTH(text_content) as size_chars FROM documents WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_user_documents_count(user_id: str) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM documents WHERE user_id = ?", (user_id,))
    count = cursor.fetchone()[0]
    conn.close()
    return count

def list_all_student_scores():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT s.id as session_id, s.title as case_title, s.mode, s.side, s.judge_personality as judge,
               u.full_name as student_name, u.college, u.course,
               sc.overall_score, sc.clarity, sc.pushback, sc.reasoning, sc.persuasiveness, sc.feedback, sc.created_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        JOIN scores sc ON s.id = sc.session_id
        WHERE s.status = 'completed'
        ORDER BY sc.created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
