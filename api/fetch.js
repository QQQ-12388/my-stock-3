export default async function handler(req, res) {
  // 處理前端的 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 🎯 修改點一：確保網址是直接指向該商品的真實網址
  const TARGET_URL = 'https://kmonstar.com.tw'; 

  try {
    // 🎯 修改點二：偽裝成完整的 Chrome 瀏覽器標頭，繞過安全防護與 408 阻擋
    const response = await fetch(TARGET_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand)";v="24", "Google Chrome";v="122"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`K-Monstar 伺服器拒絕回應，狀態碼: ${response.status}`);
    }

    // 🎯 修改點三：因為對方可能直接回傳網頁 HTML 而不是 JSON API，我們先以文字收錄
    const htmlText = await response.text();
    
    // 如果對方是純 JSON API，可以直接嘗試 parse
    try {
      const jsonData = JSON.parse(htmlText);
      return res.status(200).json(jsonData);
    } catch (e) {
      // 如果回傳的是整頁網頁 HTML，後端可以直接把網頁文字丟給前端處理
      return res.status(200).json({ mode: "html", content: htmlText });
    }

  } catch (error) {
    return res.status(500).json({ error: '代理伺服器抓取超時或失敗', details: error.message });
  }
}
