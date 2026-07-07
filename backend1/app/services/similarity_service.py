import math


def cosine_similarity(vector1: list, vector2: list) -> float:
    """
    Calculate cosine similarity between two vectors.
    """

    # Dot Product
    dot_product = sum(a * b for a, b in zip(vector1, vector2))

    # Magnitude of Vector 1
    magnitude1 = math.sqrt(sum(a * a for a in vector1))

    # Magnitude of Vector 2
    magnitude2 = math.sqrt(sum(b * b for b in vector2))

    # Avoid division by zero
    if magnitude1 == 0 or magnitude2 == 0:
        return 0

    return dot_product / (magnitude1 * magnitude2)