FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependency files first (allows Docker layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy all backend source code
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
