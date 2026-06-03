# --- Stage 1: Build Frontend ---
FROM node:20-slim AS build-stage
WORKDIR /app
# Explicitly copy files from the web directory
COPY web/public/omnid3sk/package.json ./
RUN npm install
COPY web/public/omnid3sk/ ./
RUN npm run build

# --- Stage 2: Runtime ---
FROM python:3.11-slim
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY server/ ./server/
COPY omniflow/ ./omniflow/
COPY *.json ./

# Copy the fresh build from the build-stage
# (Vite is configured to output to ../../../dist, which resolves to /dist in this context)
COPY --from=build-stage /dist/ ./dist/

# Cloud Run injects PORT env var (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD uvicorn server.main:app --host 0.0.0.0 --port $PORT
