import re
from src.config import EDUCATION_LEVELS, DEGREE_RANKS, EDUCATION_FIELDS

def _find_highest_degree(text: str) -> str | None:
	text_lower = text.lower()
	highest_rank = 0

	for level, aliases in EDUCATION_LEVELS.items():
		for alias in aliases:
			pattern = rf'\b{re.escape(alias.lower())}\b'
			if re.search(pattern, text_lower):
				rank = DEGREE_RANKS[level]
				highest_rank = max(highest_rank, rank)
				break
	return highest_rank

def _extract_fields(text: str) -> list[str]:
	text_lower = text.lower()
	found_fields = []
	for field_key, aliases in EDUCATION_FIELDS.items():
		for alias in aliases:
			pattern = rf'\b{re.escape(alias.lower())}\b'
			if re.search(pattern, text_lower):
				found_fields.append(field_key)
				break
	return found_fields

def compute_education_score(resume_text: str, jd_text: str) -> float:
	if not jd_text.strip():
		return 1.0
	if not resume_text.strip():
		return 0.0

	score = 0.0

	jd_rank = _find_highest_degree(jd_text)
	resume_rank = _find_highest_degree(resume_text)
	if resume_rank >= jd_rank:
		score += 0.4
	elif resume_rank == jd_rank - 1:
		score += 0.2 

	jd_fields = _extract_fields(jd_text)
	resume_fields = _extract_fields(resume_text)

	if jd_fields:
		match_found = sum([f in resume_fields for f in jd_fields])/len(jd_fields)
		score += match_found*0.6
	else:
		score += 0.6

	return score
