from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove, new_session

# Initialize session with lightweight model 'u2netp' (approx 5MB vs 170MB)
# This prevents download timeouts on free hosting servers
model_session = new_session("u2netp")

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
        
        # Process image using the pre-loaded lightweight session
        output_image = remove(contents, session=model_session)

        # Return the processed image as PNG
        return Response(content=output_image, media_type="image/png")

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error processing image")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
