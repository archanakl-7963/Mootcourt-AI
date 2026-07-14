FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set up a new user with UID 1000 for Hugging Face compatibility
RUN useradd -m -u 1000 user
WORKDIR /app

# Copy requirements and install
COPY --chown=1000:1000 backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source files
COPY --chown=1000:1000 backend/ /app/

# Copy compiled frontend assets to /frontend/dist
COPY --chown=1000:1000 frontend/dist/ /frontend/dist/

# Ensure static uploads folders exist and are writeable by user 1000
RUN mkdir -p /app/app/static/avatars && chown -R user:user /app /frontend

# Switch to the non-privileged user
USER user

# Expose port (Hugging Face Spaces uses 7860 by default)
EXPOSE 7860

# Run the FastAPI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
