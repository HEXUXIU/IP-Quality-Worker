
# 🌐 IP Quality Worker - 基于 Cloudflare Worker 的 IP 质量检测脚本

[![Stars](https://img.shields.io/github/stars/HEXUXIU/ip-quality-worker?style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker/stargazers)
[![Forks](https://img.shields.io/github/forks/HEXUXIU/ip-quality-worker?style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker/network/members)
[![License](https://img.shields.io/github/license/HEXUXIU/ip-quality-worker?style=flat-square)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/HEXUXIU/ip-quality-worker?style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker/issues)
[![Latest Commit](https://img.shields.io/github/last-commit/HEXUXIU/ip-quality-worker?style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker/commits/main)
[![Visitors](https://komarev.com/ghpvc/?username=HEXUXIU&repo=ip-quality-worker&style=flat-square)](https://github.com/HEXUXIU/ip-quality-worker)

---

## 📖 项目简介

**IP Quality Worker** 是一个运行在 **Cloudflare Workers** 上的轻量脚本，用于检测 IP 的信誉与风险。  
特别适合 **MJJ（VPS 爱好者）**，快速评估 VPS IP 是否干净，是否存在代理 / VPN / 机房风险。

核心目标：**简单、无依赖、随时可用**。

---

## ⚡ 功能特性

- 多语言 API 请求示例（cURL / Python / JavaScript / Go）  
- 统一 JSON 返回格式，内部映射 `internal_json`  
- 可选绑定第三方 IP 风险数据库（MaxMind / IPWHOIS / DB-IP / AbuseIPDB / IPData 等）  
- 支持 API Key 统一管理（通过 `X-API-KEYS` Base64 JSON）  
- 部署极简，仅需 1 个 Cloudflare Worker  

---

## 🚀 快速开始

### 1. 部署 Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)  
2. 新建 Worker，将 [`worker.js`](./worker.js) 粘贴进去  
3. 保存并绑定路由，例如 `https://ip-proxy.example.workers.dev`  

---

### 2. 支持的 API & Key 申请

| API 服务 | 免费 / 限制 | Key 必需 | 官方申请链接 |
|----------|------------|-----------|-------------|
| AbuseIPDB | 免费注册获取 Key | ✅ | [abuseipdb.com](https://www.abuseipdb.com/) |
| IPQualityScore | 免费 5000 次/月 | ✅ | [ipqualityscore.com](https://www.ipqualityscore.com/) |
| MaxMind GeoIP2 | 免费试用需注册 | ✅ | [maxmind.com](https://www.maxmind.com/) |
| DB-IP | 每天 1000 次免费 | ❌ | [db-ip.com](https://db-ip.com/) |
| IPWHOIS.io | 免费注册 | ✅ | [ipwhois.io](https://ipwhois.io/) |
| Project HoneyPot | 免费 | ❌ | [projecthoneypot.org](https://www.projecthoneypot.org/) |
| Spamhaus DNSBL | 无需 Key | ❌ | [spamhaus.org](https://www.spamhaus.org/lookup/) |
| ip-api.com | 免费 45 请求/分钟 | ❌ | [ip-api.com](http://ip-api.com/) |
| ipinfo.io | 免费注册 Token | ✅ | [ipinfo.io](https://ipinfo.io/) |
| ipdata.co | 每天 1500 次 | ✅ | [ipdata.co](https://ipdata.co/) |
| GeoJS | 免费 | ❌ | [geojs.io](https://www.geojs.io/) |
| ipregistry.co | 免费注册 | ✅ | [ipregistry.co](https://ipregistry.co/) |
| APILayer IPStack | 免费注册 | ✅ | [ipstack.com](https://ipstack.com/) |

> **说明**：带 ✅ 的接口是敏感接口，需要提供 Key 才能启用。HTML 页面会提示用户申请 Key 并输入。

---

### 3. 传入 API Key

使用请求头 `X-API-KEYS` 传入 **Base64 编码的 JSON**，统一管理所有敏感接口 Key。

#### 示例 Key JSON

```json
{
  "maxmind": "你的MaxMind_Key",
  "ipwhois": "你的IPWHOIS_Key",
  "ipdata": "你的IPDATA_Key",
  "ipregistry": "你的IPREGISTRY_Key",
  "abuseipdb": "你的AbuseIPDB_Key"
}
````

#### Base64 编码示例

```
eyJtYXhtaW5kIjoiTUFTTUxPTkciLCJpcHdob2lzIjoiS0VZIiwiaXBkYXRhIjoiS0VZIiwiaXByZWdpc3RyeSI6IktFWSIsImFidXNlaXBkYiI6IktFWSJ9
```

---

### 4. 请求示例

#### 🔹 cURL

```bash
curl -H "X-API-KEYS: <Base64_JSON>" "https://ip-proxy.example.workers.dev/ip=8.8.8.8.json"
```

#### 🔹 Python

```python
import requests

headers = {"X-API-KEYS": "<Base64_JSON>"}
resp = requests.get("https://ip-proxy.example.workers.dev/ip=8.8.8.8.json", headers=headers)
print(resp.json())
```

#### 🔹 JavaScript (Node / Browser)

```javascript
const res = await fetch("https://ip-proxy.example.workers.dev/ip=8.8.8.8.json", {
  headers: {"X-API-KEYS": "<Base64_JSON>"}
});
console.log(await res.json());
```

#### 🔹 Go

```go
req, _ := http.NewRequest("GET", "https://ip-proxy.example.workers.dev/ip=8.8.8.8.json", nil)
req.Header.Set("X-API-KEYS", "<Base64_JSON>")
client := &http.Client{}
resp, _ := client.Do(req)
defer resp.Body.Close()
body, _ := ioutil.ReadAll(resp.Body)
fmt.Println(string(body))
```

---

## 📦 返回 JSON 示例

```json
{
  "ip": "8.8.8.8",
  "internal_json": {
    "maxmind": {...},
    "ipwhois": {...},
    "dbip": {...},
    "ipdata": {...},
    "ipregistry": {...},
    "abuseipdb": {...},
    "ipinfo": {...},
    "ipapi": {...},
    "projecthoneypot": {...}
  },
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

* `internal_json`：整理后的所有接口数据
* `risk_score`：风险评分 (0~1)
* `proxy` / `vpn` / `tor`：代理、VPN、Tor 节点标识
* `datacenter`：是否为机房 IP
* `abuse_reports`：滥用举报次数
* `country` / `isp`：归属地与运营商

---

## 👥 适用人群

* **MJJ（VPS 爱好者）**：快速评估 VPS IP 干净度
* **开发者**：嵌入应用做登录/注册风控
* **安全从业者**：识别潜在恶意流量来源

---

## 📊 项目动态（底部动态图）

* Star 历史图（好用就点个Ster吧!!!）

<a href="https://www.star-history.com/#HEXUXIU/IP-Quality-Worker&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=HEXUXIU/IP-Quality-Worker&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=HEXUXIU/IP-Quality-Worker&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=HEXUXIU/IP-Quality-Worker&type=Date" />
 </picture>
</a>

## 🔗 延伸阅读

* [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
* [IPQualityScore API 文档](https://www.ipqualityscore.com/documentation)
* [AbuseIPDB API 文档](https://docs.abuseipdb.com/)


