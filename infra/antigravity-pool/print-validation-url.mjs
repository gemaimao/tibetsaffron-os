import fs from 'node:fs';
import { ensureFreshToken } from './pool.mjs';

const pool = JSON.parse(fs.readFileSync('/Users/longhl/.antigravity-pool/accounts.json', 'utf8'));
const acct = pool.accounts.find(a => a.email === 'longhulin60@gmail.com');
const token = await ensureFreshToken(acct);

const res = await fetch('https://daily-cloudcode-pa.googleapis.com/v1internal:streamGenerateContent?alt=sse', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'User-Agent': 'antigravity/cli/1.1.23 (aidev_client; os_type=linux; arch=amd64; cl=974125021; auth_method=consumer)'
  },
  body: JSON.stringify({
    project: acct.project_id || 'aicode-consumers',
    model: 'gemini-3.8-flash-low',
    request: { contents: [{ role: 'user', parts: [{ text: 'ping' }] }] },
    requestType: 'AGENT',
    userAgent: 'ANTIGRAVITY',
    requestId: 'test-' + Date.now()
  })
});

const data = await res.json();
const details = data.error?.details?.[0]?.metadata;
if (details?.validation_url) {
  console.log('\n======================================================');
  console.log('🔗 请在登录了 longhulin60@gmail.com 的浏览器中打开此验证专属链接：');
  console.log('======================================================\n');
  console.log(details.validation_url);
  console.log('\n======================================================\n');
} else {
  console.log('Full response:', JSON.stringify(data, null, 2));
}
