#!/bin/bash

# NestJS Docker Deployment Script
# Usage: ./deploy.sh [environment] [--build]
# Example: ./deploy.sh development --build
# Example: ./deploy.sh staging
# Example: ./deploy.sh production

# Default to development environment if not specified
ENVIRONMENT=${1:-development}

# Define color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set the docker directory path based on environment
DOCKER_DIR="$(pwd)/docker/${ENVIRONMENT}"

# Check if the docker directory exists
if [ ! -d "$DOCKER_DIR" ]; then
  echo -e "${RED}Error: Docker directory for ${ENVIRONMENT} environment not found at:${NC}"
  echo -e "${RED}$DOCKER_DIR${NC}"
  exit 1
fi

# Navigate to the project root directory
echo -e "${BLUE}Deploying NestJS application to ${ENVIRONMENT} environment...${NC}"

# Build the images
echo -e "${YELLOW}Building Docker images...${NC}"
docker compose -f "$DOCKER_DIR/compose.yaml" build --no-cache

# Stop any running containers from the previous deployment
echo -e "${YELLOW}Stopping any existing containers...${NC}"
docker compose -f "$DOCKER_DIR/compose.yaml" down

# Start the containers in detached mode
echo -e "${YELLOW}Starting the application...${NC}"
docker compose -f "$DOCKER_DIR/compose.yaml" up -d

# Check if the containers are running
if [ $? -eq 0 ]; then
  echo -e "${GREEN}NestJS application deployment completed successfully!${NC}"

  # Display running containers
  echo -e "${BLUE}Running containers:${NC}"
  docker compose -f "$DOCKER_DIR/compose.yaml" ps

  # Get the app container name
  APP_CONTAINER=$(docker compose -f "$DOCKER_DIR/compose.yaml" ps -q app 2>/dev/null)

  if [ -n "$APP_CONTAINER" ]; then
    # Display logs from the app container
    echo -e "${BLUE}Application logs:${NC}"
    docker logs --tail=20 $APP_CONTAINER
  fi

  # Display service endpoints
  echo -e "${GREEN}Service is now running!${NC}"
else
  echo -e "${RED}Deployment failed. Check the Docker logs for more information.${NC}"
  exit 1
fi