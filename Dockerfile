# Frontend Build
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Backend Build
FROM python:3.8-slim AS backend-builder
WORKDIR /app/backend
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY whitekon.py .

# Final Image
FROM python:3.8-slim
WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/frontend/.next ./.next
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/package*.json ./

# Copy backend
COPY --from=backend-builder /app/backend/whitekon.py .
COPY --from=backend-builder /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages

# Install production dependencies
RUN npm install --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 