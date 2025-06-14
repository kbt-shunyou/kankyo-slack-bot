const puppeteer = require('puppeteer');
const axios = require('axios');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('https://kankyo-ichiba.jp/kyusyu', { waitUntil: 'networkidle2' });
  await page.waitForSelector('table.tbl01', { timeout: 10000 });

  const data = await page.evaluate(() => {
    const table = document.querySelector('table.tbl01');
    if (!table) return '❌ 表が見つかりませんでした。';

    return Array.from(table.rows).map(row =>
      Array.from(row.cells).map(cell => cell.textContent.trim()).join(' | ')
    ).join('\n');
  });

  await browser.close();

  await axios.post(SLACK_WEBHOOK_URL, {
    text: `📊 九州エリア 環境市場（明日分）\nhttps://kankyo-ichiba.jp/kyusyu\n\`\`\`\n${data}\n\`\`\``
  });

  console.log("✅ Slackに送信しました！");
})();
