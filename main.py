import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from transformers import DonutProcessor, VisionEncoderDecoderModel
from io import BytesIO
from PIL import Image, ImageEnhance, ImageOps
import uvicorn
import re
from typing import Dict, Any
import torch

app = FastAPI(title="Receipt Extractor API")

# Load Donut model and processor
try:
    processor = DonutProcessor.from_pretrained("fahmiaziz/finetune-donut-cord-v2.5")
    model = VisionEncoderDecoderModel.from_pretrained("fahmiaziz/finetune-donut-cord-v2.5")
    
    # Set decoding parameters
    task_prompt = "<s_receipt>Extract text from this receipt:"
    processor.decoder_start_token_id = processor.tokenizer.convert_tokens_to_ids(['<s>'])[0]
    processor.tokenizer.pad_token = processor.tokenizer.eos_token
except Exception as e:
    print(f"Error loading model: {e}")
    raise

def preprocess_image(image: Image.Image) -> Image.Image:
    """Enhance image for better OCR performance."""
    # Convert to grayscale and enhance contrast
    image = image.convert("L")  # Convert to grayscale
    image = ImageEnhance.Contrast(image).enhance(2.0)  # Increase contrast
    image = ImageOps.invert(image)  # Invert colors for better text recognition

    # Convert back to RGB for model compatibility
    image = image.convert("RGB")

    # Resize while maintaining aspect ratio
    target_size = (1024, 1024)
    image.thumbnail(target_size, Image.LANCZOS)

    # Ensure it's a square image (Donut expects square input)
    new_image = Image.new('RGB', target_size, (255, 255, 255))
    new_image.paste(image, ((target_size[0] - image.size[0]) // 2, (target_size[1] - image.size[1]) // 2))

    return new_image

async def process_image(image: Image.Image) -> str:
    """Run the image through Donut and extract text."""
    try:
        # Preprocess image
        image = preprocess_image(image)

        # Prepare input for Donut
        inputs = processor(image, text=task_prompt, return_tensors="pt")

        print("Running model inference...")  # Debugging

        # Generate output from model
        outputs = model.generate(
            inputs.pixel_values,
            max_length=512,
            num_beams=4,
            early_stopping=True,
            pad_token_id=processor.tokenizer.pad_token_id,
            eos_token_id=processor.tokenizer.eos_token_id,
            use_cache=True,
            bad_words_ids=[[processor.tokenizer.unk_token_id]],
            return_dict_in_generate=True,
        )

        # Decode generated text
        generated_text = processor.batch_decode(outputs.sequences, skip_special_tokens=True)[0]

        print(f"\nExtracted Text:\n{generated_text}\n")  # Debugging

        return generated_text
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise

def extract_total(text: str) -> str:
    """Extract total amount from receipt text."""
    if not text:
        return None

    lines = text.split("\n")
    
    total_patterns = ["total", "amount", "due", "tend", "sub total", "amount paid"]
    
    for line in lines:
        lower_line = line.lower().strip()

        # Match against total-related keywords
        if any(keyword in lower_line for keyword in total_patterns):
            numbers = re.findall(r"\d+\.\d{2}", line)
            if numbers:
                print(f"Matched Total Line: {line}")  # Debugging
                return f"Total: ${numbers[-1]}"  # Pick last amount in case of multiple
    
    # Fallback: Get the largest number found (which is likely the total)
    all_numbers = re.findall(r"\d+\.\d{2}", text)
    if all_numbers:
        largest_total = max(map(float, all_numbers))
        return f"Total: ${largest_total:.2f}"
    
    return None

@app.post("/extract-receipt/")
async def extract_receipt(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Extract information from a receipt image."""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        image_bytes = await file.read()
        try:
            image = Image.open(BytesIO(image_bytes))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

        # Process image through model
        result_text = await process_image(image)

        # Extract total
        total_spent = extract_total(result_text)

        return {
            "status": "success",
            "total_spent": total_spent,
            "raw_text": result_text,
            "image_size": f"{image.size[0]}x{image.size[1]}"
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing receipt: {str(e)}")

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
