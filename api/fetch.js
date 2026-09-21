// api/fetch.js
export default async function handler(req, res) {
  // 1. 允許你的前端跨域請求（CORS 標頭設定）
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // 正式上線可限制為你的 vercel 網址
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 如果是瀏覽器的預檢請求 (Preflight)，直接回傳 200
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. 設定你要爬取/抓取的 K-Monstar 目標 API 網址
  // 請把下方的網址替換成你原本在前端 fetch 的那個「真實 K-Monstar 資料網址」
  const TARGET_URL = 'https://k-monstar.com'; 

  try {
    // 由後端伺服器發出請求（伺服器端抓取資料不受瀏覽器 CORS 限制）
    const response = await fetch(TARGET_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`目標伺服器回應錯誤: ${response.status}`);
    }

    const data = await response.json();
    
    // 3. 將抓到的資料回傳給你的前端儀表板
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: '無法抓取目標資料', details: error.message });
  }
}
