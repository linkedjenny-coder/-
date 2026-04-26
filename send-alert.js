const https = require('https');

// ─────────────────────────────────────────
// 대장 아파트 목록 (25개 단지 + 우리집)
// ─────────────────────────────────────────
const MY_HOME = { region: '우리집', gu: '양천구', name: '신트리4단지', complexNo: '15774', pyeong: '20평' };

const APTS = [
  // 강남 4구
  { region: '강남 4구', gu: '서초구',   name: '래미안 원베일리',           complexNo: '137701', pyeong: '34평' },
  { region: '강남 4구', gu: '강남구',   name: '디에이치 퍼스티어 아이파크', complexNo: '135569', pyeong: '34평' },
  { region: '강남 4구', gu: '송파구',   name: '잠실 엘스',                 complexNo: '20033',  pyeong: '33평' },
  { region: '강남 4구', gu: '강동구',   name: '고덕 그라시움',             complexNo: '112237', pyeong: '33평' },
  // 마용성
  { region: '마용성',   gu: '용산구',   name: '나인원 한남',               complexNo: '131357', pyeong: '33평' },
  { region: '마용성',   gu: '성동구',   name: '아크로 서울포레스트',        complexNo: '128613', pyeong: '34평' },
  { region: '마용성',   gu: '마포구',   name: '마포 래미안 푸르지오',       complexNo: '105228', pyeong: '33평' },
  // 광역 중심
  { region: '광역 중심', gu: '영등포구', name: '아크로 타워 스퀘어',        complexNo: '126417', pyeong: '33평' },
  { region: '광역 중심', gu: '동작구',   name: '아크로 리버하임',           complexNo: '118797', pyeong: '34평' },
  { region: '광역 중심', gu: '광진구',   name: '구의 자이르네',             complexNo: '139030', pyeong: '33평' },
  { region: '광역 중심', gu: '종로구',   name: '경희궁 자이',               complexNo: '105546', pyeong: '33평' },
  { region: '광역 중심', gu: '중구',     name: '서울역 센트럴 자이',        complexNo: '118963', pyeong: '33평' },
  // 기타 자치구
  { region: '기타 자치구', gu: '양천구',   name: '목동 신시가지 7단지',        complexNo: '9720',   pyeong: '33평' },
  { region: '기타 자치구', gu: '강서구',   name: '마곡 엠밸리 7단지',         complexNo: '107239', pyeong: '33평' },
  { region: '기타 자치구', gu: '서대문구', name: 'DMC 파크뷰 자이',           complexNo: '105552', pyeong: '34평' },
  { region: '기타 자치구', gu: '동대문구', name: '래미안 크레시티',            complexNo: '105550', pyeong: '33평' },
  { region: '기타 자치구', gu: '성북구',   name: '래미안 길음 센터피스',       complexNo: '118271', pyeong: '33평' },
  { region: '기타 자치구', gu: '노원구',   name: '포레나 노원',               complexNo: '136793', pyeong: '34평' },
  { region: '기타 자치구', gu: '은평구',   name: '녹번역 e편한세상 캐슬',      complexNo: '130626', pyeong: '33평' },
  { region: '기타 자치구', gu: '관악구',   name: 'e편한세상 서울대입구',       complexNo: '131717', pyeong: '33평' },
  { region: '기타 자치구', gu: '구로구',   name: '신도림 디큐브시티',         complexNo: '101474', pyeong: '33평' },
  { region: '기타 자치구', gu: '금천구',   name: '금천 롯데캐슬 골드파크 1차', complexNo: '108823', pyeong: '33평' },
  { region: '기타 자치구', gu: '중랑구',   name: '사가정 센트럴 아이파크',     complexNo: '131723', pyeong: '33평' },
  { region: '기타 자치구', gu: '도봉구',   name: '북한산 아이파크',           complexNo: '104573', pyeong: '33평' },
  { region: '기타 자치구', gu: '강북구',   name: '송천 센트레빌',             complexNo: '104997', pyeong: '33평' },
];

// HTTP GET
function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : require('http');
    const req = mod.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// 네이버 부동산 호가 조회
async function fetchNaverPrice(complexNo) {
  const url = `https://m.land.naver.com/complex/getComplexArticleList?hscpNo=${complexNo}&tradTpCd=A1&order=prc&showR0=N&page=1&sameAddressGroup=false`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://m.land.naver.com/',
  };
  try {
    const data = await fetchUrl(url, headers);
    const articles = data?.result?.list || [];
    const filtered = articles.filter(a => {
      const area = parseFloat(a.spc2 || a.spc1 || 0);
      return area >= 60 && area <= 115;
    });
    if (filtered.length === 0 && articles.length > 0) {
      articles.sort((a, b) => parseFloat(a.spc2||0) - parseFloat(b.spc2||0));
      const a = articles[0];
      return { price: a.prc, area: a.spc2 };
    }
    filtered.sort((a, b) => parseInt(a.prc) - parseInt(b.prc));
    const best = filtered[0];
    return { price: best?.prc, area: best?.spc2 };
  } catch (e) {
    return null;
  }
}

function fmtPrice(manwon) {
  if (!manwon) return '정보없음';
  const n = parseInt(String(manwon).replace(/,/g, ''));
  if (isNaN(n)) return manwon;
  const eok = Math.floor(n / 10000);
  const cheon = Math.round((n % 10000) / 1000);
  if (eok === 0) return `${n.toLocaleString()}만`;
  if (cheon === 0) return `${eok}억`;
  return `${eok}억 ${cheon}천`;
}

function fmtChange(diff) {
  if (diff === null || diff === undefined) return '–';
  if (diff === 0) return '–';
  const sign = diff > 0 ? '+' : '';
  return `${sign}${Math.abs(diff).toLocaleString()}만`;
}

function fmtPct(current, past) {
  if (!current || !past) return '0.00%';
  const pct = ((current - past) / past) * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

// KV Storage
async function loadPrevPrices() {
  if (!process.env.KV_REST_API_URL) return {};
  try {
    const { kv } = await import('@vercel/kv');
    return (await kv.get('apt_prices')) || {};
  } catch { return {}; }
}

async function savePrices(prices) {
  if (!process.env.KV_REST_API_URL) return;
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set('apt_prices', prices);
  } catch {}
}

// Slack Webhook
function sendSlack(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// 메인 실행
async function main() {
  const WEBHOOK_URL = "https://hooks.slack.com/services/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";
  if (!WEBHOOK_URL) throw new Error('SLACK_WEBHOOK_URL 환경변수가 없습니다.');

  console.log('이전 가격 로드 중...');
  const prevPrices = await loadPrevPrices();
  const today = new Date().toISOString().slice(0, 10);

  console.log('호가 조회 시작...');
  const allApts = [MY_HOME, ...APTS];
  const results = [];

  for (const apt of allApts) {
    const info = await fetchNaverPrice(apt.complexNo);
    const currentPrice = info?.price ? parseInt(String(info.price).replace(/,/g, '')) : null;

    const prev = prevPrices[apt.complexNo] || {};
    const prevDay = prev.day || null;
    const prev2w = prev.week2 || null;
    const prevMonth = prev.month || null;
    const prev3m = prev.month3 || null;

    const change1d = (currentPrice && prevDay) ? currentPrice - prevDay : null;
    const change2w = (currentPrice && prev2w) ? currentPrice - prev2w : null;
    const change1m = (currentPrice && prevMonth) ? currentPrice - prevMonth : null;
    const change3m = (currentPrice && prev3m) ? currentPrice - prev3m : null;

    results.push({ ...apt, currentPrice, change1d, change2w, change1m, change3m });

    if (currentPrice) {
      const now = Date.now();
      const day1 = 24 * 3600 * 1000;
      prevPrices[apt.complexNo] = {
        day: currentPrice,
        week2: prev.week2UpdatedAt && (now - new Date(prev.week2UpdatedAt).getTime() < 14 * day1) ? prev.week2 : currentPrice,
        week2UpdatedAt: prev.week2UpdatedAt || today,
        month: prev.monthUpdatedAt && (now - new Date(prev.monthUpdatedAt).getTime() < 30 * day1) ? prev.month : currentPrice,
        monthUpdatedAt: prev.monthUpdatedAt || today,
        month3: prev.month3UpdatedAt && (now - new Date(prev.month3UpdatedAt).getTime() < 90 * day1) ? prev.month3 : currentPrice,
        month3UpdatedAt: prev.month3UpdatedAt || today,
      };
      if (!prev.week2UpdatedAt || (now - new Date(prev.week2UpdatedAt).getTime() >= 14 * day1)) {
        prevPrices[apt.complexNo].week2 = currentPrice;
        prevPrices[apt.complexNo].week2UpdatedAt = today;
      }
      if (!prev.monthUpdatedAt || (now - new Date(prev.monthUpdatedAt).getTime() >= 30 * day1)) {
        prevPrices[apt.complexNo].month = currentPrice;
        prevPrices[apt.complexNo].monthUpdatedAt = today;
      }
      if (!prev.month3UpdatedAt || (now - new Date(prev.month3UpdatedAt).getTime() >= 90 * day1)) {
        prevPrices[apt.complexNo].month3 = currentPrice;
        prevPrices[apt.complexNo].month3UpdatedAt = today;
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }

  await savePrices(prevPrices);

  // Slack 메시지 구성
  const now = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  const myHomeData = results.find(r => r.name === MY_HOME.name);
  const aptResults = results.filter(r => r.name !== MY_HOME.name);

  const upCount = aptResults.filter(r => r.change1d > 0).length;
  const downCount = aptResults.filter(r => r.change1d < 0).length;
  const flatCount = aptResults.filter(r => r.change1d === 0 || r.change1d === null).length;
  const avgChange = aptResults.filter(r => r.change1d !== null).reduce((s, r) => s + r.change1d, 0) / aptResults.filter(r => r.change1d !== null).length || 0;

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: '🏠 서울 대장 아파트 호가 대시보드', emoji: true } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${now} · 30평대 기준 · 네이버 부동산` }] },
    { type: 'divider' },
  ];

  // 우리집 섹션
  if (myHomeData && myHomeData.currentPrice) {
    const mh = myHomeData;
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🏡 우리집 · ${mh.gu} ${mh.name} (${mh.pyeong})*\n` +
              `호가: *${fmtPrice(mh.currentPrice)}* | 전일: ${fmtChange(mh.change1d)} (${fmtPct(mh.currentPrice, mh.currentPrice - mh.change1d)}) | ` +
              `2주전: ${fmtChange(mh.change2w)} (${fmtPct(mh.currentPrice, mh.currentPrice - mh.change2w)}) | ` +
              `한달전: ${fmtChange(mh.change1m)} (${fmtPct(mh.currentPrice, mh.currentPrice - mh.change1m)}) | ` +
              `세달전: ${fmtChange(mh.change3m)} (${fmtPct(mh.currentPrice, mh.currentPrice - mh.change3m)})`
      }
    });
    blocks.push({ type: 'divider' });
  }

  // 요약
  blocks.push({
    type: 'section',
    fields: [
      { type: 'mrkdwn', text: `*전체 단지*\n${aptResults.length}개` },
      { type: 'mrkdwn', text: `*상승*\n${upCount}개` },
      { type: 'mrkdwn', text: `*하락*\n${downCount}개` },
      { type: 'mrkdwn', text: `*평균 변동(전일)*\n${avgChange > 0 ? '+' : ''}${Math.round(avgChange).toLocaleString()}만` },
    ]
  });
  blocks.push({ type: 'divider' });

  // 권역별
  const regionOrder = ['강남 4구', '마용성', '광역 중심', '기타 자치구'];
  for (const region of regionOrder) {
    const rows = aptResults.filter(r => r.region === region);
    if (!rows.length) continue;

    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*📍 ${region}*` } });

    const tableRows = rows.map(r => {
      const d1 = fmtChange(r.change1d);
      const p1 = fmtPct(r.currentPrice, r.currentPrice - r.change1d);
      const d2 = fmtChange(r.change2w);
      const p2 = fmtPct(r.currentPrice, r.currentPrice - r.change2w);
      const d1m = fmtChange(r.change1m);
      const p1m = fmtPct(r.currentPrice, r.currentPrice - r.change1m);
      const d3m = fmtChange(r.change3m);
      const p3m = fmtPct(r.currentPrice, r.currentPrice - r.change3m);

      return `*${r.gu}* ${r.name} (${r.pyeong})\n` +
             `　호가: *${fmtPrice(r.currentPrice)}* | 전일: ${d1} (${p1}) | 2주전: ${d2} (${p2}) | 한달전: ${d1m} (${p1m}) | 세달전: ${d3m} (${p3m})`;
    }).join('\n\n');

    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: tableRows } });
    blocks.push({ type: 'divider' });
  }

  // TOP3
  const top3 = aptResults.filter(r => r.change1d > 0).sort((a, b) => b.change1d - a.change1d).slice(0, 3);
  if (top3.length) {
    const topText = top3.map((r, i) =>
      `${['🥇','🥈','🥉'][i]} *${r.name}* (${r.gu}) ${fmtChange(r.change1d)} · ${fmtPct(r.currentPrice, r.currentPrice - r.change1d)}`
    ).join('\n');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*🔥 전일 상승 TOP ${top3.length}*\n${topText}` } });
  }

  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: '매일 오전 7:00 자동 발송 · 네이버 부동산 호가 기준' }] });

  console.log('Slack 발송 중...');
  await sendSlack(WEBHOOK_URL, { blocks });
  console.log('✅ 완료!');
  return results;
}

// Vercel Serverless Function
module.exports = async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const results = await main();
    res.status(200).json({ ok: true, count: results?.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
