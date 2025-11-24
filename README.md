# 貓咪破壞世界 - Cat Destruction Game

一個 2D 橫向像素風格的網頁遊戲，玩家操控貓咪破壞世界！

## 遊戲特色

- 🐱 **角色創造系統**：選擇貓咪品種和毛色，生成獨特技能
- 🎮 **多樣化技能**：每隻貓擁有 3 種不同技能
- 🌍 **豐富世界**：包含多種生物和地形
- 🏆 **成績系統**：記錄破關時間，查看排行榜
- 🎨 **像素風格**：經典 2D 橫向卷軸遊戲體驗

## 遊戲玩法

### 角色創造
- **選擇品種**：波斯貓、暹羅貓、英國短毛貓、緬因貓
- **選擇毛色**：橘色、黑色、白色、灰色
- 系統會根據品種和毛色的性格特徵自動生成 3 種技能

### 操作方式
- **移動**：A/D 或 ←/→ 鍵
- **跳躍**：W 或 ↑ 或 空格鍵
- **攻擊**：J 鍵
- **技能**：1/2/3 鍵（使用對應技能）

### 破關條件
破壞世界中所有的建築物和生物，達到 100% 破壞進度即可破關！

## 部署到 GitHub Pages

### 方法一：使用 GitHub 網頁界面

1. 在 GitHub 創建一個新的 repository
2. 將所有文件上傳到 repository
3. 進入 repository 的 Settings
4. 找到 Pages 設定
5. 選擇 Source 為 `main` branch（或你的主分支）
6. 選擇 `/ (root)` 資料夾
7. 點擊 Save
8. 等待幾分鐘後，你的遊戲就可以在 `https://[你的用戶名].github.io/[repository名稱]` 訪問了

### 方法二：使用 Git 命令

```bash
# 初始化 git repository
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Cat Destruction Game"

# 添加 remote（替換為你的 repository URL）
git remote add origin https://github.com/[你的用戶名]/[repository名稱].git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

然後按照方法一的步驟 3-8 設定 GitHub Pages。

## 文件結構

```
.
├── index.html      # 主 HTML 文件
├── style.css       # 樣式文件
├── game.js         # 遊戲邏輯
└── README.md       # 說明文件
```

## 技術特點

- 純前端實現，無需後端服務器
- 使用 HTML5 Canvas 進行遊戲渲染
- LocalStorage 保存遊戲記錄
- 響應式設計，適配不同螢幕尺寸
- 像素風格美術設計

## 遊戲內容

### 貓咪品種
- **波斯貓**：優雅、冷靜、高傲（高防禦）
- **暹羅貓**：活潑、聰明、好動（高速度）
- **英國短毛貓**：溫和、穩重、友善（平衡型）
- **緬因貓**：強壯、獨立、勇敢（高攻擊）

### 毛色特徵
- **橘色**：貪吃、友好、懶散
- **黑色**：神秘、獨立、聰明
- **白色**：優雅、純潔、高貴
- **灰色**：冷靜、穩重、智慧

### 世界元素
- **地形**：地面、房屋、高塔、摩天大樓、城堡
- **生物**：鳥類、狗、兔子、松鼠

## 瀏覽器支援

- Chrome（推薦）
- Firefox
- Safari
- Edge

## 授權

此專案為開源專案，可自由使用和修改。

## 開發者

如有問題或建議，歡迎提出 Issue 或 Pull Request！

