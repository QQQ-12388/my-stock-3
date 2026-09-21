// api/fetch.js
export const config = {
  runtime: 'edge', // 強制指定使用 Vercel Edge 環境，速度最快且最不易出錯
};

export default async function handler(req) {
  // 設定 CORS 標頭，允許你的前端讀取
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 處理瀏覽器的預檢請求 (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 🎯 K-Monstar 商品官網真實網址
  const TARGET_URL = 'https://kmonstar.com.tw';

  try {
    // 偽裝 Chrome 瀏覽器發出請求，繞過電商 408 阻擋
    const response = await fetch(TARGET_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8',
        'Cache-Control': 'no-cache',
      }
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `K-Monstar 回應錯誤，狀態碼: ${response.status}` }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const htmlText = await response.text();

    // 試圖判斷是否為 JSON，若不是則以 HTML 格式回傳
    let bodyData;
    try {
      bodyData = JSON.stringify(JSON.parse(htmlText));
    } catch (e) {
      bodyData = JSON.stringify({ mode: "html", content: htmlText });
    }

    return new Response(bodyData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: '後端抓取失敗', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
