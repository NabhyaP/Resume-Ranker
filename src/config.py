SECTION_HEADERS = {
    "skills": [
        "skill",
        "technical skill",
        "core competencie",
        "technology"
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment history"
    ],
    "education": [
        "education",
        "academic background",
        "qualification"
    ],
    "projects": [
        "project",
        "academic project",
        "personal project"
    ]
}

WEIGHTS = {
    "skills": 0.4,
    "experience": 0.3,
    "education": 0.15,
    "overall": 0.15,
}

SKILL_MATCH_THRESHOLD = 0.70

EDUCATION_LEVELS = {
    "phd": ["phd", "ph.d", "doctorate", "doctor of philosophy"],
    "master": ["master", "m.s", "m.sc", "m.tech", "m.e", "m.a", "m.b.a", "mba"],
    "bachelor": ["bachelor", "b.s", "b.sc", "b.tech", "b.e", "b.a", "bba", "undergraduate"],
    "associate": ["associate", "a.s", "a.a"]
}

DEGREE_RANKS = {
    "phd": 4,
    "master": 3,
    "bachelor": 2,
    "associate": 1
}

EDUCATION_FIELDS = {
    "computer_science": ["computer science", "cs", "computer engineering", "software engineering", "information technology", "it"],
    "data_science": ["data science", "machine learning", "artificial intelligence", "ai", "data analytics"],
    "electrical_engineering": ["electrical engineering", "ee", "electronics", "ece"]
}