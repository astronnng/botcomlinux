FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
# Use npm install with --omit=dev to install production deps when no lockfile present
RUN npm install --omit=dev

# Copy source
COPY . .

# Do not run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENV NODE_ENV=production

CMD ["node", "index.js"]
