# 使用官方 Python 运行时作为父镜像
FROM python:3.10-slim

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 设置工作目录
WORKDIR /app/backend

# 安装依赖
# 先拷贝 requirements.txt 并安装，以便利用 Docker 的层缓存
COPY ./requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝项目代码到工作目录
COPY . /app/backend/

# 拷贝入口脚本并赋予执行权限
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 暴露端口
EXPOSE 8000

# 运行入口脚本
ENTRYPOINT ["/entrypoint.sh"]