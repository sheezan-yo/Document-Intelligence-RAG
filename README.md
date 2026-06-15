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
1.
<img width="1902" height="965" alt="s3" src="https://github.com/user-attachments/assets/62cba248-a2dd-4031-845a-5d15892830aa" />

### Document Upload
```text
screenshots/upload.png
```

1.
<img width="1883" height="1219" alt="s1" src="https://github.com/user-attachments/assets/d3ba63ba-147e-404b-b0f1-eb810e03a833" />

2.
<img width="1890" height="1231" alt="s2" src="https://github.com/user-attachments/assets/fa84b991-7871-41d8-bf3c-91b477a7656c" />

### Citation Preview

Add screenshot here:

```text
screenshots/citations.png
```
1.
<img width="1905" height="973" alt="s4" src="https://github.com/user-attachments/assets/847f4a62-09c6-43cd-9f3c-b4c25e6a7819" />


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

Create .env file:
```bash
OPENROUTER_API_KEY=
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

## Security Decisions

### Threat Model

The application accepts user-uploaded PDF documents that may contain sensitive or confidential information. Security considerations were evaluated across the upload, storage, processing, and retrieval layers.

---

### Upload Layer

#### Implemented

* File type validation to allow only PDF uploads.
* Server-side validation instead of relying solely on client-side checks.
* Upload size limits to reduce the risk of denial-of-service attacks through large files.

#### Considered but Not Implemented

* Antivirus or malware scanning of uploaded files.
* Content-based PDF validation to detect malformed or malicious documents.

#### Future Improvements

* Integrate malware scanning using ClamAV or a similar solution.
* Add rate limiting for upload endpoints.

---

### Storage Layer

#### Implemented

* Uploaded files are stored outside the source code repository.
* Sensitive runtime data such as uploads, vector databases, and caches are excluded from version control using `.gitignore`.
* Environment variables are excluded from the repository.

#### Considered but Not Implemented

* Encryption of uploaded files at rest.
* Secure cloud object storage.

#### Future Improvements

* Encrypt uploaded documents before storage.
* Use cloud storage with managed access controls and audit logging.

---

### Processing Layer

#### Implemented

* Only extracted document text is processed by the retrieval pipeline.
* Processing is isolated from the frontend and handled by the backend service.
* Temporary processing artifacts are not exposed to users.

#### Considered but Not Implemented

* Sandboxed document processing.
* OCR security controls for image-based PDFs.

#### Future Improvements

* Run document processing in isolated containers.
* Add resource limits to prevent abuse through extremely large documents.

---

### API and Retrieval Layer

#### Implemented

* Backend endpoints only expose required information.
* Citations return relevant source references instead of raw document storage paths.
* Input validation is performed before processing requests.

#### Considered but Not Implemented

* Authentication and authorization.
* Per-user document isolation.
* API rate limiting.

#### Future Improvements

* JWT-based authentication.
* User-specific document access controls.
* Request throttling and rate limiting.
* Audit logging for document access and queries.

---

### Security Trade-offs

Given the scope of the project, the focus was placed on secure file handling, input validation, and minimizing accidental exposure of sensitive data. Advanced enterprise security features such as authentication, encryption at rest, malware scanning, and audit logging were identified as important future enhancements but were not implemented due to time constraints.

For a production deployment, these controls would be considered mandatory.

---

## Author

**Sheezan Khan**

Built as a full-stack AI application demonstrating Retrieval-Augmented Generation (RAG), document intelligence, semantic search, and modern web development practices.
