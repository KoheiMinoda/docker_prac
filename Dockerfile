FROM python:3.9-slim

RUN apt-get update && \
    apt-get install -y netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ /app/backend/
COPY frontend/ /app/frontend/
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh && \
    sed -i 's/\r$//g' entrypoint.sh

ENTRYPOINT ["/bin/bash", "./entrypoint.sh"]