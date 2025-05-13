# 税务管理系统

## 项目简介

本项目是一个税务管理系统，使用 Django 作为后端框架，React 作为前端框架。该系统旨在帮助管理员和用户管理税务表单和用户信息。

## 技术栈

- **后端**: Django
- **前端**: React
- **数据库**: SQLite（可根据需要更改）

## 项目结构

- **backend/**: 包含 Django 后端代码
  - **apps/**: 包含应用程序代码
    - **accounts/**: 用户账户管理
    - **tax_forms/**: 税务表单管理
  - **config/**: Django 项目配置
  - **manage.py**: Django 管理命令
  - **requirements.txt**: 后端依赖包

- **frontend/**: 包含 React 前端代码
  - **public/**: 静态文件
  - **src/**: 源代码
    - **components/**: React 组件
    - **pages/**: 页面组件
    - **services/**: API 服务
    - **types/**: TypeScript 类型定义
  - **package.json**: 前端依赖包
  - **tsconfig.json**: TypeScript 配置

## 安装与运行

1. 克隆项目：

   ```bash
   git clone <repository-url>
   cd tax
   ```

2. 设置后端：

   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. 设置前端：

   ```bash
   cd frontend
   npm install
   npm start
   ```

## 加载示例数据（可选）

如果您想在开发环境中加载一些初始的示例数据，可以按照以下步骤操作：

1.  **（重要）清理现有数据库和迁移（如果需要重置）**：
    如果您之前已经运行过迁移或有旧的数据库文件，并且希望从一个干净的状态开始加载示例数据，请执行以下操作。**此操作会删除现有数据，请谨慎操作。**

    ```bash
    # 进入后端目录
    cd backend

    # 删除旧的数据库文件 (例如 db.sqlite3)
    rm db.sqlite3

    # 删除 tax_forms 应用的旧迁移文件 (保留 __init__.py)
    rm tax_forms/migrations/00*.py

    # 删除 accounts 应用的旧迁移文件 (保留 __init__.py, 如果有的话)
    # rm accounts/migrations/00*.py
    ```

2.  **生成并应用新的数据库迁移**：
    这将根据当前的模型定义创建新的数据库结构。

    ```bash
    # 确保您在 backend 目录下
    python manage.py makemigrations tax_forms
    python manage.py makemigrations accounts
    python manage.py migrate
    ```

3.  **加载示例数据 Fixture**：
    示例数据存储在 `backend/tax_forms/fixtures/initial_data.json` 文件中。

    ```bash
    # 确保您在 backend 目录下
    python manage.py loaddata tax_forms/fixtures/initial_data.json
    ```
    如果一切顺利，您会看到类似 "Installed X object(s) from 1 fixture(s)" 的消息。

## 创建Django管理员账户

本项目使用自定义用户模型accounts.User，创建管理员账户的步骤如下：

1. 创建超级用户（管理员）：

```bash
cd backend
python manage.py createsuperuser
```

2. 按提示输入以下信息：

- 用户名（Username）
- 电子邮件地址（Email address）
- 密码（Password）及确认密码

3. 创建完成后，启动Django服务器：

```bash
python manage.py runserver
```

4. 访问管理后台：

- 浏览器打开：<http://localhost:8000/admin/>
- 使用刚才创建的超级用户凭据登录

5. 在管理后台中，您可以：

- 管理用户账户
- 创建和编辑税务表单
- 查看和管理所有数据模型

注意：由于项目使用自定义用户模型，新创建的超级用户默认为管理员类型（user_type='admin'）。您可以在管理后台中查看和修改用户的类型和权限。

## Docker 部署 (开发环境)

1.  **确保 Docker 和 Docker Compose 已安装**。

2.  **构建并启动容器**：
    在项目根目录 (`/Users/dylan/Desktop/codes/tax/`) 下打开终端，运行以下命令：
    ```bash
    docker compose up -d
    ```
    首次运行会构建镜像，可能需要一些时间。后续启动如果文件未更改则会更快。

3.  **访问应用**：
    *   后端 Django API: `http://localhost:8000`
    *   前端 React 应用: `http://localhost:3000`

4.  **加载示例数据 (在 Docker 环境中)**：
    如果容器正在运行，您可以通过以下命令在 **新的终端窗口** 中执行，以加载示例数据：
    ```bash
    docker-compose exec backend python manage.py loaddata tax_forms/fixtures/initial_data.json
    ```

5.  **创建 Django 管理员账户 (在 Docker 环境中)**：
    如果容器正在运行，您可以通过以下命令在 **新的终端窗口** 中执行，以创建超级用户：
    ```bash
    docker-compose exec backend python manage.py createsuperuser
    ```
    然后按照提示输入用户名、邮箱和密码。

6.  **查看日志**：
    `docker-compose up` 命令会在当前终端显示组合日志。如果需要单独查看某个服务的日志，可以使用：
    ```bash
    docker-compose logs backend
    docker-compose logs frontend
    ```

7.  **停止容器**：
    在运行 `docker-compose up` 的终端中按 `Ctrl+C`。然后可以运行以下命令来停止并移除容器、网络和卷（除非卷被声明为外部的）：
    ```bash
    docker-compose down
    ```
    如果只想停止服务而不移除它们，可以使用：
    ```bash
    docker-compose stop
    ```

## 贡献

欢迎任何形式的贡献！请提交问题或拉取请求。

## 许可证

本项目采用 MIT 许可证。
