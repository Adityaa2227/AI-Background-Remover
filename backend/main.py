from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import io
import uvicorn

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AI Background Remover API",
    description="API for removing image backgrounds using rembg",
    version="1.0.0"
)

# Set up global rate limit exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
# Allow all origins for development/mobile access
# In production, you might want to restrict this to your specific domain or app scheme
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Background Remover API is running"}

@app.post("/remove-bg")
@limiter.limit("5/minute")
async def remove_background(request: Request, file: UploadFile = File(...)):
    """
    Remove background from an uploaded image.
    Rate limit: 5 requests per minute per IP.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read image content
        contents = await file.read()
        
        # Process image
        # rembg.remove takes bytes and returns bytes
        output_image = remove(contents)

        # Return the processed image as PNG
        return Response(content=output_image, media_type="image/png")

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error processing image")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
