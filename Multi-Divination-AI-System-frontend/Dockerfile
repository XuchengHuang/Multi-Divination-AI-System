# 多阶段构建：第一阶段用于构建
FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制package.json
COPY package.json ./

# 安装依赖
RUN npm install

# 设置构建时环境变量
ARG GEMINI_API_KEY
ARG BACKEND_URL
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV BACKEND_URL=$BACKEND_URL

# 复制源代码
COPY . .

# 构建项目（此时环境变量会被Vite处理）
RUN npm run build

# 第二阶段：运行时环境
FROM nginx:alpine

# 复制构建产物到nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]