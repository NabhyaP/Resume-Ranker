from src.section_splitter import split_sections
from src.scoring import compute_similarity, compute_weighted_score
from src.skill_extractor import compute_skill_coverage
from src.education_extractor import compute_education_score
from src.utils import normalize_text

def match_resume_to_jd(resume_text, jd_text):
    resume_text = normalize_text(resume_text)
    jd_text = normalize_text(jd_text)

    resume_sections = split_sections(resume_text)
    jd_sections = split_sections(jd_text)
    

    coverage, matched, missing = compute_skill_coverage(
        resume_text,
        jd_sections["skills"].replace(',', '\n')
    )
    scores = {
        "skills": coverage,
        "experience": compute_similarity(
            resume_sections["experience"],
            jd_sections["experience"]
        ),
        "education": compute_education_score(
            resume_sections["education"],
            jd_sections["education"]
        ),
        "overall": compute_similarity(resume_text, jd_text)
    }

    final_score = compute_weighted_score(scores)

    return {
        "final_score": round(final_score * 100, 2),
        "section_scores": {k: round(v * 100, 2) for k, v in scores.items()},
        "matched_skills": matched,
        "missing_skills": missing
    }


if __name__ == "__main__":

    with open("./data/resume.txt", "r", encoding="utf-8") as f:
        resume_text = f.read()

    with open("./data/jd.txt", "r", encoding="utf-8") as f:
        jd_text = f.read()

    result = match_resume_to_jd(resume_text, jd_text)

    print("\n--- MATCH RESULTS ---")
    for key, value in result.items():
        print(f"{key}: {value}")