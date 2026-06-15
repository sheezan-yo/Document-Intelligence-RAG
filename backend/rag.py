import os
import chromadb
# import google.generativeai as genai
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

import status as statusMod

load_dotenv()

# genai.configure(
#     api_key=os.getenv("GEMINI_API_KEY")
# )
# model = genai.GenerativeModel("gemini-2.5-flash")

openaiClient = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="documents"
)

embedding_model = None

def get_embedding_model():
    global embedding_model
    
    if embedding_model is None:
        embedding_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )
    
    return embedding_model

def add_document(pages, filename):
    statusMod.status_by_file[filename] = "Indexing"
    ids =[]
    documents = []
    metadatas = []
    
    for page in pages:
        text = page["text"] or ""
        table_text = ""
        
        for table in page["tables"]:
            for row in table:
                row = [
                    str(cell)
                    for cell in row
                    if cell
                ]
                
                if row:
                    table_text += (
                        " | ".join(row) + "\n"
                    )
                    
        full_content = (
            text + "\n\n" + table_text
        )
        
        if not full_content.strip():
            continue
        
        chunk_id = f"{filename}_page_{page['page']}"
        
        ids.append(chunk_id)
        documents.append(full_content)
        
        metadatas.append({
            "document": filename,
            "page": page["page"],
            "image_page": page["image_path"]
        })
        
    if not documents:
        raise ValueError(
            f"No text extracted from {filename}"
        )
        
    embeddings = get_embedding_model.encode(
        documents
    ).tolist()
        
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings
    )
    
    statusMod.status_by_file[filename] = "Indexed"
        
def search(query):
    query_embedding = get_embedding_model.encode(
        query
    ).tolist()
    
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )
    
    return results


def generate_answer(question, conversation_context=None):
    results = search(question)
    
    docs = results["documents"][0]
    metadata = results["metadatas"][0]
    
    context = "\n\n".join(docs)
    
    prompt = f"""
    Answer ONLY using the provided context.
    
    If the answer is not presented in the context,
    say:
    "I could not find relevant information in the uploaded documents..."
    
    Previous Conversation:
    {conversation_context}
    
    Context:
    {context}
    
    Question:
    {question}
    """
    
    # response = model.generate_content(prompt)
    response = openaiClient.chat.completions.create(
        model="openai/gpt-oss-120b:free",
        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ]
    )
    
    answer = response.choices[0].message.content
    
    citation_text = "\n\nSources:\n"
    
    for meta in metadata:
        citation_text += (
            f"- {meta['document']}"
            f"(page {meta['page']})\n"
        )
        
    final_ans = (
        answer + "\n" + citation_text
    )
    
    return {
        "answer": final_ans,
        "citations": metadata
    }
