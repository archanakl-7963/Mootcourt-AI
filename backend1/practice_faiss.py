import faiss
import numpy as np

# Three sample embeddings
embeddings = np.array(
    [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ],
    dtype="float32"
)

# Each vector has 3 numbers
dimension = embeddings.shape[1]

print("Dimension:", dimension)

# Create the index
index = faiss.IndexFlatL2(dimension)

# Add vectors
index.add(embeddings)

print("Vectors stored:", index.ntotal)