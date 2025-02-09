import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from transformers import DonutProcessor, VisionEncoderDecoderModel
from io import BytesIO
from PIL import Image
import uvicorn
from typing import Dict, Any
import torch

app = FastAPI(title="Receipt Extractor API")

# Initialize processor and model globally
try:
    processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base")
    model = VisionEncoderDecoderModel.from_pretrained("naver-clova-ix/donut-base")
    
    # Set the prompt for receipt recognition
    task_prompt = "<s_receipt>Extract text from this receipt:"
    processor.decoder_start_token_id = processor.tokenizer.convert_tokens_to_ids(['<s>'])[0]
    processor.tokenizer.pad_token = processor.tokenizer.eos_token
except Exception as e:
    print(f"Error loading model: {e}")
    raise

def preprocess_image(image: Image.Image) -> Image.Image:
    """Preprocess the image to match model requirements."""
    # Convert to RGB if image is in a different mode
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize image while maintaining aspect ratio
    target_size = (1024, 1024)  # Donut typically expects images around this size
    image.thumbnail(target_size, Image.LANCZOS)
    
    # Add padding to make it square if needed
    if image.size[0] != image.size[1]:
        new_image = Image.new('RGB', (max(image.size), max(image.size)), (255, 255, 255))
        new_image.paste(image, ((max(image.size) - image.size[0]) // 2,
                               (max(image.size) - image.size[1]) // 2))
        image = new_image
    
    return image

async def process_image(image: Image.Image) -> str:
    """Process an image through the Donut model and return the generated text."""
    try:
        # Preprocess the image
        image = preprocess_image(image)
        
        # Process with the model
        inputs = processor(image, text=task_prompt, return_tensors="pt")
        
        # Generate text
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
        
        # Decode the generated ids to text
        generated_text = processor.batch_decode(
            outputs.sequences,
            skip_special_tokens=True
        )[0]
        
        print(f"Generated text: {generated_text}")  # Debug print
        return generated_text
        
    except Exception as e:
        print(f"Error in process_image: {str(e)}")
        raise

def extract_total(text: str) -> str:
    """Extract the total amount from the receipt text."""
    if not text:
        return None
        
    lines = text.split('\n')
    for line in lines:
        # Look for common total patterns
        lower_line = line.lower()
        if any(pattern in lower_line for pattern in ['total', 'amount', 'sum', 'due', 'tend', 'subtotal']):
            # Try to extract number
            import re
            numbers = re.findall(r'\d+\.\d{2}', line)
            if numbers:
                return f"Total: ${numbers[-1]}"  # Return the last number if multiple found
    return None

@app.post("/extract-receipt/")
async def extract_receipt(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Extract information from a receipt image."""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )
        
        # Read and process image
        image_bytes = await file.read()
        try:
            image = Image.open(BytesIO(image_bytes))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image format: {str(e)}"
            )
        
        # Process image through model
        result_text = await process_image(image)
        
        # Extract total
        total_spent = extract_total(result_text)
        
        return {
            "status": "success",
            "total_spent": total_spent,
            "raw_text": result_text,
            "image_size": f"{image.size[0]}x{image.size[1]}"  # Debug info
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing receipt: {str(e)}"
        )

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