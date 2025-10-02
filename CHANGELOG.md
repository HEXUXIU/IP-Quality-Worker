# CHANGELOG

## v0.01 - 2025-08-26
- 项目初始化，创建 Worker 基础框架
- 完成 IP 校验和基础 API 调用逻辑
- 输出原始 JSON 数据

## v0.05 - 2025-09-05
- 添加 IP 情报 API：IPWHOIS、DB-IP、MaxMind
- 增加统一 internal_json 输出
- 优化 HTML 渲染，增加语法高亮

## v0.10 - 2025-09-12
- 支持传入敏感接口 Key（X-API-KEYS）
- HTML 页面增加 Key 输入区域，自动启用敏感接口
- 增加错误提示和 Key 申请链接

## v0.15 - 2025-09-19
- 改进并发处理逻辑，优化 CPU 占用
- 增加更多 API：IPInfo、Cloudflare、IPAPI
- JSON 输出统一结构，便于客户端直接调用

## v0.20 - 2025-09-26
- 完善所有接口数据映射到 internal_json
- HTML 美化，现代化界面，保留原始响应展示
- 完整文档化注释，支持多语言请求示例
- 修复 Key 缺失/错误时的提示逻辑
