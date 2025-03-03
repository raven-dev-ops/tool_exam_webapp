# 1) Builder image
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# 2) Production image
FROM node:18-alpine
WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm install --production

# Set port & expose
ENV PORT=3000
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
