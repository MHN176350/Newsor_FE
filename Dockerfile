# Stage 1: Build FE
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Xóa default.conf nếu có
RUN rm /etc/nginx/conf.d/default.conf

# Copy cấu hình NGINX vào đúng thư mục
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy React build vào thư mục nginx
COPY --from=builder /app/dist /usr/share/nginx/html
