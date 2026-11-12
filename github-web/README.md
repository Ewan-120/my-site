# 简易计算器 · GitHub Pages 测试站

纯前端静态计算器，无框架、无依赖、无构建步骤，仅用于 GitHub Pages 测试。

## 功能

- 四则运算（乘除优先于加减），支持小数与负数
- 百分比：把当前数字除以 100
- 正负号切换、逐字符退格、一键清空
- 表达式预览 + 结果大字显示
- 键盘操作：数字、`.`、`+ - * /`、`Enter`、`Backspace`、`Esc`、`%`
- 适配桌面与手机窄屏

## 目录结构

```
github-pages-calculator/
├── index.html      # 页面结构与按键
├── style.css       # 深色主题、响应式布局
├── calculator.js   # 输入状态机与表达式求值
├── .nojekyll       # 跳过 Jekyll 处理，避免下划线文件被忽略
└── README.md
```

## 本地预览

直接双击 `index.html`，或在本目录启动本地服务：

```powershell
python -m http.server 8000
```

然后访问 <http://localhost:8000>。

## 部署到 GitHub Pages（由你自行上传）

1. 在 GitHub 新建仓库，例如 `calculator`。
2. 在本目录执行（把 `<用户名>`、`<仓库名>` 换成实际值）：

   ```powershell
   git init -b main
   git add .
   git commit -m "add calculator test page"
   git remote add origin https://github.com/<用户名>/<仓库名>.git
   git push -u origin main
   ```

3. 打开仓库 **Settings → Pages**：
   - **Source** 选 `Deploy from a branch`
   - **Branch** 选 `main`，目录选 `/ (root)`
   - 点 **Save**
4. 等待 1–2 分钟后访问 `https://<用户名>.github.io/<仓库名>/`。

之后每次 push 到 `main` 都会自动重新部署。

> 如果想发布个人主页站，仓库名必须为 `<用户名>.github.io`，访问地址为 `https://<用户名>.github.io/`。

## 说明

- 所有计算都在浏览器本地完成，没有后端，也不发送网络请求。
- 免费账号只能从**公开仓库**发布 Pages；从私有仓库发布需要 GitHub Pro/Team/Enterprise。
- 修改后若页面未更新，尝试 `Ctrl + F5` 强制刷新，或等待仓库 Actions 完成部署。
- 运算结果会四舍五入到 12 位有效数字，以消除浮点误差（例如 `0.1 + 0.2` 显示 `0.3`）。
