##通讯录前端项目 - 832302210
Git 仓库链接
前端仓库链接： https://github.com/1064103005/832302210-concacts_frontend
后端仓库链接： https://github.com/f2x1/832302210_concacts_backend

项目简介
本项目是《第一次作业——前后端分离通讯录编程》的前端实现部分。项目基于纯 HTML (contacts.html) 和 JavaScript (app.js) 开发，实现了联系人系统的基本 CRUD (增、删、改、查) 功能。

本项目严格遵守 前后端分离 要求，通过异步 fetch API 与后端 Spring Boot API 接口进行数据交互，确保所有数据操作都绕过缓存，直接从后端数据库读取或写入。

功能实现
本项目实现了作业要求中的所有基本功能：

功能点	状态	描述
功能 1: 添加 (C)	✅ 完成	通过 POST 请求向后端 /api/contacts 接口提交联系人数据
功能 2: 修改 (U)	✅ 完成	实现了编辑表单，并在修改前通过 GET 请求 /api/contacts/{id} 从后端读取最新数据，修改后通过 PUT 请求更新
功能 3: 删除 (D)	✅ 完成	通过 DELETE 请求通知后端删除指定 ID 的联系人
读取 (R)	✅ 完成	页面加载时和数据更新后，通过 GET 请求 /api/contacts 刷新联系人列表
搜索功能	✅ 完成	支持实时搜索，通过 GET 请求 /api/contacts/search 进行多字段匹配
技术栈
基础语言： HTML5, CSS3, ES6+ JavaScript

数据交互： Fetch API

样式框架： 原生 CSS3 (Flexbox + Grid 布局)

部署环境： 本地文件系统 / Live Server

接口约定 (与后端匹配)
本项目与后端 Spring Boot REST API 接口进行通信，API 基础路径约定为 http://localhost:8080/api。

功能	HTTP 方法	URL 路径
获取列表	GET	/api/contacts
添加	POST	/api/contacts
获取详情	GET	/api/contacts/{id}
修改	PUT	/api/contacts/{id}
删除	DELETE	/api/contacts/{id}
搜索	GET	/api/contacts/search?keyword={keyword}
健康检查	GET	/api/contacts/health
项目结构
text
832302210_concacts_frontend/
├── src/
│   ├── contacts.html          # 主页面文件
│   ├── css/
│   │   └── style.css          # 样式文件
│   └── js/
│       └── app.js             # 业务逻辑文件
├── README.md
└── codestyle.md
核心特性
✅ 响应式设计 - 完美适配桌面端和移动端

✅ 实时数据验证 - 前端表单验证 + 后端数据校验

✅ 用户体验优化 - 加载状态、成功/错误提示、确认对话框

✅ 实时搜索 - 支持姓名、电话、邮箱、地址多字段搜索

✅ 跨域支持 - 完整CORS配置，确保前后端正常通信

本地运行步骤
后端服务： 确保后端项目已启动并运行在 http://localhost:8080

克隆仓库：

bash
git clone https://github.com/f2x1/832302210_concacts_frontend.git
cd 832302210_concacts_frontend
运行前端：

方式一：直接在浏览器中打开 src/contacts.html 文件

方式二：使用本地服务器（推荐）：

bash
# 使用 Python
cd src
python -m http.server 8000

# 使用 Node.js
npx http-server src -p 8000
访问应用： 打开浏览器访问 http://localhost:8000
