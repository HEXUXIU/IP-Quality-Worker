# 🌐 IP Quality Worker · 一键看穿 IP 干净度 🚀

[![Stars](https://img.shields.io/github/stars/HEXUXIU/ip-quality-worker?style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker/stargazers)
[![Forks](https://img.shields.io/github/forks/HEXUXIU/ip-quality-worker?style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker/network/members)
[![License](https://img.shields.io/github/license/HEXUXIU/ip-quality-worker?style=flat-square)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/HEXUXIU/ip-quality-worker?style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker/issues)

---

## 📖 项目简介

**IP Quality Worker** 是一个运行在 **Cloudflare Workers** 上的轻量脚本，用于检测 IP 的信誉与风险。
特别适合 **MJJ（VPS 爱好者）**，可用于快速评估 VPS IP 是否干净，是否可能存在代理 / VPN / 机房风险。

👉 **核心目标**：简单、无依赖、随时可用。

---

## ⚡ 功能特性

* 多语言 API 请求示例（cURL / Python / JavaScript / Go）
* 统一 JSON 返回格式
* 可选绑定 **第三方 IP 风险数据库**（IPQualityScore、AbuseIPDB 等）
* 支持 API Key 传参（参数或 Header）
* 部署极简，仅需 1 个 Cloudflare Worker

---

## 🚀 快速开始

### 1. 部署 Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 新建 Worker，将 [`worker.js`](./worker.js) 粘贴进去
3. 保存并绑定路由（如 `https://ipq.yourdomain.com`）

### 2. 获取 API Key

* [申请 IPQualityScore Key](https://www.ipqualityscore.com/)
* [申请 AbuseIPDB Key](https://www.abuseipdb.com/)

**传入方式**

* 参数：`?key=YOUR_API_KEY&ip=1.2.3.4`
* Header：`Authorization: Bearer YOUR_API_KEY`

### 3. 请求示例

#### 🔹 cURL

```bash
curl "https://ipq.yourdomain.com?ip=8.8.8.8&key=YOUR_API_KEY"
```

#### 🔹 Python

```python
import requests
resp = requests.get("https://ipq.yourdomain.com", params={"ip":"8.8.8.8","key":"YOUR_API_KEY"})
print(resp.json())
```

#### 🔹 JavaScript

```javascript
const res = await fetch("https://ipq.yourdomain.com?ip=8.8.8.8&key=YOUR_API_KEY");
console.log(await res.json());
```

#### 🔹 Go

```go
resp, _ := http.Get("https://ipq.yourdomain.com?ip=8.8.8.8&key=YOUR_API_KEY")
defer resp.Body.Close()
body, _ := ioutil.ReadAll(resp.Body)
fmt.Println(string(body))
```

---

## 📦 返回 JSON 格式

```json
{
  "ip": "8.8.8.8",
  "risk_score": 0.02,
  "proxy": false,
  "vpn": false,
  "tor": false,
  "datacenter": true,
  "abuse_reports": 0,
  "country": "US",
  "isp": "Google LLC"
}
```

字段说明：

* `risk_score`：风险评分 (0.0~1.0)
* `proxy` / `vpn` / `tor`：代理、VPN、Tor 节点标识
* `datacenter`：是否为机房 IP
* `abuse_reports`：滥用举报次数
* `country` / `isp`：归属地与运营商

---

## 👥 适用人群

* **MJJ（VPS 爱好者）**：检测 VPS IP 是否干净 
* **开发者**：嵌入应用做登录 / 注册风控
* **安全从业者**：识别潜在恶意流量来源

---

## 📊 项目动态

![GitHub Stats](https://github-readme-stats.vercel.app/api/pin/?username=HEXUXIU\&repo=ip-quality-worker\&show_owner=true)
![访问量统计](https://komarev.com/ghpvc/?username=HEXUXIU\&repo=ip-quality-worker\&style=flat-square)
![活跃统计](https://github-readme-activity-graph.vercel.app/graph?username=HEXUXIU\&theme=github)

---

## 🔗 延伸阅读

* [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
* [IPQualityScore API 文档](https://www.ipqualityscore.com/documentation)
* [AbuseIPDB API 文档](https://docs.abuseipdb.com/)

---
