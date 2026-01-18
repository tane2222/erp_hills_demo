// =================================================================
// 設定
// =================================================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 

let currentToken = ""; 
let selectedDate = new Date();
let currentConfig = []; 

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
    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() - 1);
            updatePickerValue();
            fetchData('getSales');
        });
    }

    const nextBtn = document.getElementById('next-month-btn');
    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() + 1);
            updatePickerValue();
            fetchData('getSales');
        });
    }
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

function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const link = item.querySelector('a');
            const target = link.dataset.target; 
            const text = link.querySelector('span').textContent;
            
            if(pageTitle) pageTitle.textContent = text + ' ダッシュボード';

            if (target === 'phr') {
                fetchData('getPhr');
            } else if (target === 'dashboard') {
                fetchData('getSales');
            } else {
                alert('この機能は開発中です');
            }
        });
    });
}

// =================================================================
// 設定モーダル制御
// =================================================================
function initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const addBtn = document.getElementById('add-setting-btn');

    if(openBtn) {
        openBtn.addEventListener('click', () => {
            renderSettingsList();
            modal.style.display = 'flex';
        });
    }

    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if(saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }

    if(addBtn) {
        addBtn.addEventListener('click', addSettingItem);
    }
}

function renderSettingsList() {
    const list = document.getElementById('settings-list');
    list.innerHTML = '';

    currentConfig.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "setting-item"; // CSSクラス適用
        
        div.innerHTML = `
            <div class="setting-handle"><i class="fa-solid fa-bars"></i></div>
            
            <div class="setting-inputs">
                <div class="setting-main-row">
                    <input type="text" class="setting-label-input setting-label" value="${item.label}" data-index="${index}" placeholder="表示名">
                </div>
                <div class="setting-sub-row">
                    <span>Key:</span>
                    <input type="text" class="setting-mini-input setting-key" value="${item.key}" data-index="${index}" placeholder="列名(英字)" style="width:100px;">
                    <span>Icon:</span>
                    <input type="text" class="setting-mini-input setting-icon" value="${item.icon}" data-index="${index}" placeholder="fa-xx" style="width:80px;">
                </div>
            </div>

            <select class="setting-pos-select setting-pos" data-index="${index}">
                <option value="top" ${item.position === 'top' ? 'selected' : ''}>上段</option>
                <option value="sub" ${item.position === 'sub' ? 'selected' : ''}>下段</option>
                <option value="hidden" ${item.position === 'hidden' ? 'selected' : ''}>非表示</option>
            </select>

            <div class="setting-move-group">
                <button onclick="moveItem(${index}, -1)" class="setting-move-btn">▲</button>
                <button onclick="moveItem(${index}, 1)" class="setting-move-btn">▼</button>
            </div>

            <button onclick="deleteSettingItem(${index})" class="setting-delete-btn" title="削除">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        list.appendChild(div);
    });
}

function addSettingItem() {
    currentConfig.push({
        key: 'new_column',
        label: '新しい項目',
        icon: 'fa-circle',
        color: 'blue',
        format: 'number',
        position: 'sub'
    });
    renderSettingsList();
    const list = document.getElementById('settings-list');
    setTimeout(() => list.scrollTop = list.scrollHeight, 0);
}

window.deleteSettingItem = function(index) {
    if(confirm('この項目を削除しますか？\n（スプレッドシートの設定行が削除されます）')) {
        currentConfig.splice(index, 1);
        renderSettingsList();
    }
};

window.moveItem = function(index, direction) {
    if (index + direction < 0 || index + direction >= currentConfig.length) return;
    const temp = currentConfig[index];
    currentConfig[index] = currentConfig[index + direction];
    currentConfig[index + direction] = temp;
    renderSettingsList();
};

async function saveSettings() {
    const list = document.getElementById('settings-list');
    const rows = list.children;
    
    const newConfig = [];
    for(let i=0; i<rows.length; i++) {
        const labelInput = rows[i].querySelector('.setting-label');
        const keyInput = rows[i].querySelector('.setting-key');
        const iconInput = rows[i].querySelector('.setting-icon');
        const posSelect = rows[i].querySelector('.setting-pos');
        const base = currentConfig[i]; 

        newConfig.push({
            key: keyInput.value.trim(),
            label: labelInput.value.trim(),
            icon: iconInput.value.trim(),
            color: base.color || 'blue',
            format: base.format || 'number',
            position: posSelect.value
        });
    }

    const saveBtn = document.getElementById('save-settings-btn');
    saveBtn.textContent = "保存中...";
    saveBtn.disabled = true;

    try {
        const response = await fetch(GAS_API_URL, {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ 
                token: currentToken,
                action: 'updateSettings',
                settings: newConfig
            })
        });
        
        const jsonData = await response.json();
        if(jsonData.success) {
            alert('設定を保存しました');
            document.getElementById('settings-modal').style.display = 'none';
            fetchData('getSales');
        } else {
            alert('保存エラー: ' + jsonData.message);
        }
    } catch(e) {
        console.error(e);
        alert('通信エラー');
    } finally {
        saveBtn.textContent = "保存して反映";
        saveBtn.disabled = false;
    }
}

// =================================================================
// 日計表アップロード制御
// =================================================================
function initUploadModal() {
    const modal = document.getElementById('upload-modal');
    const openBtn = document.getElementById('open-upload-btn');
    const closeBtn = document.getElementById('close-upload-btn');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const executeBtn = document.getElementById('upload-execute-btn');
    const previewArea = document.getElementById('preview-area');
    const fileName = document.getElementById('file-name');

    let selectedFile = null;

    if(openBtn) openBtn.addEventListener('click', () => modal.style.display = 'flex');
    if(closeBtn) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; resetUploadForm(); });

    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        dropArea.classList.add('active'); // CSSクラスで制御
    });
    dropArea.addEventListener('dragleave', () => { 
        dropArea.classList.remove('active'); 
    });
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('active'); 
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        selectedFile = file;
        dropArea.style.display = 'none';
        previewArea.style.display = 'block';
        fileName.textContent = `${file.name} (${(file.size/1024).toFixed(1)} KB)`; 
        executeBtn.disabled = false;
        // executeBtnのスタイルはCSSの:disabledで制御されるためJSでの変更不要
    }

    function resetUploadForm() {
        selectedFile = null;
        fileInput.value = '';
        dropArea.style.display = 'block';
        previewArea.style.display = 'none';
        executeBtn.disabled = true;
        executeBtn.textContent = "AI解析スタート";
    }

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const MAX_WIDTH = 1024; 
            const MAX_HEIGHT = 1024;
            const reader = new FileReader();
            
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const readPdf = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({ base64: reader.result.split(',')[1], mimeType: file.type });
            reader.onerror = reject;
        });
    };

    executeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;
        executeBtn.textContent = "送信中...";
        executeBtn.disabled = true;

        try {
            let fileData = null;
            if (selectedFile.type.startsWith('image/')) {
                fileData = await compressImage(selectedFile);
            } else {
                fileData = await readPdf(selectedFile);
            }
            
            executeBtn.textContent = "AI解析中...";

            const response = await fetch(GAS_API_URL, {
                method: "POST",
                mode: "cors",
                redirect: "follow",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ 
                    token: currentToken,
                    action: 'importReport',
                    fileData: fileData.base64,
                    mimeType: fileData.mimeType
                })
            });

            const jsonData = await response.json();
            
            if (jsonData.success) {
                alert('インポート完了！\n' + JSON.stringify(jsonData.data, null, 2));
                modal.style.display = 'none';
                resetUploadForm();
                fetchData('getSales');
            } else {
                console.error("Server Error:", jsonData);
                alert(`エラー: ${jsonData.message}\n(詳細: ${jsonData.error || ''})`);
                resetUploadForm();
            }

        } catch (error) {
            console.error(error);
            alert('通信エラー: ' + error.message);
            resetUploadForm();
        }
    });
}

// =================================================================
// データ取得 (API通信)
// =================================================================
async function fetchData(actionType) {
    if (!currentToken) return;
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'block';

    try {
        const response = await fetch(GAS_API_URL, {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ 
                token: currentToken,
                action: actionType,
                targetMonth: getSelectedMonthString() 
            })
        });

        if (!response.ok) throw new Error('Network error');
        const jsonData = await response.json();
        
        if (jsonData.error) { 
            console.error("API Error:", jsonData.message);
            alert(jsonData.message); 
            return; 
        }

        if (actionType === 'getPhr') renderPhrDashboard(jsonData);
        else renderSalesDashboard(jsonData);

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

// =================================================================
// 描画: 売上 (Sales)
// =================================================================
function renderSalesDashboard(data) {
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    currentConfig = data.config;
    const config = data.config;
    const summary = data.summary;
    const prevSummary = data.prevSummary || {};
    const history = data.history;

    const topContainer = document.getElementById('kpi-top-container');
    const subContainer = document.getElementById('kpi-sub-container');
    if(topContainer) topContainer.innerHTML = '';
    if(subContainer) subContainer.innerHTML = '';

    if (!config || !summary) return;

    config.forEach(item => {
        if (item.position === 'hidden') return;

        let val = summary[item.key] || 0;
        let prevVal = prevSummary[item.key] || 0;
        let unit = '', displayVal = '';

        if (item.format === 'currency') {
            displayVal = Number(val).toLocaleString();
            unit = '¥';
        } else if (item.format === 'percent') {
            displayVal = Number(val).toFixed(1);
            unit = '%';
        } else {
            displayVal = Number(val).toLocaleString();
        }

        let trendHtml = '';
        let diff = val - prevVal;
        let diffPercent = 0;
        if (prevVal !== 0) {
            diffPercent = ((val - prevVal) / prevVal) * 100;
        }

        const isCancelMetric = item.key.includes('cancel');
        const isUp = diff >= 0;
        
        let trendClass = 'flat';
        let trendIcon = 'fa-minus';
        let trendText = '前月比 ±0';

        if (diff !== 0) {
            const isGood = isCancelMetric ? !isUp : isUp;
            trendClass = isGood ? 'up' : 'down'; 
            trendIcon = isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
            
            const sign = isUp ? '+' : '';
            if (item.format === 'percent') {
                trendText = `前月比 ${sign}${diff.toFixed(1)}pt`;
            } else {
                trendText = `前月比 ${sign}${diffPercent.toFixed(1)}%`;
            }
        }

        trendHtml = `
            <span class="trend ${trendClass}">
                <i class="fa-solid ${trendIcon}"></i> ${trendText}
            </span>
        `;
        
        const cardHtml = `
            <div class="card kpi-card">
                <div class="card-icon ${item.color}">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="card-info">
                    <h3>${item.label}</h3>
                    <p class="value">${unit === '¥' ? '¥' : ''}${displayVal}${unit === '%' ? '%' : ''}</p>
                    ${trendHtml}
                    ${unit === '' && item.format !== 'percent' ? '<span class="kpi-unit-label">名/件</span>' : ''}
                </div>
            </div>
        `;

        if (item.position === 'top') {
            if(topContainer) topContainer.insertAdjacentHTML('beforeend', cardHtml);
        } else {
            if(subContainer) subContainer.insertAdjacentHTML('beforeend', cardHtml);
        }
    });

    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();
    if (!history) return;

    const labels = history.map(item => {
        const d = new Date(item.date);
        return d.getDate() + '日';
    });
    const insuranceData = history.map(item => item.insurance_sales || 0);
    const selfPayData = history.map(item => item.self_pay_sales || 0);
    const visitorData = history.map(item => item.visitors || 0);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: '自費売上', data: selfPayData, backgroundColor: 'rgba(59, 130, 246, 0.6)', yAxisID: 'y', order: 2 },
                { label: '保険売上', data: insuranceData, backgroundColor: 'rgba(16, 185, 129, 0.6)', yAxisID: 'y', order: 3 },
                { label: '来院数', data: visitorData, type: 'line', borderColor: 'rgba(245, 158, 11, 1)', borderWidth: 2, pointRadius: 2, tension: 0.1, yAxisID: 'y1', order: 1 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                y: { type: 'linear', display: true, position: 'left', stacked: true, title: { display: true, text: '売上 (円)' } },
                y1: { type: 'linear', display: true, position: 'right', grid: { display: false }, title: { display: true, text: '来院数 (名)' }, min: 0 }
            },
            plugins: { tooltip: { mode: 'index', intersect: false } }
        }
    });

    updateAiAdvisor(data.summary, data.prevSummary);
}

function updateAiAdvisor(summary, prevSummary) {
    const aiTextElem = document.getElementById('ai-text-body');
    if (!aiTextElem) return;

    if (!summary || !prevSummary) {
        aiTextElem.textContent = "データが不足しているため分析できません。";
        return;
    }

    const sales = summary.insurance_sales + summary.self_pay_sales;
    const prevSales = (prevSummary.insurance_sales || 0) + (prevSummary.self_pay_sales || 0);
    const visitors = summary.visitors || 0;
    const prevVisitors = prevSummary.visitors || 0;
    const cancelRate = summary.cancel_rate || 0;
    const selfPayRate = sales > 0 ? (summary.self_pay_sales / sales) * 100 : 0;

    let messages = [];

    if (sales > prevSales * 1.05) {
        messages.push(`素晴らしいです！売上が前月比で増加傾向にあります（+${Math.round((sales - prevSales)/10000)}万円）。この調子で自費診療のアポイントも確保していきましょう。`);
    } else if (sales < prevSales * 0.95) {
        messages.push(`売上が前月より少し落ち込んでいます。空き枠の確認と、リコール患者様へのアプローチを検討してみましょう。`);
    } else {
        messages.push(`売上は前月と同水準で安定しています。`);
    }

    if (cancelRate > 15) {
        messages.push(`⚠️ キャンセル率が ${cancelRate.toFixed(1)}% と高まっています。前日の確認連絡を強化するか、無断キャンセルの多い患者様の予約管理を見直す必要があります。`);
    } else if (cancelRate < 5 && visitors > 20) {
        messages.push(`キャンセル率が低く抑えられています（${cancelRate.toFixed(1)}%）。患者様との信頼関係が構築できている証拠です。スタッフを労いましょう！`);
    }

    if (selfPayRate < 20) {
        messages.push(`自費率が ${selfPayRate.toFixed(1)}% です。カウンセリングの機会を増やし、補綴物の選択肢を提示する回数を増やしてみても良いかもしれません。`);
    }

    let finalMessage = messages.join('<br><br>');
    
    if (sales === 0 && visitors === 0) {
        finalMessage = "まだ今月のデータが入力されていないようです。日計表をアップロードするか、スプレッドシートに入力してください。";
    }

    aiTextElem.innerHTML = finalMessage;
}

// =================================================================
// 描画: PHR (PHRアプリ連携)
// =================================================================
function renderPhrDashboard(data) {
    const summary = data.summary;
    const dailyData = data.dailyActivity;

    if (summary) {
        const cardSales = document.getElementById('kpi-sales');
        if(cardSales) cardSales.textContent = summary.totalUsers ? summary.totalUsers.toLocaleString() : "0";

        const cardVisitors = document.getElementById('kpi-visitors');
        if(cardVisitors) cardVisitors.textContent = summary.totalDiagnoses ? summary.totalDiagnoses.toLocaleString() : "0";
    }

    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();

    const labels = dailyData.map(item => item.date);
    const counts = dailyData.map(item => item.count);

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'PHR記録アクション数',
                    data: counts,
                    borderColor: '#10b981', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '日別 PHR利用アクティビティ' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
