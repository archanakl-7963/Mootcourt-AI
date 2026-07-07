import uuid
from fastapi import APIRouter, UploadFile, File, Header, HTTPException, Form
from app.services.pdf_service import extract_text
from app.memory.document_memory import save_document
from app.embeddings.embedding_service import generate_embedding
from app.vectorstore.vector_store import add_document
from app.database import add_document_record, list_documents
from app.logger import logger

router = APIRouter()

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        file.file.seek(0)
        text = extract_text(file.file)

        if not text.strip():
            return {
                "success": False,
                "message": "The uploaded PDF does not contain any readable text."
            }

        # Split the PDF into chunks
        chunks = text.split("\n\n")

        # Generate an embedding for each chunk and tag with user_id
        for chunk in chunks:
            if chunk.strip():
                embedding = generate_embedding(chunk)
                add_document(chunk, embedding, user_id)

        # Save to SQLite database
        doc_id = str(uuid.uuid4().hex)
        add_document_record(doc_id, user_id, file.filename, text)

        # Save to local session backup
        save_document(text)

        return {
            "success": True,
            "message": "PDF uploaded successfully.",
            "data": {
                "characters": len(text),
                "chunks": len(chunks)
            }
        }
    except Exception as e:
        logger.exception("Failed to process PDF upload")
        return {
            "success": False,
            "message": f"Failed to process PDF: {str(e)}"
        }

@router.get("/documents")
def get_documents(x_user_id: str = Header(...)):
    try:
        docs = list_documents(x_user_id)
        formatted_docs = []
        for d in docs:
            # Simple conversion of characters to size representation
            size_kb = len(d.get("text_content", "")) / 1024 if "text_content" in d else (d.get("size_chars", 0) / 1024)
            formatted_docs.append({
                "name": d["filename"],
                "size": f"{size_kb:.2f} MB" if size_kb > 1024 else f"{size_kb:.1f} KB",
                "characters": d.get("size_chars", len(d.get("text_content", ""))),
                "chunks": 0,  # calculated client side or not critical
                "date": d["created_at"][:10] if "created_at" in d else ""
            })
        return {
            "success": True,
            "documents": formatted_docs
        }
    except Exception as e:
        logger.exception("Failed to list user documents")
        raise HTTPException(status_code=500, detail=str(e))