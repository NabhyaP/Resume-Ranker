# Resume Ranker 🚀

Resume Ranker is an AI-powered tool designed to automate the process of matching candidate resumes against job descriptions (JD). It uses Natural Language Processing (NLP) and Semantic Similarity to provide a comprehensive match score, highlighting matched skills and identifying missing ones.

## ✨ Features

- **Multi-Format Support**: Parse resumes and job descriptions from PDF, DOCX, and plain text files.
- **Semantic Matching**: Uses `sentence-transformers` for deep contextual similarity between resumes and job requirements.
- **Skill Extraction**: Automatically extracts and compares skills, providing a detailed breakdown of matched and missing competencies.
- **Section-Specific Scoring**: Individually analyzes **Experience**, **Education**, and **Skills** sections for a nuanced evaluation.
- **Weighted Ranking**: Computes an overall "Final Score" based on configurable weights for different sections.
- **Interactive Web UI**: A modern, responsive frontend to upload files and view results in real-time.

## 🛠️ Tech Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **NLP/ML**: [Sentence-Transformers](https://www.sbert.net/), [NLTK](https://www.nltk.org/), [RapidFuzz](https://github.com/rapidfuzz/rapidfuzz)
- **File Parsing**: `pdfplumber`, `python-docx`
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- `pip` or `conda`

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Resume_Ranker
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the FastAPI server**:
   ```bash
   python server.py
   ```
   Alternatively, use uvicorn directly:
   ```bash
   uvicorn server:app --reload
   ```

2. **Access the Web Interface**:
   Open your browser and navigate to `http://127.0.0.1:8000`.

## 📂 Project Structure

```text
Resume_Ranker/
├── data/               # Sample resumes and JDs for testing
├── frontend/           # Web interface (HTML, CSS, JS)
├── src/                # Core logic modules
│   ├── file_parser.py     # Logic for reading PDF/DOCX
│   ├── skill_extractor.py # NLP logic for skill matching
│   ├── scoring.py         # Similarity and weighted score calculation
│   ├── section_splitter.py# Intelligent text segmentation
│   └── config.py          # Configuration and weights
├── main.py             # CLI entry point for local testing
├── server.py           # FastAPI server and API endpoints
└── requirements.txt    # Project dependencies
```

## 🧠 How It Works

1. **Text Normalization**: Cleans and prepares the text for analysis.
2. **Segmentation**: Uses keyword-based splitting to identify sections like *Experience*, *Education*, and *Skills*.
3. **Semantic Similarity**: Compares the resume's experience section with the JD's requirements using vector embeddings.
4. **Skill Matching**: Uses fuzzy matching and keyword extraction to compare listed skills.
5. **Weighted Scoring**:
   - **Skills**: 40% (Default)
   - **Experience**: 40% (Default)
   - **Education**: 20% (Default)
   - *Weights can be adjusted in `src/config.py`.*

## 📝 License

This project is licensed under the MIT License.
