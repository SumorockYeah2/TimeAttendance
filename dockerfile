# Step 1: Use an official Node.js image as a base image
FROM node:16 AS build

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json
COPY package.json package-lock.json ./

# Step 4: Install dependencies
RUN npm install --legacy-peer-deps

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Build the React app for production
RUN npm run build

# Step 7: Set up the server to serve the build files
FROM nginx:alpine

# Step 8: Copy the build files to the nginx container
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose the port for nginx to listen
EXPOSE 80

# Step 10: Start the nginx server
CMD ["nginx", "-g", "daemon off;"]