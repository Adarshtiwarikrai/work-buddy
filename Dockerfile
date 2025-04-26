# # ==========================
# # Build Stage: Backend
# # ==========================
# FROM node:20 AS backend-builder

# WORKDIR /app

# # Install required dependencies for native modules (including canvas)
# RUN apt-get update && apt-get install -y python3 make g++ libcairo2-dev libpango1.0-dev libjpeg-dev libfreetype6-dev && rm -rf /var/lib/apt/lists/*

# # Copy package files first (for better caching)
# COPY package*.json tsconfig.json ./

# # Install dependencies
# RUN npm ci && npm install typescript

# # Copy the entire backend source code
# COPY . .

# # Build the TypeScript project
# RUN npx tsc

# # Rebuild native modules (e.g., canvas)
# RUN npm rebuild

# # ==========================
# # Final Stage: Serve Backend
# # ==========================
# FROM node:20

# WORKDIR /app

# # Install required runtime dependencies (Debian)
# RUN apt-get update && apt-get install -y libcairo2 libpango1.0-0 libjpeg62-turbo libfreetype6 && rm -rf /var/lib/apt/lists/*

# # Copy built backend files
# COPY --from=backend-builder /app/dist ./dist
# COPY --from=backend-builder /app/node_modules ./node_modules
# COPY --from=backend-builder /app/package*.json ./

# # Set environment variables
# ENV NODE_ENV=production
# ENV PORT=8080

# # Create a non-root user and switch to it
# RUN useradd -m appuser
# USER appuser

# # Expose backend port
# EXPOSE 8080

# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:8080/health || exit 1

# # Run the backend server
# CMD ["node", "dist/index.js"]
FROM node:20 AS backend-builder

WORKDIR /app

# Install required dependencies for native modules (including canvas)
# RUN apt-get update && apt-get install -y python3 make g++ libcairo2-dev libpango1.0-dev libjpeg-dev libfreetype6-dev && rm -rf /var/lib/apt/lists/*

# Copy package files first (for better caching)
 RUN apt-get update && apt-get install -y python3 make g++ libcairo2-dev libpango1.0-dev libjpeg-dev libfreetype6-dev && rm -rf /var/lib/apt/lists/*
 RUN apt-get update && apt-get install -y libcairo2 libpango1.0-0 libjpeg62-turbo libfreetype6 && rm -rf /var/lib/apt/lists/*


COPY package*.json ./

# Install dependencies
RUN npm ci && npm install typescript

# Copy TypeScript config
COPY tsconfig.json ./

# Copy the entire backend source code
COPY . .

# Build the TypeScript project
RUN npx tsc
RUN npm rebuild

# Expose backend port
EXPOSE 8080

# Run the backend server
CMD ["node", "dist/index.js"]
