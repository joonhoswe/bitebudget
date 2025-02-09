# Use a Python base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install "numpy<2"

# Set environment variable
ENV ENVIRONMENT=production
ENV PORT=8080

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the application
CMD ["python", "main.py"]
