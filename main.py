from pathlib import Path
import re

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok", "message": "MedGuide API is running"}


class UserInput(BaseModel):
    message: str


PDF_PATH = Path(__file__).with_name("low-back-pain.pdf")
CHUNK_SIZE = 1200
documents = []
document_pages = []
vectorizer = None
tfidf_matrix = None
MEDICATION_SAFETY_MESSAGE = (
    "I cannot provide a personal medication dose. "
    "Please ask a doctor or pharmacist, especially if you have other conditions "
    "or take other medicines."
)


def needs_medication_safety_response(question):
    medication_terms = (
        "paracetamol", "acetaminophen", "ibuprofen", "naproxen", "medicine",
        "medication", "drug", "tablet", "pill", "painkiller",
    )
    dose_terms = (
        "dose", "dosage", "how much", "how many", "mg", "take", "prescri",
    )
    normalized_question = question.lower()
    return any(term in normalized_question for term in medication_terms) and any(
        term in normalized_question for term in dose_terms
    )


def concise_excerpt(text, max_sentences=2, max_characters=520):
    sentences = re.split(r"(?<=[.!?])\s+", text)
    excerpt = " ".join(sentences[:max_sentences]).strip()
    if len(excerpt) > max_characters:
        excerpt = excerpt[:max_characters].rsplit(" ", 1)[0] + "..."
    return excerpt


def load_guideline():
    global documents, document_pages, vectorizer, tfidf_matrix

    if documents:
        return

    reader = PdfReader(str(PDF_PATH))

    for page_number, page in enumerate(reader.pages, start=1):
        text = " ".join((page.extract_text() or "").split())
        for start in range(0, len(text), CHUNK_SIZE):
            chunk = text[start : start + CHUNK_SIZE].strip()
            if chunk:
                documents.append(chunk)
                document_pages.append(page_number)

    if not documents:
        raise RuntimeError("No text could be extracted from the guideline PDF")

    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    tfidf_matrix = vectorizer.fit_transform(documents)


def answer_question(question):
    if needs_medication_safety_response(question):
        return {"reply": MEDICATION_SAFETY_MESSAGE, "sources": []}

    load_guideline()
    query_vector = vectorizer.transform([question])
    scores = cosine_similarity(query_vector, tfidf_matrix).ravel()
    best_index = int(scores.argmax())

    if scores[best_index] <= 0:
        return {
            "reply": "I could not find a relevant recommendation in the guideline.",
            "sources": [],
        }

    page = document_pages[best_index]
    return {
        "reply": f"Based on the clinical guideline:\n\n{concise_excerpt(documents[best_index])}",
        "sources": [f"NICE Guideline - Page {page}"],
    }


@app.post("/api/chat")
async def chat_endpoint(data: UserInput):
    question = data.message.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Please enter a question.")

    try:
        return answer_question(question)
    except (OSError, RuntimeError) as error:
        raise HTTPException(status_code=500, detail=str(error)) from error