#!/usr/bin/env node
// Harness for Task 1 — POST /api/upload
// Requires server running on localhost:3000 with default repository/ vault

const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const REPO_ROOT = path.resolve(__dirname, '../repository');
const ATTACHMENTS_DIR = path.join(REPO_ROOT, 'folder1', 'attachments');

let passed = 0;
let failed = 0;

function ok(label) { console.log(`✅ ${label}`); passed++; }
function fail(label, detail) { console.error(`❌ ${label}`, detail ?? ''); failed++; }

async function postFile(filename, content, targetDir = 'folder1', repo = '0') {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'application/octet-stream' }), filename);
  form.append('targetDir', targetDir);
  form.append('repo', repo);
  return fetch(`${BASE}/api/upload`, { method: 'POST', body: form });
}

async function cleanup() {
  try {
    const files = await fs.promises.readdir(ATTACHMENTS_DIR);
    for (const f of files) {
      if (f.startsWith('harness_')) {
        await fs.promises.unlink(path.join(ATTACHMENTS_DIR, f));
      }
    }
  } catch {}
}

async function run() {
  console.log('--- Task 1 Upload Harness ---');
  await cleanup();

  // AC-1: 基本上傳
  {
    const res = await postFile('harness_test.png', 'fake-image-data');
    const body = await res.json();
    if (res.status === 200 && body.filename === 'harness_test.png' && body.path === 'folder1/attachments/harness_test.png') {
      const exists = fs.existsSync(path.join(ATTACHMENTS_DIR, 'harness_test.png'));
      exists ? ok('AC-1: 基本上傳回傳正確路徑且檔案存在') : fail('AC-1: 檔案未寫入磁碟');
    } else {
      fail('AC-1: response 不符預期', JSON.stringify(body));
    }
  }

  // AC-2: 同名衝突自動改名
  {
    const res = await postFile('harness_test.png', 'fake-image-data-2');
    const body = await res.json();
    if (res.status === 200 && body.filename === 'harness_test_1.png') {
      const origExists = fs.existsSync(path.join(ATTACHMENTS_DIR, 'harness_test.png'));
      const newExists = fs.existsSync(path.join(ATTACHMENTS_DIR, 'harness_test_1.png'));
      origExists && newExists
        ? ok('AC-2: 衝突改名為 _1，原始檔案未被覆蓋')
        : fail('AC-2: 改名後檔案狀態異常');
    } else {
      fail('AC-2: 改名 response 不符預期', JSON.stringify(body));
    }
  }

  // AC-3: 路徑穿越防護
  {
    const res = await postFile('harness_evil.txt', 'evil', '../../etc');
    if (res.status === 400) {
      ok('AC-3: 路徑穿越回傳 400');
    } else {
      fail('AC-3: 路徑穿越未被阻擋', `status=${res.status}`);
    }
  }

  // AC-4: 缺少 file 欄位
  {
    const form = new FormData();
    form.append('targetDir', 'folder1');
    form.append('repo', '0');
    const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body: form });
    if (res.status === 400) {
      ok('AC-4: 缺少 file 欄位回傳 400');
    } else {
      fail('AC-4: 缺少 file 欄位未回傳 400', `status=${res.status}`);
    }
  }

  // AC-5: attachments/ 自動建立（使用未存在的子資料夾）
  {
    const newDir = path.join(REPO_ROOT, 'folder1', 'subfolder');
    const newAttachments = path.join(newDir, 'attachments');
    // 確保測試前 attachments 不存在
    try { await fs.promises.rm(newAttachments, { recursive: true }); } catch {}

    const res = await postFile('harness_new.txt', 'new-content', 'folder1/subfolder');
    const body = await res.json();
    if (res.status === 200) {
      const exists = fs.existsSync(path.join(newAttachments, 'harness_new.txt'));
      exists ? ok('AC-5: attachments/ 自動建立') : fail('AC-5: 檔案未寫入新建的 attachments/');
      // cleanup
      try { await fs.promises.rm(newAttachments, { recursive: true }); } catch {}
    } else {
      fail('AC-5: 上傳失敗', JSON.stringify(body));
    }
  }

  await cleanup();

  console.log(`\n結果: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
