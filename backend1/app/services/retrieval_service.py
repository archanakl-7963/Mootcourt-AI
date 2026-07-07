import numpy as np

from app.embeddings.embedding_service import generate_embedding
from app.vectorstore.vector_store import get_index, get_document


def retrieve_relevant_context(question: str, user_id: str):
    """
    Retrieve the top 3 most relevant document chunks for this user using FAISS.
    """

    index = get_index()

    if index is None:
        return ""

    # Generate embedding for the question
    question_embedding = generate_embedding(question)

    # Convert to NumPy array
    question_vector = np.array(
        [question_embedding],
        dtype="float32"
    )

    # Search FAISS for a larger candidate list to filter by user ownership
    search_k = min(50, index.ntotal)
    if search_k <= 0:
        return ""

    distances, indices = index.search(question_vector, search_k)

    retrieved_chunks = []

    for idx in indices[0]:
        if idx != -1:
            doc = get_document(idx)
            if doc and doc.get("user_id") == user_id:
                retrieved_chunks.append(doc["text"])
                if len(retrieved_chunks) >= 3:
                    break

    return "\n\n".join(retrieved_chunks)