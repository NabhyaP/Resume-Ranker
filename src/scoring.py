from src.config import WEIGHTS
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

_model = SentenceTransformer("all-MiniLM-L6-v2")


def compute_similarity(resume: str, jd: str) -> float:
    """
    Compute semantic cosine similarity between two texts using
    the all-MiniLM-L6-v2 sentence transformer model.

    Returns:
        float in [0, 1].  1.0 if text_b is empty (nothing required),
        0.0 if text_a is empty (nothing to offer).
    """
    if not jd.strip():
        return 1.0
    if not resume.strip():
        return 0.0

    embeddings = _model.encode([resume, jd], convert_to_numpy=True)
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return float(score)


def compute_weighted_score(scores: dict) -> float:
    final_score = (
        WEIGHTS["skills"] * scores["skills"] +
        WEIGHTS["experience"] * scores["experience"] +
        WEIGHTS["education"] * scores["education"] +
        WEIGHTS["overall"] * scores["overall"]
    )
    return final_score