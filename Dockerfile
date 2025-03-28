# Step 1: Build React App
FROM node:lts-alpine AS build

# Set working directory
WORKDIR ./app

# Copy package.json and package-lock.json
COPY package.json

# Install dependencies
RUN npm install 

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy build files to Nginx
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]