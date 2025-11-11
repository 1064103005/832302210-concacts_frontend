## 项目定位
第一次作业——前后端分离通讯录编程 **前端仓库**  
学号：832302210  
作者：陈祺嵘
基础技术：纯 HTML + CSS + ES6 JavaScript
数据库：MySQL

## 功能总览
| 功能 | 实现状态 | 后端交互说明 |
|---|---|---|
| 新增联系人 | ✅ | POST /api/contacts |
| 修改联系人 | ✅ | 先 GET /api/contacts/{id} 再 PUT /api/contacts/{id} |
| 删除联系人 | ✅ | DELETE /api/contacts/{id} |
| 读取列表 | ✅ | GET /api/contacts |
| 实时搜索 | ✅ | GET /api/contacts/search?keyword={key} |

## 技术选型
- 标记：HTML5
- 样式：CSS3（Flex & Grid 布局）
- 脚本：原生 ES6+（fetch API）
- 运行：任意静态文件服务器

## 目录结构
832302210_concacts_frontend/
├─ src/
│  ├─ contacts.html
│  ├─ css/style.css
│  └─ js/app.js
├─ README.md
└─ codestyle.md


## 本地运行
1. 克隆仓库  
   ```bash
   git clone https://github.com/f2x1/832302210_concacts_frontend.git
   cd 832302210_concacts_frontend
启动静态服务器
bash
复制
# Python
python -m http.server 8000
# Node
npx http-server src -p 8000
浏览器访问 http://localhost:8000/contacts.html
# 注意事项
-后端必须运行在 http://localhost:8080 且已开启 CORS
-修改联系人时始终从数据库拉取最新数据，禁止本地缓存
-所有成功/失败操作均给出弹窗或行内提示
-相关链接
-后端仓库：https://github.com/f2x1/832302210_concacts_backend
