FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements from backend subdirectory
COPY backend1/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend source files
COPY backend1/ .

# Ensure static directories exist
RUN mkdir -p /app/app/static/avatars

# Expose port (Hugging Face Spaces uses 7860 by default)
EXPOSE 7860

# Run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
