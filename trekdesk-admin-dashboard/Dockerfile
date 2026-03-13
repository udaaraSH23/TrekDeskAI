# --- STAGE 1: Build Stage ---
FROM node:20.18-alpine AS builder

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install ALL dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the project (Vite produces 'dist' folder)
# IMPORTANT: Ensure your VITE_ variables are set if needed at build time
RUN npm run build

# --- STAGE 2: Production Stage ---
# Using the unprivileged Nginx image for better security (runs as non-root by default)
FROM nginxinc/nginx-unprivileged:stable-alpine AS runner

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the default unprivileged port for this image
EXPOSE 8080

# The base image already has a CMD to start nginx
# and runs as a non-root 'nginx' user.
