# --- STAGE 1: Build Stage ---
FROM node:22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
# Using --legacy-peer-deps to handle conflicts in the user's devDependencies
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Copy the rest of the source code
COPY . .

# Build the TypeScript project
RUN npm run build

# --- STAGE 2: Production Stage ---
FROM node:22-alpine AS runner

# Set production environment
ENV NODE_ENV=production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps --no-audit --no-fund && \
    npm cache clean --force

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Change ownership of the app directory to the node user
RUN chown -R node:node /app

# Use the non-root user
USER node

# Run the application
CMD ["node", "dist/index.js"]
