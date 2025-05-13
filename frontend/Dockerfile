# 使用官方 Node.js LTS (Alpine) 版本作为父镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app/frontend

# 拷贝 package.json 和 package-lock.json (如果存在)
# 先拷贝这些文件并安装依赖，以便利用 Docker 的层缓存
COPY package*.json ./
RUN npm install

# 拷贝项目代码到工作目录
COPY . .

# 暴露端口
EXPOSE 3000

# 启动 React 开发服务器
CMD ["npm", "start"]