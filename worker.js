/**
 * =========================================================
 * IP Quality Worker
 * =========================================================
 * 功能：
 * - 并发控制请求，CPU占用低
 * - 保留原始响应 rawText
 * - internal_json 统一映射结构
 * - HTML 美观，支持统一 Key / 单接口 Key
 * - JSON API 支持 Header 传 Key
 */

const VERSION = "v0.20";
const MAX_CONCURRENT = 5;
const DEFAULT_TIMEOUT = 5000;

// ======== API 配置 ========
// sensitive: 需要 Key 才能调用
const API_CONFIG = {
  ipwhois:    { url: "https://ipwhois.app/json/{ip}", sensitive:false, applyKey:"https://ipwhois.io/" },
  ipinfo:     { url: "https://ipinfo.io/{ip}/json", sensitive:false, applyKey:"https://ipinfo.io/" },
  cloudflare: { url: "https://ip.nodeget.com/json", sensitive:false, applyKey:null },
  dbip:       { url: "https://api.db-ip.com/v2/free/{ip}", sensitive:false, applyKey:"https://db-ip.com/" },
  maxmind:    { url: "https://geoip.maxmind.com/geoip/v2.1/city/{ip}", sensitive:true, applyKey:"https://www.maxmind.com/en/accounts/current/license-keys" },
  ipregistry: { url: "https://api.ipregistry.co/{ip}?key={key}", sensitive:true, applyKey:"https://ipregistry.co/" },
  ipdata:     { url: "https://api.ipdata.co/{ip}?api-key={key}", sensitive:true, applyKey:"https://ipdata.co/" },
  ipapi:      { url: "http://ip-api.com/json/{ip}?lang=zh-CN", sensitive:false, applyKey:null },
  skk:        { url: "https://api.skk.moe/ip?ip={ip}", sensitive:false, applyKey:null }
};

// ======== IP 校验 ========
function isValidIP(ip){
  const v4 = /^\d{1,3}(\.\d{1,3}){3}$/;
  const v6 = /^(?:[a-fA-F0-9]{1,4}:){1,7}:?$/;
  return v4.test(ip) || v6.test(ip);
}

// ======== fetch 封装 ========
async function fetchWithTimeout(url, timeout=DEFAULT_TIMEOUT, headers={}){
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeout);
  try{
    const res = await fetch(url,{signal:controller.signal, headers});
    const text = await res.text();
    try { return { status:res.status, data: JSON.parse(text), rawText:text }; } 
    catch { return { status:res.status, data:null, rawText:text }; }
  } catch(e) {
    return { status:0, data:null, rawText:e.message };
  } finally { clearTimeout(timer); }
}

// ======== 并发处理 API ========
async function processApis(ip, keys){
  const results = {};
  const keysArr = Object.keys(API_CONFIG);
  let index = 0;
  async function worker(){
    while(index < keysArr.length){
      const i = index++;
      const api = keysArr[i];
      const conf = API_CONFIG[api];
      let url = conf.url.replace("{ip}", ip);
      const header = {};
      if(conf.sensitive && keys && keys[api]) header['Authorization'] = keys[api];
      if(conf.sensitive && keys && keys[api] && url.includes("{key}")) url = url.replace("{key}", keys[api]);
      results[api] = await fetchWithTimeout(url, DEFAULT_TIMEOUT, header);
    }
  }
  await Promise.all(Array(Math.min(MAX_CONCURRENT, keysArr.length)).fill(0).map(()=>worker()));
  return results;
}

// ======== internal_json 统一映射 ========
function buildInternalJSON(raw){
  const internal = {};
  for(const [api,res] of Object.entries(raw)){
    if(!res || !res.data) continue;
    const d = res.data;
    internal[api] = {
      ip: d.ip || d.ipAddress || (d.ip && d.ip.address) || null,
      country: d.country || d.countryName || (d.location && d.location.country) || null,
      region: d.region || d.stateProv || (d.location && d.location.region) || null,
      city: d.city || null,
      latitude: d.latitude || (d.location && d.location.geographicCoordinate && d.location.geographicCoordinate.latitude) || null,
      longitude: d.longitude || (d.location && d.location.geographicCoordinate && d.location.geographicCoordinate.longitude) || null,
      isp: d.isp || d.org || (d.ip && d.ip.asOrganization) || null,
      timezone: d.timezone || (d.location && d.location.timezone) || null
    };
  }
  return internal;
}

// ======== JSON -> HTML 高亮 ========
function jsonToHighlightedHTML(obj){
  const text = JSON.stringify(obj,null,2).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return text.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b-?\d+(\.\d+)?([eE][+\-]?\d+)?\b)/g,
    match=>{
      let cls="number";
      if(/^"/.test(match)) cls=/:\s*$/.test(match)?"key":"string";
      else if(/true|false/.test(match)) cls="boolean";
      else if(/null/.test(match)) cls="null";
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

// ======== HTML 渲染 ========
function renderHTML(ip, internal, rawResponses){
  const entries = Object.entries(rawResponses || {});
  const ordered = entries.sort((a,b)=> (a[1].status===200?-1:1)-(b[1].status===200?-1:1));

  const apiBlocks = ordered.map(([api,res])=>{
    const ok = res && (res.status===200 || res.listed===true || res.listed===false);
    const statusDisplay = res && res.status ? `[${res.status}]` : `[?]`;
    let content = "<pre class='code plain'>no response</pre>";
    if(res && res.rawText){
      try{ content = jsonToHighlightedHTML(JSON.parse(res.rawText)); }catch{ content = `<pre class='code plain'>${res.rawText.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>`; }
    } else if(res && res.data) content = jsonToHighlightedHTML(res.data);
    return `<section class="api ${ok?'ok':'err'}"><div class="api-header"><strong>${api}</strong> <span class="status ${ok?'ok':'err'}">${statusDisplay}</span></div><div class="api-body">${content}</div></section>`;
  }).join("\n");

  const internalHtml = jsonToHighlightedHTML(internal);

  const css = `
    body{background:#0f1720;color:#e6eef6;font-family:Inter,ui-sans-serif,system-ui,monospace;padding:20px}
    .wrap{max-width:1100px;margin:0 auto}
    header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
    h1{font-size:18px;margin:0}
    .grid{display:grid;grid-template-columns:1fr 380px;gap:16px}
    .panel{background:#0b1220;padding:14px;border-radius:8px;border:1px solid rgba(255,255,255,0.03)}
    .panel h2{margin:0 0 8px 0;font-size:14px}
    .code{background:#061022;padding:10px;border-radius:6px;overflow:auto;font-size:12px}
    .code.plain{white-space:pre-wrap}
    .key{color:#93c5fd} .string{color:#7c3aed} .number{color:#34d399} .boolean{color:#f97316} .null{color:#ef4444}
    section.api{margin-bottom:10px;padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.02)}
    .api-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
    .status.ok{color:#16a34a} .status.err{color:#ef4444}
    .key-form{display:flex;gap:8px;align-items:center}
    input.k{background:transparent;border:1px dashed rgba(255,255,255,0.06);color:#cfe8ff;padding:6px;border-radius:6px;font-size:12px;width:260px}
    button.go{background:#7c3aed;border:none;color:white;padding:8px 12px;border-radius:6px;cursor:pointer}
  `;

  return `<!doctype html><html><head><meta charset="utf-8"><title>IP Quality ${VERSION} — ${ip}</title><style>${css}</style></head><body>
    <div class="wrap">
      <header>
        <h1>IP Quality ${VERSION} — ${ip}</h1>
        <form id="kform" class="key-form" onsubmit="return false;">
          <input id="kbox" class="k" placeholder="输入敏感 API Key (base64 JSON)">
          <button class="go" onclick="doFetch()">刷新 JSON</button>
        </form>
      </header>
      <div class="grid">
        <div class="panel"><h2>internal_json</h2>${internalHtml}</div>
        <div class="panel"><h2>原始 API 响应</h2>${apiBlocks}</div>
      </div>
    </div>
    <script>
      // 前端示例：localStorage 保存 key，刷新时调用 JSON 接口
      const keyStorageKey='ipq_keys';
      const kbox=document.getElementById('kbox');
      const saved=localStorage.getItem(keyStorageKey);
      if(saved) kbox.value=saved;
      async function doFetch(){
        try{
          const k=kbox.value.trim();
          if(k) localStorage.setItem(keyStorageKey,k);
          else localStorage.removeItem(keyStorageKey);
          const url=location.pathname.endsWith('.json')?location.pathname:location.pathname+'.json';
          const headers={};
          if(k) headers['X-API-KEYS']=k;
          const res=await fetch(url,{headers});
          const j=await res.json();
          const blob=new Blob([JSON.stringify(j,null,2)],{type:'application/json'});
          window.open(URL.createObjectURL(blob),'_blank');
        }catch(e){ alert('请求失败: '+e.message); }
      }
    </script>
  </body></html>`;
}

// ======== Worker 入口 ========
export default {
  async fetch(request){
    const url=new URL(request.url);
    const ipMatch=url.pathname.match(/^\/ip=(.+?)(\.json)?$/);
    const ip=ipMatch?.[1];
    const wantJSON=!!ipMatch?.[2];

    if(!ip || !isValidIP(ip)) return new Response(JSON.stringify({error:"Invalid IP"}),{status:400,headers:{"Content-Type":"application/json"}});

    // 获取 Header Key
    let keysHeader=request.headers.get("X-API-KEYS")||"{}";
    let keys={};
    try{ keys=JSON.parse(atob(keysHeader)); }catch{}

    const rawData = await processApis(ip, keys);
    const internal = buildInternalJSON(rawData);

    if(wantJSON) return new Response(JSON.stringify({internal, raw:rawData},null,2),{headers:{"Content-Type":"application/json;charset=utf-8"}});

    return new Response(renderHTML(ip, internal, rawData),{headers:{"Content-Type":"text/html;charset=utf-8"}});
  }
};
