# Use an official lightweight Node image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies (only production deps if NODE_ENV=production)
RUN npm ci --omit=dev

# Copy rest of the source code
COPY . .

# Expose app port (use your PORT from .env, default 5000)
EXPOSE 5000

# Environment variable defaults
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]