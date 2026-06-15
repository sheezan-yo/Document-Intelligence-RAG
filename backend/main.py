import os
import json
import fitz
import shutil


from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pdf2image import convert_from_path
from pydantic import BaseModel
from pydantic import Field
from pathlib import Path

import parser as parserMod
import classifier as classifyMod
import rag as ragMod
import status as statusMod

print("MAIN STARTED")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
BASE_DIR = os.path.abspath("page_images")
DOC_FILE = "documents.json"

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=2000
    )
    history: list[Message] = []
    
ALLOWED_EXTENSIONS = [
    ".pdf", ".txt", ".png", ".jpg", ".jpeg"
]
MAX_FILE_SIZE = 15 * 1024 * 1024
    
def allowed_file(filename):
    extensions = os.path.splitext(filename)[1].lower()
    
    return extensions in ALLOWED_EXTENSIONS

def load_documents():
    if not os.path.exists(DOC_FILE):
        return []
    
    with open(DOC_FILE, "r") as f:
        return json.load(f)

def save_documents(documents):
    with open(DOC_FILE, "w") as f:
        json.dump(documents, f, indent=2)
        
def process_document(filepath: str, filename: str):
    if filename.endswith(".pdf"):
        pages = parserMod.parse_pdf(filepath)
    elif filename.endswith((".jpg", ".jpeg", ".png")):
        pages = parserMod.parse_image(filepath)
    elif filename.endswith(".txt"):
        pages = parserMod.parse_text(filepath)
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

    if not any(page["text"].strip() for page in pages):
        raise HTTPException(
            status_code=400,
            detail="No readable text found in document"
        )

    parserMod.save_parsed_document(filename, pages)

    full_text = "\n".join(
        page["text"] for page in pages
    )

    classification = classifyMod.clasify_document(
        full_text,
        filename
    )

    ragMod.add_document(
        pages,
        filename
    )

    statusMod.status_by_file[filename] = "Completed"

    documents = load_documents()

    documents.append({
        "filename": filename,
        "pages": len(pages),
        "classification": classification
    })

    save_documents(documents)

    return {
        "filename": filename,
        "pages": len(pages),
        "classification": classification
    }

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.post("/upload")
async def Upload_file(file: UploadFile = File(...)):
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="File type not allowed"
        )
        
    contents = await file.read()
    
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large"
        )
    
    with open(filepath, "wb") as f:
        f.write(contents)
        
    return process_document(
        filepath, file.filename
    )
    
@app.get("/search")
def search_doc(q: str):
    return ragMod.search(q)

@app.post("/chat")
def chat(request: ChatRequest):
    conversation_context = ""
    
    print(request.history)
    
    for msg in request.history:
        conversation_context += (
            f"{msg.role}: {msg.content}\n"
        )
        
    return ragMod.generate_answer(
        request.question,
        conversation_context
    )
    
@app.get("/image")
def get_image(path: str):
    requested = os.path.abspath(path)
    
    if not requested.startswith(
        BASE_DIR
    ):
        raise HTTPException(
            status_code=403,
            detail="Forbidden"
        )
    return FileResponse(requested)

@app.get("/tables/{filename}")
def get_tables(filename: str):
    path = (f"storage/parsed_docs/{filename}.json")
    
    if not os.path.exists(path):
        return []
    
    with open(path, "r", encoding="utf-8") as f:
        pages = json.load(f)
        
    table_pages = []
    
    for page in pages:
        if page["tables"]:
            table_pages.append({
                "page": page["page"],
                "tables": page["tables"]
            })
        
    return table_pages

@app.get("/status/{filename}")
def get_status(filename: str):
    return {
        "filename": filename,
        "status": statusMod.status_by_file.get(
            filename, "Unknown"
        )
    }
    
@app.get("/documents")
def get_documents():
    return load_documents()
    
@app.delete("/documents/{filename}")
def delete_document(filename: str):
    documents = load_documents()
    
    documents = [
        doc
        for doc in documents
        if doc["filename"] != filename
    ]
    
    save_documents(documents)
    
    results = ragMod.collection.get(
        where={"document":filename}
    )
    
    ragMod.collection.delete(
        ids=results["ids"]
    )
    
    Upload_file = Path("uploads") / filename
    
    if Upload_file.exists():
        Upload_file.unlink()
        
    parsed_file = (
        Path("storage/parsed_docs")
        / f"{Path(filename)}.json"
    )
    if parsed_file.exists():
        parsed_file.unlink()
        
    page_image_filename = Path(filename).stem
    page_image = Path("page_image") / page_image_filename
    if page_image.exists():
        page_image.unlink()
    
    for metadata in results["metadatas"]:
        image_path = metadata["image_page"]
        
        if os.path.exists(image_path):
            os.remove(image_path)
    
    return {"message":"deleted"}