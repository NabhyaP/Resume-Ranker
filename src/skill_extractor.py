import spacy
from sklearn.metrics.pairwise import cosine_similarity
from src.config import SKILL_MATCH_THRESHOLD

_nlp = spacy.load("en_core_web_sm")

def _get_model():
    from src.scoring import _model
    return _model


def extract_skills_from_text(text: str) -> list[str]:
    """
    Extract clean candidate phrases (noun chunks and proper nouns)
    from a block of text.
    """
    if not text.strip():
        return []

    framed_lines = []
    for line in text.split('\n'):
        line = line.strip(".,;-•* ")
        if len(line) > 1:
            framed_lines.append(f"The role involves {line}.")
    clean_text = " ".join(framed_lines)

    doc = _nlp(clean_text)

    candidates = set()
    chunk_tokens = set()

    for chunk in doc.noun_chunks:
        c_text = chunk.text.lower().strip()
        if c_text in ("the role", "role", "involves"):
            continue
        words = c_text.split()
        if 1 <= len(words) <= 4 and not all(t.is_stop for t in chunk):
            candidates.add(c_text)
            for token in chunk:
                chunk_tokens.add(token)

    for token in doc:
        if token.pos_ in ("PROPN", "NOUN") and not token.is_stop and len(token.text) > 1:
            if token not in chunk_tokens:
                t_text = token.text.lower()
                if t_text not in ("role", "involves"):
                    candidates.add(t_text)

    return list(candidates)


def compute_skill_coverage(resume_text: str, jd_skills_text: str):
    """
    Extract skills from both the JD and the Resume.
    Use sentence-transformers to compute a pairwise similarity matrix.
    A JD skill is considered matched if it is highly similar to ANY Resume skill.
    """
    jd_skills = extract_skills_from_text(jd_skills_text)
    if not jd_skills:
        return 1.0, [], []


    resume_skills = extract_skills_from_text(resume_text)

    if not resume_skills:
        return 0.0, [], jd_skills

    model = _get_model()

    jd_embs = model.encode(jd_skills, convert_to_numpy=True)
    resume_embs = model.encode(resume_skills, convert_to_numpy=True)

    sim_matrix = cosine_similarity(jd_embs, resume_embs)

    matched = []
    missing = []

    for i, jd_skill in enumerate(jd_skills):
        best_match_score = sim_matrix[i].max()
        if best_match_score >= SKILL_MATCH_THRESHOLD:
            matched.append(jd_skill.title())
        else:
            missing.append(jd_skill.title())

    coverage = len(matched) / len(jd_skills)
    return coverage, matched, missing