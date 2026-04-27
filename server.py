from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from main import match_resume_to_jd
from src.file_parser import extract_text_from_file

app = FastAPI(title="Resume Ranker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RankRequest(BaseModel):
    resume_text: str
    jd_text: str


class RankResponse(BaseModel):
    final_score: float
    section_scores: dict
    matched_skills: list
    missing_skills: list


class BulkRankResult(BaseModel):
    rank: int
    filename: str
    final_score: float
    section_scores: dict
    matched_skills: list
    missing_skills: list


@app.post("/api/rank-upload", response_model=RankResponse)
async def rank_upload(
    resume_file: Optional[UploadFile] = File(None),
    jd_file: Optional[UploadFile] = File(None)
):
    if resume_file and resume_file.filename:
        raw = await resume_file.read()
        resume = extract_text_from_file(resume_file.filename, raw)
    else:
        resume = ""

    if jd_file and jd_file.filename:
        raw = await jd_file.read()
        jd = extract_text_from_file(jd_file.filename, raw)
    else:
        jd = ""

    result = match_resume_to_jd(resume, jd)
    return result


@app.post("/api/rank-multiple", response_model=List[BulkRankResult])
async def rank_multiple(
    resume_files: List[UploadFile] = File(...),
    jd_file: UploadFile = File(...)
):
    jd_raw = await jd_file.read()
    jd_text = extract_text_from_file(jd_file.filename, jd_raw)

    results = []
    for res_file in resume_files:
        raw = await res_file.read()
        try:
            resume_text = extract_text_from_file(res_file.filename, raw)
        except ValueError:
            continue

        score_data = match_resume_to_jd(resume_text, jd_text)
        score_data["filename"] = res_file.filename
        results.append(score_data)

    results.sort(key=lambda x: x["final_score"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return results


app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
