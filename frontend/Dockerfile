# syntax=docker/dockerfile:1
# ------------------------
# Frontend build stage
# ------------------------
# Use the official Node.js image to install dependencies and build the React/Vite app.
FROM node:20 AS builder

# Set the working directory inside the container.
WORKDIR /app

# Copy dependency manifests first so Docker can cache npm install layers.
COPY package*.json ./

# Install dependencies using npm ci for reproducible builds.
RUN npm ci

# Copy the rest of the frontend source code and build the production bundle.
COPY . .
RUN npm run build

# ------------------------
# Frontend runtime stage
# ------------------------
# Use a lightweight NGINX image to serve the compiled static assets.
FROM nginx:1.27-alpine

# Copy the build output from the previous stage into NGINX's default web root.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the HTTP port and run NGINX in the foreground.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
