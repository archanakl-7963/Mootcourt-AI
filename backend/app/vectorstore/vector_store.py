import faiss
import numpy as np

# Stores chunks as dictionaries: [{"text": text, "user_id": user_id}]
document_chunks = []

# FAISS L2 distance index
index = None

def add_document(text: str, embedding: list, user_id: str):
    """
    Store the document text, its owner user_id, and its embedding in FAISS.
    """
    global index

    # Save the text and owner details
    document_chunks.append({
        "text": text,
        "user_id": user_id
    })

    # Convert embedding into a NumPy array
    embedding_array = np.array(
        [embedding],
        dtype="float32"
    )

    # Create the FAISS index only once
    if index is None:
        dimension = embedding_array.shape[1]
        index = faiss.IndexFlatL2(dimension)

    # Store the embedding inside FAISS
    index.add(embedding_array)

def get_index():
    return index

def get_document(index_number: int):
    if 0 <= index_number < len(document_chunks):
        return document_chunks[index_number]
    return None