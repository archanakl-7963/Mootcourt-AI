results = [
    {"text": "Article 14", "score": 0.82},
    {"text": "Article 21", "score": 0.95},
    {"text": "Article 19", "score": 0.91},
    {"text": "Article 32", "score": 0.74},
]

sorted_results = sorted(
    results,
    key=lambda item: item["score"],
    reverse=True
)

print(sorted_results)