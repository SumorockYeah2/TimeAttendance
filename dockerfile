# Step 1: Use an official Node.js image as a base image
FROM node:20 AS build

# Step 2: Set the working directory in the container
WORKDIR /

# Step 3: Copy the package.json and package-lock.json
COPY package.json ./

# Step 4: Install dependencies
RUN npm install --legacy-peer-deps

# Step 5: Copy the rest of the application files
COPY . .

# Step 6: Build the React app for production
RUN npm run build
cd backend
npm install && run 

# Step 7: Set up the server to serve the build files
FROM nginx:alpine

# Step 8: Copy the build files to the nginx container
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose the port for nginx to listen
EXPOSE 80

# Step 10: Start the nginx server
CMD ["nginx", "-g", "daemon off;"]# ใช้ Node.js base image
FROM node:18

# ตั้ง working directory
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์ทั้งหมดใน frontend
COPY . .

# สร้าง production build
RUN npm run build

# ใช้ Nginx สำหรับเสิร์ฟไฟล์ static
FROM nginx:alpine
COPY --from=0 /usr/src/app/build /usr/share/nginx/html

# เปิดพอร์ตที่ frontend ใช้งาน (เช่น 80)
EXPOSE 3000

# คำสั่งเริ่มต้นสำหรับรัน Nginx
CMD ["nginx", "-g", "daemon off;"]