# Use Node.js 18
FROM node:18-alpine

# Set working directory to /app/server
WORKDIR /app/server

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server source code
COPY server/ ./

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]