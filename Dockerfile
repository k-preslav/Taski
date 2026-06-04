## Frontend Dockerfile (multi‑stage)
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage – serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose default HTTP port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
