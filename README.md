# Document Intelligence RAG

A Retrieval-Augmented Generation (RAG) application that allows users to upload documents, ask questions in natural language, and receive context-aware answers with page-level citations and visual references.

## Features

* Upload and process PDF documents
* Semantic search using vector embeddings
* Multi-document question answering
* Page-level citations with image previews
* Chat history management
* Voice input (Speech-to-Text)
* Responsive UI for desktop and mobile devices
* Source attribution for generated answers
* Document management interface

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* FastAPI
* Python

### AI / RAG Components

* Embedding Models
* Vector Database
* Semantic Retrieval
* Large Language Models (LLMs)

---

## Project Structure

```text
ragAssign/
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── parsers/
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── package.json
│
├── sample_docs/
│   ├── AI_Fundamentals.pdf
│   ├── Python_Basics.pdf
│   ├── Machine_Learning.pdf
│   ├── Data_Science.pdf
│   └── Cloud_Computing.pdf
│
├── .gitignore
└── README.md
```

---

## Screenshots

### Chat Interface

Add screenshot here:

```text
screenshots/chat.png
```

### Document Upload

Add screenshot here:

```text
screenshots/upload.png
```

### Citation Preview

Add screenshot here:

```text
screenshots/citations.png
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/sheezan-yo/Document-Intelligence-RAG.git
cd Document-Intelligence-RAG
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt
```

Run backend:

```bash
uvicorn app:app --reload
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000
```

---

## Usage

1. Start backend and frontend.
2. Open the application.
3. Upload documents from the `sample_docs` folder.
4. Ask questions about the uploaded documents.
5. View cited pages and supporting evidence.

### Example Questions

* What is Artificial Intelligence?
* Explain supervised learning.
* Summarize the Python basics document.
* What are cloud service models?
* Compare machine learning and data science.

---

## Architecture

```text
PDF Upload
     │
     ▼
Document Parser
     │
     ▼
Chunking
     │
     ▼
Embeddings
     │
     ▼
Vector Database
     │
     ▼
Retriever
     │
     ▼
LLM
     │
     ▼
Answer + Citations
```

---

## Future Improvements

* OCR support for scanned PDFs
* Streaming responses
* Multi-user authentication
* Document tagging and filtering
* Voice output
* Cloud deployment
* Conversation memory across sessions

---

## Sample Documents

The repository contains sample PDFs inside the `sample_docs` folder for testing the RAG pipeline.

These documents can be uploaded directly through the application to test:

* Semantic Search
* Citation Generation
* Multi-Document Retrieval
* Question Answering

---

## Author

**Sheezan Khan**

Built as a full-stack AI application demonstrating Retrieval-Augmented Generation (RAG), document intelligence, semantic search, and modern web development practices.
