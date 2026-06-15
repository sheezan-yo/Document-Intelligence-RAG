import os
import json
# import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

import status as statusMod

load_dotenv()

# genai.configure(
#     api_key=os.getenv("GEMINI_API_KEY")
# )
# model = genai.GenerativeModel("gemini-2.5-flash")

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

def clasify_document(text, filename):
    statusMod.status_by_file[filename] = "Classifying"
    text = text[:12000]
    
    prompt = f"""
    Classify this document.
    
    Return ONLY valid JSON.
    
    Schema:
    {{
        "document_type":"",
        "topic":"",
        "sensitivity":"",
        "contains_tables":true,
        "contains_images":true,
        "summary":""
    }}
    
    Document:
    
    {text}
    """
    
    # response = model.generate_content(prompt)
    response = client.chat.completions.create(
        model= "openrouter/owl-alpha",
        response_format={"type":"json_object"},
        messages=[
            {
                "role":"user",
                "content": prompt
            }
        ]
    )
    
    try:    
        response_text = response.choices[0].message.content.strip()
        print(response_text)
        # response_text = response_text.replace("```json","")
        # response_text = response_text.replace("```","")
        # response_text = response_text.strip()
        
        return json.loads(response_text)
    except Exception as e:
        print("JSON Parse Error:",e)
        print("Response:", response.text)
        
        return {
            "document_type": "Unknown",
            "topic": "Unknown",
            "sensitivity": "Unknown",
            "contains_tables": False,
            "contains_images": False,
            "summary": "Classification failed"
        }