# Docker Setup for Newsor Frontend

This directory contains Docker configurations for the Newsor React frontend application.

## Files Overview

- `Dockerfile` - Development Docker configuration using Node.js and serve
- `Dockerfile.prod` - Production-optimized multi-stage Docker configuration using Nginx
- `nginx.conf` - Nginx configuration for production deployment
- `docker-compose.yml` - Multi-service setup with frontend, backend, and database
- `build.sh` / `build.bat` - Build scripts for easy Docker management
- `.dockerignore` - Files to exclude from Docker build context

## Quick Start

### Option 1: Using Build Scripts (Recommended)

**Linux/macOS:**
```bash
# Make script executable
chmod +x build.sh

# Build development version
./build.sh dev

# Build production version
./build.sh prod

# Run with Docker Compose
./build.sh compose

# Clean up Docker resources
./build.sh clean
```

**Windows:**
```cmd
# Build development version
build.bat dev

# Build production version
build.bat prod

# Run with Docker Compose
build.bat compose

# Clean up Docker resources
build.bat clean
```

### Option 2: Manual Docker Commands

**Development Build:**
```bash
# Build the image
docker build -f Dockerfile -t newsor-frontend:dev .

# Run the container
docker run -p 3000:3000 newsor-frontend:dev
```

**Production Build:**
```bash
# Build the image
docker build -f Dockerfile.prod -t newsor-frontend:prod .

# Run the container
docker run -p 3000:80 newsor-frontend:prod
```

**Docker Compose:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Configuration

### Environment Variables

The application supports the following environment variables:

- `NODE_ENV` - Set to 'production' for production builds
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000)
- `VITE_GRAPHQL_URL` - GraphQL endpoint URL (default: http://localhost:8000/graphql)

### Production Deployment

The production Dockerfile uses a multi-stage build:

1. **Build Stage**: Compiles the React application using Node.js
2. **Production Stage**: Serves the built files using Nginx

Benefits:
- Smaller final image size
- Better security (no Node.js in production)
- Optimized static file serving
- Built-in health checks

### Nginx Configuration

The production build includes an optimized Nginx configuration with:

- Gzip compression
- Security headers
- Static asset caching
- SPA routing support
- API/GraphQL proxy to backend
- Health check endpoint

## Health Checks

Both Docker images include health check endpoints:

- **Development**: `http://localhost:3000`
- **Production**: `http://localhost:80/health`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change the port mapping if 3000 is already in use
   ```bash
   docker run -p 8080:3000 newsor-frontend:dev
   ```

2. **Build failures**: Ensure you have enough disk space and Docker is running
   ```bash
   docker system df
   docker system prune
   ```

3. **Connection issues**: Make sure the backend URL is correctly configured
   ```bash
   docker run -e VITE_API_URL=http://your-backend:8000 -p 3000:80 newsor-frontend:prod
   ```

### Viewing Logs

```bash
# Docker container logs
docker logs <container-id>

# Docker Compose logs
docker-compose logs -f frontend
```

### Accessing the Container

```bash
# Development container
docker exec -it <container-id> sh

# Production container
docker exec -it <container-id> sh
```

## Performance Optimization

The production build includes several optimizations:

- Multi-stage build to reduce image size
- Gzip compression
- Static asset caching
- Security headers
- Non-root user for security
- Health checks for monitoring

## Security

- Runs as non-root user
- Includes security headers
- Minimal production image
- Only necessary files included
