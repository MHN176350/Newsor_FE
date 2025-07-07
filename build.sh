#!/bin/bash

# Build and deployment script for Newsor Frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Newsor Frontend Build Script${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build options
BUILD_TYPE=${1:-dev}

case $BUILD_TYPE in
    "dev")
        print_status "Building development version..."
        docker build -f Dockerfile -t newsor-frontend:dev .
        print_status "✅ Development build completed!"
        echo ""
        echo "To run the development version:"
        echo "docker run -p 3000:3000 newsor-frontend:dev"
        ;;
    "prod")
        print_status "Building production version..."
        docker build -f Dockerfile.prod -t newsor-frontend:prod .
        print_status "✅ Production build completed!"
        echo ""
        echo "To run the production version:"
        echo "docker run -p 3000:80 newsor-frontend:prod"
        ;;
    "compose")
        print_status "Building and starting with Docker Compose..."
        docker-compose down --remove-orphans
        docker-compose build
        docker-compose up -d
        print_status "✅ Docker Compose setup completed!"
        echo ""
        echo "Services are running:"
        echo "- Frontend: http://localhost:3000"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop services: docker-compose down"
        ;;
    "clean")
        print_status "Cleaning up Docker images and containers..."
        docker-compose down --remove-orphans --volumes
        docker system prune -f
        docker images | grep newsor-frontend | awk '{print $3}' | xargs -r docker rmi
        print_status "✅ Cleanup completed!"
        ;;
    *)
        print_error "Invalid build type. Use: dev, prod, compose, or clean"
        echo ""
        echo "Usage:"
        echo "  ./build.sh dev      - Build development version"
        echo "  ./build.sh prod     - Build production version (with Nginx)"
        echo "  ./build.sh compose  - Build and run with Docker Compose"
        echo "  ./build.sh clean    - Clean up Docker resources"
        exit 1
        ;;
esac
