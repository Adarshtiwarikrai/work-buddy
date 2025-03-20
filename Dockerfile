# ==========================
# Build Stage: Backend
# ==========================
FROM node:20 AS backend-builder

WORKDIR /app

# Install required dependencies for native modules
RUN apt-get update && apt-get install -y python3 python3-pip make g++ libcairo2-dev libpango1.0-dev libjpeg-dev libfreetype6-dev && rm -rf /var/lib/apt/lists/*

# Copy package files first (for better caching)
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install && npm install typescript

# Copy the entire backend source code
COPY . .

# Build the TypeScript project
RUN npx tsc

# ==========================
# Final Stage: Serve Backend
# ==========================
FROM node:20 

WORKDIR /app

# Install required runtime dependencies (Debian)
RUN apt-get update && apt-get install -y libcairo2 libpango1.0-0 libjpeg62-turbo libfreetype6 && rm -rf /var/lib/apt/lists/*

# Copy built backend files
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/package*.json ./ 

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose backend port
EXPOSE 8080

# Run the backend server
CMD ["node", "dist/index.js"]
