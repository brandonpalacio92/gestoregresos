# Use Node.js 20.19.1
FROM node:20.19.1-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:prod

# Install backend dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ .

# Expose port
EXPOSE 3000

# Start the application
WORKDIR /app/backend
CMD ["npm", "run", "prod"]
