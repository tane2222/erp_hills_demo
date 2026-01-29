// =================================================================
// 設定
// =================================================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 

let currentToken = ""; 
let selectedDate = new Date();
let currentConfig = []; 

// 採用データ (初期値)
let recruitmentData = [
    { label: 'グッピー', value: 5, color: '#3b82f6', url: 'https://www.guppy.jp/' },
    { label: 'ジョブメドレー', value: 3, color: '#10b981', url: 'https://job-medley.com/' },
    { label: 'Indeed', value: 2, color: '#f59e0b', url: 'https://jp.indeed.com/' },
    { label: '紹介会社', value: 2, color: '#8b5cf6', url: '' }
];

let recruitKPI = { applicants: 12, hires: 2, cpa: 45, rate: 60 };

let recruitPipeline = [
    { id: 's1', name: '未対応 (New)', count: 3, color: '#64748b', candidates: ['DH Aさん (グッピー)', 'DA Bさん (Indeed)'] },
    { id: 's2', name: '日程調整中', count: 5, color: '#3b82f6', candidates: ['Dr C先生 (紹介)'] },
    { id: 's3', name: '見学・面接', count: 2, color: '#f59e0b', candidates: ['DH Dさん (本日14:00)'] },
    { id: 's4', name: '内定・承諾', count: 1, color: '#10b981', candidates: ['受付 Eさん (4/1入社)'] }
];

let jobPostings = [
    { title: '歯科医師 (常勤)', sub: '経験3年以上 / 分院長候補', status: '募集中' },
    { title: '歯科衛生士 (パート)', sub: '午後勤務できる方', status: '募集中' },
    { title: '歯科助手・受付', sub: '新卒可', status: '充足停止' }
];

// =================================================================
// アプリケーション開始処理
// =================================================================
window.startApp = function(token) {
    currentToken = token; 
    initMenu();
    initDate();
    initMonthSelector();
    initSettingsModal();
    initUploadModal(); 
    initInputModal(); 
    initRecruitmentFunctions(); 
    updateRecruitNews(); 
    fetchData('getSales'); 
};

// =================================================================
// 画面UI制御
// =================================================================
function initDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    const dateElem = document.getElementById('current-date');
    if(dateElem) dateElem.textContent = now.toLocaleDateString('ja-JP', options);
}

function initMonthSelector() {
    const picker = document.getElementById('month-picker');
    if (!picker) return;
    updatePickerValue();
    picker.addEventListener('change', (e) => {
        if(e.target.value) {
            selectedDate = new Date(e.target.value + '-01');
            fetchData('getSales');
        }
    });
    const prevBtn = document.getElementById('prev-month-btn');
    if(prevBtn) prevBtn.addEventListener('click', () => { selectedDate.setMonth(selectedDate.getMonth() - 1); updatePickerValue(); fetchData('getSales'); });
    const nextBtn = document.getElementById('next-month-btn');
    if(nextBtn) nextBtn.addEventListener('click', () => { selectedDate.setMonth(selectedDate.getMonth() + 1); updatePickerValue(); fetchData('getSales'); });
}

function updatePickerValue() {
    const picker = document.getElementById('month-picker');
    if (!picker) return;
    const y = selectedDate.getFullYear();
    const m = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
    picker.value = `${y}-${m}`;
}

function getSelectedMonthString() {
    const y = selectedDate.getFullYear();
    const m = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
    return `${y}/${m}`;
}

// メニュー切り替えロジック
function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('page-title');
    const topBarControls = document.querySelector('.top-bar-controls');

    const pageIds = [
        'page-dashboard', 'page-goals', 'page-accounting', 
        'page-phr', 'page-satisfaction', 'page-marketing', 
        'page-recruitment', 'page-engagement'
    ];

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const link = item.querySelector('a');
            const target = link.dataset.target; 
            const text = link.querySelector('span').textContent;
            
            if(pageTitle) pageTitle.textContent = text;

            // ページ表示切り替え
            pageIds.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.style.display = 'none';
            });

            // ヘッダーコントロール制御
            if(topBarControls) {
                topBarControls.style.visibility = (target === 'dashboard') ? 'visible' : 'hidden';
            }

            // ターゲットページ表示
            const targetPage = document.getElementById('page-' + target);
            if (targetPage) targetPage.style.display = 'block';

            // データ取得トリガー
            if (target === 'dashboard') fetchData('getSales');
            else if (target === 'phr') fetchData('getPhr');
            else if (target === 'recruitment') renderRecruitmentPage(); 
            else if (target === 'accounting') renderDummyChart('accountingChart', 'bar', '月次損益', ['4月', '5月', '6月', '7月', '8月', '9月'], [450, 480, 420, 500, 450, 470], 'rgba(59, 130, 246, 0.6)');
            else if (target === 'marketing') renderDummyChart('marketingChart', 'doughnut', '来院経路', ['HP', 'Google', '紹介', '看板', 'その他'], [30, 20, 15, 25, 10], ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8']);
            else if (target === 'engagement') renderDummyChart('engagementChart', 'line', '満足度推移', ['4月', '5月', '6月', '7月', '8月', '9月'], [20, 22, 21, 24, 23, 24], '#8b5cf6');
            else if (target === 'ai-agent') alert('AIエージェント機能は現在準備中です。');
        });
    });
}

// =================================================================
// 採用ページロジック
// =================================================================
function initRecruitmentFunctions() {
    // 媒体編集 (ここがリンク集の編集も兼ねる)
    const mediaModal = document.getElementById('recruitment-edit-modal');
    // グラフの編集ボタン
    document.getElementById('edit-recruitment-btn').addEventListener('click', () => {
        renderMediaEditList();
        mediaModal.style.display = 'flex';
    });
    // ★追加: リンクカードの編集ボタンも同じモーダルを開く
    document.getElementById('btn-edit-media-links').addEventListener('click', () => {
        renderMediaEditList();
        mediaModal.style.display = 'flex';
    });

    document.getElementById('close-recruitment-btn').addEventListener('click', () => mediaModal.style.display = 'none');
    document.getElementById('add-recruitment-btn').addEventListener('click', () => {
        document.getElementById('recruitment-list').appendChild(createMediaRow('', 0, '', '#94a3b8'));
    });
    document.getElementById('save-recruitment-btn').addEventListener('click', () => {
        saveMediaData();
        mediaModal.style.display = 'none';
        renderRecruitmentPage();
    });

    // KPI編集
    const kpiModal = document.getElementById('recruit-kpi-modal');
    document.getElementById('btn-edit-recruit-kpi').addEventListener('click', () => {
        document.getElementById('edit-kpi-applicants').value = recruitKPI.applicants;
        document.getElementById('edit-kpi-hires').value = recruitKPI.hires;
        document.getElementById('edit-kpi-cpa').value = recruitKPI.cpa;
        document.getElementById('edit-kpi-rate').value = recruitKPI.rate;
        kpiModal.style.display = 'flex';
    });
    document.getElementById('close-kpi-modal').addEventListener('click', () => kpiModal.style.display = 'none');
    document.getElementById('save-kpi-btn').addEventListener('click', () => {
        recruitKPI.applicants = document.getElementById('edit-kpi-applicants').value;
        recruitKPI.hires = document.getElementById('edit-kpi-hires').value;
        recruitKPI.cpa = document.getElementById('edit-kpi-cpa').value;
        recruitKPI.rate = document.getElementById('edit-kpi-rate').value;
        renderRecruitKPI();
        kpiModal.style.display = 'none';
    });

    // パイプライン編集
    const pipeModal = document.getElementById('pipeline-modal');
    document.getElementById('btn-edit-pipeline').addEventListener('click', () => {
        renderPipelineEditList();
        pipeModal.style.display = 'flex';
    });
    document.getElementById('close-pipeline-modal').addEventListener('click', () => pipeModal.style.display = 'none');
    document.getElementById('save-pipeline-btn').addEventListener('click', () => {
        savePipelineData();
        renderPipeline();
        pipeModal.style.display = 'none';
    });

    // 募集要項編集
    const jobModal = document.getElementById('job-modal');
    document.getElementById('btn-edit-jobs').addEventListener('click', () => {
        renderJobEditList();
        jobModal.style.display = 'flex';
    });
    document.getElementById('close-job-modal').addEventListener('click', () => jobModal.style.display = 'none');
    document.getElementById('add-job-btn').addEventListener('click', () => {
        document.getElementById('job-edit-list').insertAdjacentHTML('beforeend', createJobEditRow('', '', '募集中'));
    });
    document.getElementById('save-job-btn').addEventListener('click', () => {
        saveJobData();
        renderJobList();
        jobModal.style.display = 'none';
    });
}

function renderRecruitmentPage() {
    renderRecruitmentChart();
    renderRecruitKPI();
    renderPipeline();
    renderJobList();
    renderMediaLinks();
    updateRecruitNews();
}

function updateRecruitNews() {
    const newsData = [
        { text: "2026年診療報酬改定に向け、DHの有効求人倍率が高止まり傾向にあります。", url: "https://www.mhlw.go.jp/" },
        { text: "都市部では紹介会社経由の採用コストが平均50万円を超えています。", url: "https://www.google.com/search?q=歯科採用コスト" },
        { text: "若手DHへのアピールには、Instagramのリール動画が効果的です。", url: "https://www.instagram.com/" }
    ];
    const elemText = document.getElementById('recruitment-news-text');
    const elemLink = document.getElementById('recruitment-news-link');
    if(elemText && elemLink && !elemText.dataset.updated) {
        const randomNews = newsData[Math.floor(Math.random() * newsData.length)];
        elemText.textContent = randomNews.text;
        elemLink.href = randomNews.url;
        elemText.dataset.updated = "true";
    }
}

function renderRecruitKPI() {
    document.getElementById('disp-recruit-count').innerHTML = `${recruitKPI.applicants}<span style="font-size:14px; color:#999; font-weight:normal;">件</span> / ${recruitKPI.hires}<span style="font-size:14px; color:#999; font-weight:normal;">名</span>`;
    document.getElementById('disp-recruit-cpa').innerHTML = `${recruitKPI.cpa}<span style="font-size:14px; color:#999; font-weight:normal;">万円</span>`;
    document.getElementById('disp-recruit-rate').innerHTML = `${recruitKPI.rate}<span style="font-size:14px; color:#999; font-weight:normal;">%</span>`;
}

function renderPipeline() {
    const container = document.getElementById('pipeline-container');
    if(!container) return;
    container.innerHTML = '';
    recruitPipeline.forEach(stage => {
        let candidatesHtml = '';
        stage.candidates.forEach(c => {
            candidatesHtml += `<div style="background:white; padding:10px; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-bottom:8px; font-size:13px; border-left:3px solid ${stage.color};">${c}</div>`;
        });
        const html = `
            <div class="card" style="padding: 15px; background: #f8fafc; border-top: 4px solid ${stage.color};">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <h4 style="font-size:14px; color:#333;">${stage.name}</h4>
                    <span style="background:${stage.color}; color:white; padding:2px 8px; border-radius:10px; font-size:11px;">${stage.count}</span>
                </div>
                ${candidatesHtml}
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderJobList() {
    const container = document.getElementById('job-list-container');
    if(!container) return;
    container.innerHTML = '';
    jobPostings.forEach(job => {
        const bg = job.status === '募集中' ? '#eff6ff' : '#f3f4f6';
        const col = job.status === '募集中' ? '#3b82f6' : '#64748b';
        const html = `
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px;">
                <div>
                    <div style="font-weight: bold; font-size: 14px;">${job.title}</div>
                    <div style="font-size: 12px; color: #999;">${job.sub}</div>
                </div>
                <span style="background: ${bg}; color: ${col}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold;">${job.status}</span>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderMediaLinks() {
    const container = document.getElementById('recruit-media-links-card-body');
    if(!container) return;
    container.innerHTML = '';
    recruitmentData.forEach(media => {
        if(media.url) {
            const html = `
                <a href="${media.url}" target="_blank" style="text-decoration:none; background:${media.color}; color:white; padding:8px 15px; border-radius:20px; font-size:12px; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.1); opacity:0.9; transition:all 0.2s; display:inline-flex; align-items:center; gap:5px;">
                    ${media.label} <i class="fa-solid fa-external-link-alt" style="font-size:10px;"></i>
                </a>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }
    });
}

function renderRecruitmentChart() {
    const canvas = document.getElementById('recruitmentChart');
    if (!canvas) return;
    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();
    const ctx = canvas.getContext('2d');
    const labels = recruitmentData.map(d => d.label);
    const data = recruitmentData.map(d => d.value);
    const backgroundColors = recruitmentData.map(d => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, d.color); 
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)'); 
        return gradient;
    });
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: '応募数', data: data, backgroundColor: backgroundColors, borderWidth: 0, borderRadius: 5, barPercentage: 0.6 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }
    });
}

// 編集ヘルパー関数 (変更なし)
function renderMediaEditList() {
    const listArea = document.getElementById('recruitment-list');
    listArea.innerHTML = '';
    recruitmentData.forEach(item => {
        listArea.appendChild(createMediaRow(item.label, item.value, item.url, item.color));
    });
}
function createMediaRow(label, val, url, color) {
    const div = document.createElement('div');
    div.className = 'media-edit-row';
    div.style.cssText = "display:flex; gap:5px; margin-bottom:5px; align-items:center;";
    div.innerHTML = `
        <input type="text" value="${label}" class="edit-label" style="border:1px solid #ddd; padding:5px; border-radius:4px; flex:1;" placeholder="媒体名">
        <input type="number" value="${val}" class="edit-val" style="border:1px solid #ddd; padding:5px; border-radius:4px; width:50px;" placeholder="数">
        <input type="text" value="${url || ''}" class="edit-url" style="border:1px solid #ddd; padding:5px; border-radius:4px; flex:1;" placeholder="URL">
        <input type="color" value="${color}" class="edit-color" style="border:none; width:30px; height:30px; cursor:pointer;">
        <button class="btn-del" style="border:none; background:none; color:#e02424; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
    `;
    div.querySelector('.btn-del').addEventListener('click', () => div.remove());
    return div;
}
function saveMediaData() {
    const rows = document.querySelectorAll('.media-edit-row');
    const newData = [];
    rows.forEach(row => {
        const label = row.querySelector('.edit-label').value;
        const val = Number(row.querySelector('.edit-val').value);
        const url = row.querySelector('.edit-url').value;
        const col = row.querySelector('.edit-color').value;
        if(label) newData.push({ label: label, value: val, color: col, url: url });
    });
    recruitmentData = newData;
}

function renderPipelineEditList() {
    const container = document.getElementById('pipeline-edit-list');
    container.innerHTML = '';
    recruitPipeline.forEach((stage, index) => {
        container.innerHTML += `
            <div class="pipe-edit-row" style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                <div style="font-weight:bold; margin-bottom:5px;">${stage.name}</div>
                <div style="display:flex; gap:10px; margin-bottom:5px;">
                    <label>人数:</label><input type="number" class="pp-count" value="${stage.count}" style="width:50px; border:1px solid #ddd;">
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <label>候補者 (カンマ区切り):</label>
                    <textarea class="pp-cands" style="width:100%; border:1px solid #ddd; height:50px;">${stage.candidates.join(',')}</textarea>
                </div>
            </div>
        `;
    });
}
function savePipelineData() {
    const rows = document.querySelectorAll('.pipe-edit-row');
    rows.forEach((row, i) => {
        recruitPipeline[i].count = row.querySelector('.pp-count').value;
        const txt = row.querySelector('.pp-cands').value;
        recruitPipeline[i].candidates = txt ? txt.split(',') : [];
    });
}

function renderJobEditList() {
    const container = document.getElementById('job-edit-list');
    container.innerHTML = '';
    jobPostings.forEach(job => {
        container.insertAdjacentHTML('beforeend', createJobEditRow(job.title, job.sub, job.status));
    });
}
function createJobEditRow(title, sub, status) {
    return `
        <div class="job-row" style="display:flex; gap:5px; margin-bottom:10px; align-items:center;">
            <div style="flex:1;">
                <input type="text" class="job-title" value="${title}" placeholder="職種" style="width:100%; border:1px solid #ddd; margin-bottom:2px;">
                <input type="text" class="job-sub" value="${sub}" placeholder="詳細" style="width:100%; border:1px solid #ddd; font-size:11px;">
            </div>
            <select class="job-status" style="border:1px solid #ddd;">
                <option value="募集中" ${status==='募集中'?'selected':''}>募集中</option>
                <option value="充足停止" ${status==='充足停止'?'selected':''}>停止中</option>
            </select>
            <button onclick="this.parentElement.remove()" style="border:none; color:red; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;
}
function saveJobData() {
    const rows = document.querySelectorAll('.job-row');
    const newData = [];
    rows.forEach(row => {
        const title = row.querySelector('.job-title').value;
        const sub = row.querySelector('.job-sub').value;
        const status = row.querySelector('.job-status').value;
        if(title) newData.push({ title, sub, status });
    });
    jobPostings = newData;
}

// 簡易グラフ描画 (他ページ)
function renderDummyChart(canvasId, type, label, labels, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();
    new Chart(canvas, {
        type: type,
        data: { labels: labels, datasets: [{ label: label, data: data, backgroundColor: color, borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 既存機能 (変更なし)
function initSettingsModal() { const modal = document.getElementById('settings-modal'); const openBtn = document.getElementById('open-settings-btn'); const closeBtn = document.getElementById('close-settings-btn'); const saveBtn = document.getElementById('save-settings-btn'); const addBtn = document.getElementById('add-setting-btn'); if(openBtn) openBtn.addEventListener('click', () => { renderSettingsList(); modal.style.display = 'flex'; }); if(closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; }); if(saveBtn) saveBtn.addEventListener('click', saveSettings); if(addBtn) addBtn.addEventListener('click', addSettingItem); }
function renderSettingsList() { const list = document.getElementById('settings-list'); list.innerHTML = ''; currentConfig.forEach((item, index) => { const div = document.createElement('div'); div.style.cssText = "display:flex; align-items:center; padding:10px; border-bottom:1px solid #f0f0f0; background:white; gap:10px;"; div.innerHTML = ` <div style="color:#ccc; cursor:grab; font-size:14px;"><i class="fa-solid fa-bars"></i></div> <div style="flex:1;"> <div style="display:flex; gap:5px; margin-bottom:4px;"> <input type="text" class="setting-label" value="${item.label}" data-index="${index}" placeholder="表示名" style="border:1px solid #ddd; padding:4px 8px; border-radius:4px; font-weight:bold; width:100%;"> </div> <div style="display:flex; align-items:center; gap:5px; font-size:11px; color:#888;"> <span>Key:</span><input type="text" class="setting-key" value="${item.key}" data-index="${index}" placeholder="列名" style="border:none; background:#f9f9f9; padding:2px 4px; border-radius:3px; color:#666; width:100px;"> <span>Icon:</span><input type="text" class="setting-icon" value="${item.icon}" data-index="${index}" placeholder="fa-xx" style="border:none; background:#f9f9f9; padding:2px 4px; border-radius:3px; color:#666; width:80px;"> </div> </div> <select class="setting-pos" data-index="${index}" style="padding:5px; border:1px solid #ddd; border-radius:4px; font-size:12px;"> <option value="top" ${item.position === 'top' ? 'selected' : ''}>上段</option> <option value="sub" ${item.position === 'sub' ? 'selected' : ''}>下段</option> <option value="hidden" ${item.position === 'hidden' ? 'selected' : ''}>非表示</option> </select> <div style="display:flex; flex-direction:column; gap:2px;"> <button onclick="moveItem(${index}, -1)" style="border:none; background:none; cursor:pointer; color:#888; font-size:10px;">▲</button> <button onclick="moveItem(${index}, 1)" style="border:none; background:none; cursor:pointer; color:#888; font-size:10px;">▼</button> </div> <button onclick="deleteSettingItem(${index})" style="border:none; background:none; cursor:pointer; color:#e02424; margin-left:5px; font-size:14px;"><i class="fa-solid fa-trash-can"></i></button> `; list.appendChild(div); }); }
function addSettingItem() { currentConfig.push({ key: 'new_column', label: '新しい項目', icon: 'fa-circle', color: 'blue', format: 'number', position: 'sub' }); renderSettingsList(); const list = document.getElementById('settings-list'); setTimeout(() => list.scrollTop = list.scrollHeight, 0); }
window.deleteSettingItem = function(index) { if(confirm('削除しますか？')) { currentConfig.splice(index, 1); renderSettingsList(); } };
window.moveItem = function(index, direction) { if (index + direction < 0 || index + direction >= currentConfig.length) return; const temp = currentConfig[index]; currentConfig[index] = currentConfig[index + direction]; currentConfig[index + direction] = temp; renderSettingsList(); };
async function saveSettings() { const list = document.getElementById('settings-list'); const rows = list.children; const newConfig = []; for(let i=0; i<rows.length; i++) { const labelInput = rows[i].querySelector('.setting-label'); const keyInput = rows[i].querySelector('.setting-key'); const iconInput = rows[i].querySelector('.setting-icon'); const posSelect = rows[i].querySelector('.setting-pos'); const base = currentConfig[i]; newConfig.push({ key: keyInput.value.trim(), label: labelInput.value.trim(), icon: iconInput.value.trim(), color: base.color || 'blue', format: base.format || 'number', position: posSelect.value }); } const saveBtn = document.getElementById('save-settings-btn'); saveBtn.textContent = "保存中..."; saveBtn.disabled = true; try { const response = await fetch(GAS_API_URL, { method: "POST", mode: "cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ token: currentToken, action: 'updateSettings', settings: newConfig }) }); const jsonData = await response.json(); if(jsonData.success) { alert('設定を保存しました'); document.getElementById('settings-modal').style.display = 'none'; fetchData('getSales'); } else { alert('保存エラー: ' + jsonData.message); } } catch(e) { console.error(e); alert('通信エラー'); } finally { saveBtn.textContent = "保存して反映"; saveBtn.disabled = false; } }
function initUploadModal() { const modal = document.getElementById('upload-modal'); const openBtn = document.getElementById('open-upload-btn'); const closeBtn = document.getElementById('close-upload-btn'); const dropArea = document.getElementById('drop-area'); const fileInput = document.getElementById('file-input'); const executeBtn = document.getElementById('upload-execute-btn'); const previewArea = document.getElementById('preview-area'); const fileName = document.getElementById('file-name'); let selectedFile = null; if(openBtn) openBtn.addEventListener('click', () => modal.style.display = 'flex'); if(closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; resetUploadForm(); }); dropArea.addEventListener('click', () => fileInput.click()); dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.style.borderColor = '#3b82f6'; dropArea.style.background = '#eff6ff'; }); dropArea.addEventListener('dragleave', () => { dropArea.style.borderColor = '#ccc'; dropArea.style.background = '#fafafa'; }); dropArea.addEventListener('drop', (e) => { e.preventDefault(); dropArea.style.borderColor = '#ccc'; dropArea.style.background = '#fafafa'; if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); }); fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); }); function handleFile(file) { selectedFile = file; dropArea.style.display = 'none'; previewArea.style.display = 'block'; fileName.textContent = `${file.name} (${(file.size/1024).toFixed(1)} KB)`; executeBtn.disabled = false; executeBtn.style.background = 'var(--accent-blue)'; executeBtn.style.cursor = 'pointer'; } function resetUploadForm() { selectedFile = null; fileInput.value = ''; dropArea.style.display = 'block'; previewArea.style.display = 'none'; executeBtn.disabled = true; executeBtn.style.background = '#ccc'; executeBtn.textContent = "AI解析スタート"; } const compressImage = (file) => { return new Promise((resolve, reject) => { const MAX_WIDTH = 1024; const MAX_HEIGHT = 1024; const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = (event) => { const img = new Image(); img.src = event.target.result; img.onload = () => { let width = img.width; let height = img.height; if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } } const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); const dataUrl = canvas.toDataURL('image/jpeg', 0.8); resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' }); }; img.onerror = reject; }; reader.onerror = reject; }); }; const readPdf = (file) => { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve({ base64: reader.result.split(',')[1], mimeType: file.type }); reader.onerror = reject; }); }; executeBtn.addEventListener('click', async () => { if (!selectedFile) return; executeBtn.textContent = "送信中..."; executeBtn.disabled = true; try { let fileData = null; if (selectedFile.type.startsWith('image/')) { fileData = await compressImage(selectedFile); } else { fileData = await readPdf(selectedFile); } executeBtn.textContent = "AI解析中..."; const response = await fetch(GAS_API_URL, { method: "POST", mode: "cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ token: currentToken, action: 'importReport', fileData: fileData.base64, mimeType: fileData.mimeType }) }); const jsonData = await response.json(); if (jsonData.success) { alert('インポート完了！\n' + JSON.stringify(jsonData.data, null, 2)); modal.style.display = 'none'; resetUploadForm(); fetchData('getSales'); } else { alert(`エラー: ${jsonData.message}\n(詳細: ${jsonData.error || ''})`); resetUploadForm(); } } catch (error) { console.error(error); alert('通信エラー: ' + error.message); resetUploadForm(); } }); }
function initInputModal() { const modal = document.getElementById('input-modal'); const openBtn = document.getElementById('open-input-btn'); const closeBtn = document.getElementById('close-input-btn'); const saveBtn = document.getElementById('save-input-btn'); const dateInput = document.getElementById('input-target-date'); const formContainer = document.getElementById('input-form-container'); if(openBtn) { openBtn.addEventListener('click', () => { const today = new Date(); let defaultDate = new Date(selectedDate); if (today.getMonth() === selectedDate.getMonth() && today.getFullYear() === selectedDate.getFullYear()) { defaultDate = today; } const y = defaultDate.getFullYear(); const m = ('0' + (defaultDate.getMonth() + 1)).slice(-2); const d = ('0' + defaultDate.getDate()).slice(-2); dateInput.value = `${y}-${m}-${d}`; renderInputForm(); modal.style.display = 'flex'; }); } if(closeBtn) { closeBtn.addEventListener('click', () => { modal.style.display = 'none'; }); } function renderInputForm() { formContainer.innerHTML = ''; currentConfig.forEach(item => { if (item.key === 'cancel_rate') return; const div = document.createElement('div'); div.style.cssText = "display:flex; flex-direction:column; gap:5px;"; div.innerHTML = `<label style="font-size:12px; color:var(--text-sub); font-weight:bold; display:flex; align-items:center; gap:5px;"><i class="fa-solid ${item.icon}" style="color:var(--text-sub)"></i> ${item.label}</label><input type="number" class="input-field-dynamic" data-key="${item.key}" placeholder="0" style="padding:10px; border:1px solid #ddd; border-radius:6px; font-size:15px; width:100%; box-sizing:border-box;">`; formContainer.appendChild(div); }); } if(saveBtn) { saveBtn.addEventListener('click', async () => { const targetDate = dateInput.value; if(!targetDate) { alert('日付を選択してください'); return; } const inputData = { date: targetDate }; const inputs = formContainer.querySelectorAll('input.input-field-dynamic'); inputs.forEach(input => { const key = input.dataset.key; const val = input.value; if (val !== '') { inputData[key] = Number(val); } }); saveBtn.textContent = '保存中...'; saveBtn.disabled = true; try { const response = await fetch(GAS_API_URL, { method: "POST", mode: "cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ token: currentToken, action: 'manualInput', data: inputData }) }); const jsonData = await response.json(); if(jsonData.success) { alert('データを保存しました'); modal.style.display = 'none'; fetchData('getSales'); } else { alert('エラー: ' + jsonData.message); } } catch(e) { console.error(e); alert('通信エラー'); } finally { saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> 保存する'; saveBtn.disabled = false; } }); } }
async function fetchData(actionType) { if (!currentToken) return; const loadingElem = document.getElementById('loading'); if(loadingElem) loadingElem.style.display = 'block'; try { const response = await fetch(GAS_API_URL, { method: "POST", mode: "cors", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ token: currentToken, action: actionType, targetMonth: getSelectedMonthString() }) }); if (!response.ok) throw new Error('Network error'); const jsonData = await response.json(); if (jsonData.error) { console.error("API Error:", jsonData.message); alert(jsonData.message); return; } if (actionType === 'getPhr') renderPhrDashboard(jsonData); else renderSalesDashboard(jsonData); } catch (error) { console.error('Fetch Error:', error); } }
function renderSalesDashboard(data) { const loadingElem = document.getElementById('loading'); if(loadingElem) loadingElem.style.display = 'none'; currentConfig = data.config; const config = data.config; const summary = data.summary; const prevSummary = data.prevSummary || {}; const history = data.history; const topContainer = document.getElementById('kpi-top-container'); const subContainer = document.getElementById('kpi-sub-container'); if(topContainer) topContainer.innerHTML = ''; if(subContainer) subContainer.innerHTML = ''; if (!config || !summary) return; config.forEach(item => { if (item.position === 'hidden') return; let val = summary[item.key] || 0; let prevVal = prevSummary[item.key] || 0; let unit = '', displayVal = ''; if (item.format === 'currency') { displayVal = Number(val).toLocaleString(); unit = '¥'; } else if (item.format === 'percent') { displayVal = Number(val).toFixed(1); unit = '%'; } else { displayVal = Number(val).toLocaleString(); } let trendHtml = ''; let diff = val - prevVal; let diffPercent = 0; if (prevVal !== 0) { diffPercent = ((val - prevVal) / prevVal) * 100; } const isCancelMetric = item.key.includes('cancel'); const isUp = diff >= 0; let trendClass = 'flat'; let trendIcon = 'fa-minus'; let trendText = '前月比 ±0'; if (diff !== 0) { const isGood = isCancelMetric ? !isUp : isUp; trendClass = isGood ? 'up' : 'down'; trendIcon = isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'; const sign = isUp ? '+' : ''; if (item.format === 'percent') { trendText = `前月比 ${sign}${diff.toFixed(1)}pt`; } else { trendText = `前月比 ${sign}${diffPercent.toFixed(1)}%`; } } trendHtml = `<span class="trend ${trendClass}"><i class="fa-solid ${trendIcon}"></i> ${trendText}</span>`; const cardHtml = `<div class="card kpi-card"><div class="card-icon ${item.color}"><i class="fa-solid ${item.icon}"></i></div><div class="card-info"><h3>${item.label}</h3><p class="value">${unit === '¥' ? '¥' : ''}${displayVal}${unit === '%' ? '%' : ''}</p>${trendHtml}</div></div>`; if (item.position === 'top') { if(topContainer) topContainer.insertAdjacentHTML('beforeend', cardHtml); } else { if(subContainer) subContainer.insertAdjacentHTML('beforeend', cardHtml); } }); const canvas = document.getElementById('salesChart'); if (!canvas) return; const chartStatus = Chart.getChart(canvas); if (chartStatus) chartStatus.destroy(); if (!history) return; const labels = history.map(item => { const d = new Date(item.date); return d.getDate() + '日'; }); const insuranceData = history.map(item => item.insurance_sales || 0); const selfPayData = history.map(item => item.self_pay_sales || 0); const visitorData = history.map(item => item.visitors || 0); new Chart(canvas, { type: 'bar', data: { labels: labels, datasets: [ { label: '自費売上', data: selfPayData, backgroundColor: 'rgba(59, 130, 246, 0.6)', yAxisID: 'y', order: 2 }, { label: '保険売上', data: insuranceData, backgroundColor: 'rgba(16, 185, 129, 0.6)', yAxisID: 'y', order: 3 }, { label: '来院数', data: visitorData, type: 'line', borderColor: 'rgba(245, 158, 11, 1)', borderWidth: 2, pointRadius: 2, tension: 0.1, yAxisID: 'y1', order: 1 } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { type: 'linear', display: true, position: 'left', stacked: true, title: { display: true, text: '売上 (円)' } }, y1: { type: 'linear', display: true, position: 'right', grid: { display: false }, title: { display: true, text: '来院数 (名)' }, min: 0 } }, plugins: { tooltip: { mode: 'index', intersect: false } } } }); updateAiAdvisor(data.summary, data.prevSummary); }
function updateAiAdvisor(summary, prevSummary) { const aiTextElem = document.getElementById('ai-text-body'); if (!aiTextElem) return; if (!summary || !prevSummary) { aiTextElem.textContent = "データが不足しているため分析できません。"; return; } const sales = summary.insurance_sales + summary.self_pay_sales; const prevSales = (prevSummary.insurance_sales || 0) + (prevSummary.self_pay_sales || 0); const visitors = summary.visitors || 0; const cancelRate = summary.cancel_rate || 0; const selfPayRate = sales > 0 ? (summary.self_pay_sales / sales) * 100 : 0; let messages = []; if (sales > prevSales * 1.05) { messages.push(`素晴らしいです！売上が前月比で増加傾向にあります（+${Math.round((sales - prevSales)/10000)}万円）。この調子で自費診療のアポイントも確保していきましょう。`); } else if (sales < prevSales * 0.95) { messages.push(`売上が前月より少し落ち込んでいます。空き枠の確認と、リコール患者様へのアプローチを検討してみましょう。`); } else { messages.push(`売上は前月と同水準で安定しています。`); } if (cancelRate > 15) { messages.push(`⚠️ キャンセル率が ${cancelRate.toFixed(1)}% と高まっています。前日の確認連絡を強化するか、無断キャンセルの多い患者様の予約管理を見直す必要があります。`); } else if (cancelRate < 5 && visitors > 20) { messages.push(`キャンセル率が低く抑えられています（${cancelRate.toFixed(1)}%）。患者様との信頼関係が構築できている証拠です。スタッフを労いましょう！`); } if (selfPayRate < 20) { messages.push(`自費率が ${selfPayRate.toFixed(1)}% です。カウンセリングの機会を増やし、補綴物の選択肢を提示する回数を増やしてみても良いかもしれません。`); } let finalMessage = messages.join('<br><br>'); if (sales === 0 && visitors === 0) { finalMessage = "まだ今月のデータが入力されていないようです。日計表をアップロードするか、スプレッドシートに入力してください。"; } aiTextElem.innerHTML = finalMessage; }
function renderPhrDashboard(data) { const summary = data.summary; const dailyData = data.dailyActivity; if (summary) { const cardSales = document.getElementById('kpi-sales'); if(cardSales) cardSales.textContent = summary.totalUsers ? summary.totalUsers.toLocaleString() : "0"; const cardVisitors = document.getElementById('kpi-visitors'); if(cardVisitors) cardVisitors.textContent = summary.totalDiagnoses ? summary.totalDiagnoses.toLocaleString() : "0"; } const canvas = document.getElementById('salesChart'); if (!canvas) return; const chartStatus = Chart.getChart(canvas); if (chartStatus) chartStatus.destroy(); const labels = dailyData.map(item => item.date); const counts = dailyData.map(item => item.count); new Chart(canvas, { type: 'line', data: { labels: labels, datasets: [ { label: 'PHR記録アクション数', data: counts, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 3, fill: true, tension: 0.4 } ] }, options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: '日別 PHR利用アクティビティ' } }, scales: { y: { beginAtZero: true } } } }); }
