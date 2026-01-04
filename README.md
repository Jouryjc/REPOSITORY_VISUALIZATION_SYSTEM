# Knowledge Universe | 知识库可视化系统

一个基于 3D 可视化的知识库管理与统计系统，采用赛博朋克风格设计。

## 🌟 功能特性

### 3D 可视化
- **星球展示**：每个仓库以星球形式呈现，知识库仓库为黄色大球体，普通仓库为青色小球体
- **交互操作**：点击星球查看仓库详情，支持镜头切换（Overview、Top View、Deep Dive）
- **沉浸体验**：霓虹灯效果、星空背景、自动旋转

### 数据统计
- **System Metrics**：全局知识库覆盖率和构建完成率统计
- **Team Leader Analytics**：按团队负责人统计知识库建设进度

### 仓库管理
- **详情查看**：显示仓库链接、团队、业务板块、看护人等信息
- **知识库标记**：支持将普通仓库添加为知识库
- **键盘快捷键**：ESC 关闭详情面板

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TailwindCSS** - 原子化 CSS 框架
- **Three.js** - 3D 图形库
- **GSAP** - 动画库

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **MongoDB** - 文档数据库

### 部署
- **Docker** - 容器化部署
- **Docker Compose** - 多容器编排

## 📦 项目结构

```
knowledge-statistics/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   │   ├── ThreeScene.vue      # 3D 场景
│   │   │   ├── TeamStatsChart.vue  # 团队统计图
│   │   │   ├── CyberProgressBar.vue # 进度条组件
│   │   │   └── CyberPieChart.vue   # 饼图组件
│   │   ├── config/          # 配置文件
│   │   ├── utils/           # 工具函数
│   │   └── App.vue          # 主应用组件
│   ├── Dockerfile
│   └── package.json
├── backend/                  # 后端项目
│   ├── models/              # 数据模型
│   ├── server.js            # 服务器入口
│   ├── Dockerfile
│   └── package.json
├── repository-owners.csv     # 仓库数据源
├── knowledge_profiles.yaml   # 知识库配置
├── docker-compose.yml        # Docker 编排配置
└── README.md
```

## 🚀 快速开始

### 使用 Docker Compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

访问 http://localhost:5173 查看前端界面。

### 本地开发

#### 后端

```bash
cd backend
npm install
npm run dev
```

#### 前端

```bash
cd frontend
npm install
npm run dev
```

## 🎨 界面预览

### 主界面
- 左上角：标题和相机控制按钮
- 左下角：System Metrics 统计面板
- 右下角：Team Leader Analytics 统计面板
- 中央：3D 星球可视化
- 右侧：仓库详情面板（点击星球显示）

### 交互方式
- **点击星球**：打开仓库详情
- **拖拽**：旋转视角
- **滚轮**：缩放视角
- **ESC**：关闭详情面板

## 📊 数据说明

### 仓库数据 (repository-owners.csv)
- 仓库链接
- 业务板块
- 所属团队
- 领域看护人
- 知识库标记

### 知识库配置 (knowledge_profiles.yaml)
- 知识库构建状态
- 关联仓库信息

## 🔧 配置

### 团队负责人配置
在 `frontend/src/config/index.js` 中配置 TL 名单：

```javascript
export const TL_NAMES = [
  
];
```

## 📝 API 接口

### 获取仓库列表
```
GET /api/repos
```

### 更新知识库状态
```
PATCH /api/repos/:id/knowledge-base
Body: { "knowledgeBase": true }
```

### 数据导入
```
POST /api/ingest
```

## 📄 License

MIT License
