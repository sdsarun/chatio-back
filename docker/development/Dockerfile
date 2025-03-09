# Use multi-stage build to reduce final image size
FROM node:22.14-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install only production dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Create a minimal runtime image
FROM node:22.14-alpine

WORKDIR /usr/src/app

# Copy only the built application and necessary dependencies from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3301

CMD ["node", "dist/main"]
