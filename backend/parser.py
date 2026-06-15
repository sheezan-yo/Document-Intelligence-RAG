import os
import json
import fitz
import pdfplumber
import pytesseract
import status as statusMod
from PIL import Image

def parse_pdf(pdf_path):
    filename = os.path.splitext(os.path.basename(pdf_path))[0]
    
    statusMod.status_by_file[filename] = "Parsing"
    
    pages_data = []
    
    image_folder = f"page_images/{filename}"
    os.makedirs(image_folder, exist_ok=True)
    
    pdf_images = fitz.open(pdf_path)
    valid_tables = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            tables = page.extract_tables()
            
            for table in tables:
                if not table:
                    continue
                
                if len(table)<2:
                    continue
                
                if len(table[0])<2:
                    continue
                
                valid_tables.append(table)
            
            tables = valid_tables   
                     
            print(f"\nPAGE {page_num+1}")
            print(valid_tables)
            
            img_page = pdf_images[page_num]
            pix = img_page.get_pixmap(matrix=fitz.Matrix(2,2))
            image_path = f"{image_folder}/page_{page_num+1}.png"
            pix.save(image_path)
            
            pages_data.append({
                "page": page_num + 1,
                "text": text,
                "tables": tables,
                "image_path": image_path
            })
            
    return pages_data

def parse_image(image_path):
    image = Image.open(image_path)
    pytesseract.pytesseract.tesseract_cmd = (
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    )
    try:
        text = pytesseract.image_to_string(image)
    except Exception:
        text = ""
    
    return [
        {
            "page": 1,
            "text": text,
            "tables": [],
            "image_path": image_path
        }
    ]
    
def parse_text(text_path):
    with open(file_path, "r", encoding="utf-8") as f:
        text= f.read()
        
    return [
        {
            "page": 1,
            "text": text,
            "tables": [],
            "image_path": None
        }
    ]

def save_parsed_document(filename, pages_data):
    os.makedirs(
        "storage/parsed_docs", exist_ok=True
    )
    
    path = (f"storage/parsed_docs/{filename}.json")
    
    with open(
        path, "w", encoding="utf-8"
    ) as f:
        json.dump(
            pages_data, f, indent=4, ensure_ascii=False
        )
        
# def extract_text(pdf_path):
#     pages = []

#     with pdfplumber.open(pdf_path) as pdf:
#         for i, page in enumerate(pdf.pages):
#             text = page.extract_text() or ""

#             pages.append({
#                 "page": i + 1,
#                 "text": text,
#             })

#     return pages