# TRIVIAPARTY/Frontend/Dockerfile

# ---- Stage 1: Build the React application ----
    FROM node:18-alpine AS build-stage
    # Using alpine for smaller image size. Ensure this Node version is compatible with your project.
    
    WORKDIR /app/frontend
    
    # Copy package.json and package-lock.json (or yarn.lock)
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy the rest of your frontend application source code
    COPY . .
    
    # IMPORTANT: Set up environment variables for the build process
    # If your app uses REACT_APP_API_URL or similar for the backend URL,
    # you need to set it here so the build incorporates the correct API endpoint.
    # You can pass this as a build argument from 'docker build' or 'docker-compose'.
    ARG REACT_APP_API_URL=http://localhost:3000/api
    ENV REACT_APP_API_URL=${REACT_APP_API_URL}
    
    ARG REACT_APP_SOCKET_URL=http://localhost:3000
    ENV REACT_APP_SOCKET_URL=${REACT_APP_SOCKET_URL}
    
    # Build the React application for production
    RUN npm run build
    
    # ---- Stage 2: Serve the application with Nginx ----
    FROM nginx:1.25-alpine AS production-stage
    
    # Remove default Nginx static assets
    RUN rm -rf /usr/share/nginx/html/*
    
    # Copy static assets from the build stage to Nginx's web server directory
    COPY --from=build-stage /app/frontend/build /usr/share/nginx/html
    
    # Optional: If you have a custom Nginx configuration (for React Router, proxying, etc.)
    # Create a file named 'nginx.conf' in your Frontend directory and uncomment the next line:
    # COPY nginx.custom.conf /etc/nginx/conf.d/default.conf
    
    # Expose port 80 (Nginx default HTTP port)
    EXPOSE 80
    
    # Start Nginx and keep it in the foreground
    CMD ["nginx", "-g", "daemon off;"]