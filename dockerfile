FROM node:18

# ตั้งค่าให้ทำงานที่โฟลเดอร์ /app
WORKDIR /app

# คัดลอกโค้ดทั้งหมดเข้าไปใน Container
COPY . .

# ติดตั้ง dependencies สำหรับ Backend
RUN cd backend && npm install

# ติดตั้ง dependencies สำหรับ Frontend
RUN npm install --legacy-peer-deps

# สร้าง Frontend
RUN npm run build

# เปิดพอร์ต
EXPOSE 3000
EXPOSE 3001

# รัน Backend Server
CMD ["node", "backend/server.js"]