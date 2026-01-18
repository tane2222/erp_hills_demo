// =================================================================
// 設定
// =================================================================
// ★あなたのGASウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 

let currentToken = ""; // トークン保持用
// ★現在選択中の日付オブジェクト（初期値は今日）
let selectedDate = new Date();

// =================================================================
// アプリケーション開始処理
// =================================================================
let currentConfig = []; // 現在のKPI設定を保持
window.startApp = function(token) {
    currentToken = token; 
    initMenu();
    initDate();          // 本日の日付
    initMonthSelector(); // 月選択
    initSettingsModal(); // ★追加
    initUploadModal(); // ★追加
    fetchData('getSales'); 
};

// =================================================================
// 画面UI制御
// =================================================================
// 本日の日付表示
function initDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    const dateElem = document.getElementById('current-date');
    if(dateElem) dateElem.textContent = now.toLocaleDateString('ja-JP', options);
}

// 月選択コントロールの制御
function initMonthSelector() {
    const picker = document.getElementById('month-picker');
    if (!picker) return; // エラー防止

    updatePickerValue(); // 初期値セット

    // ピッカー変更時 (2024年などに飛んだ時)
    picker.addEventListener('change', (e) => {
        if(e.target.value) {
            selectedDate = new Date(e.target.value + '-01'); // yyyy-MM-01
            fetchData('getSales');
        }
    });

    // 前月ボタン
    const prevBtn = document.getElementById('prev-month-btn');
    if(prevBtn) {
        prevBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() - 1);
            updatePickerValue();
            fetchData('getSales');
        });
    }

    // 次月ボタン
    const nextBtn = document.getElementById('next-month-btn');
    if(nextBtn) {
        nextBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() + 1);
            updatePickerValue();
            fetchData('getSales');
        });
    }
}

// selectedDate を input type="month" の形式 (yyyy-MM) にしてセット
function updatePickerValue() {
    const picker = document.getElementById('month-picker');
    if (!picker) return;

    const y = selectedDate.getFullYear();
    const m = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
    picker.value = `${y}-${m}`;
}

// GASへ送るための文字列生成 (yyyy/MM)
function getSelectedMonthString() {
    const y = selectedDate.getFullYear();
    const m = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
    return `${y}/${m}`;
}

// メニュー切り替え制御
function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // アクティブ表示の切り替え
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // リンク情報の取得
            const link = item.querySelector('a');
            const target = link.dataset.target; 
            const text = link.querySelector('span').textContent;
            
            if(pageTitle) pageTitle.textContent = text + ' ダッシュボード';

            // 画面切り替えロジック
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
// データ取得 (API通信)
// =================================================================
async function fetchData(actionType) {
    if (!currentToken) return;
    const loadingElem = document.getElementById('loading'); // HTMLにloading要素がない場合は無視されますが、あると親切です
    
    // コンソールで動作確認
    console.log(`Fetching data: ${actionType} for ${getSelectedMonthString()}`);

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
// 日計表アップロード制御 (新規)
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

    // 開く
    if(openBtn) {
        openBtn.addEventListener('click', () => modal.style.display = 'flex');
    }
    // 閉じる
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            resetUploadForm();
        });
    }

    // ドラッグ＆ドロップ制御
    dropArea.addEventListener('click', () => fileInput.click());
    dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.style.borderColor = '#3b82f6'; dropArea.style.background = '#eff6ff'; });
    dropArea.addEventListener('dragleave', () => { dropArea.style.borderColor = '#ccc'; dropArea.style.background = '#fafafa'; });
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ccc'; dropArea.style.background = '#fafafa';
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
    });

    // ファイル選択時の処理
    function handleFile(file) {
        selectedFile = file;
        dropArea.style.display = 'none';
        previewArea.style.display = 'block';
        fileName.textContent = file.name;
        executeBtn.disabled = false;
        executeBtn.style.background = 'var(--accent-blue)';
        executeBtn.style.cursor = 'pointer';
    }

    // フォームリセット
    function resetUploadForm() {
        selectedFile = null;
        fileInput.value = '';
        dropArea.style.display = 'block';
        previewArea.style.display = 'none';
        executeBtn.disabled = true;
        executeBtn.style.background = '#ccc';
        executeBtn.textContent = "AI解析スタート";
    }

    // ★実行ボタン（GASへ送信）
    executeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        executeBtn.textContent = "AI解析中... (30秒ほどかかります)";
        executeBtn.disabled = true;

        // ファイルをBase64に変換
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
            const base64Data = reader.result.split(',')[1]; // "data:image/png;base64," の後ろだけ取得
            const mimeType = selectedFile.type;

            try {
                const response = await fetch(GAS_API_URL, {
                    method: "POST",
                    mode: "cors",
                    redirect: "follow",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify({ 
                        token: currentToken,
                        action: 'importReport', // AIインポートアクション
                        fileData: base64Data,
                        mimeType: mimeType
                    })
                });

                const jsonData = await response.json();
                
                if (jsonData.success) {
                    alert('インポート完了！\n' + JSON.stringify(jsonData.data, null, 2));
                    modal.style.display = 'none';
                    resetUploadForm();
                    fetchData('getSales'); // 画面更新
                } else {
                    alert('エラー: ' + jsonData.message);
                    resetUploadForm();
                }

            } catch (error) {
                console.error(error);
                alert('通信エラーが発生しました');
                resetUploadForm();
            }
        };
    });
}

// =================================================================
// 設定モーダル制御 (追加・削除機能付き)
// =================================================================
function initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const saveBtn = document.getElementById('save-settings-btn');
    const addBtn = document.getElementById('add-setting-btn'); // ★追加

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

    // ★追加ボタンのイベント
    if(addBtn) {
        addBtn.addEventListener('click', addSettingItem);
    }
}

// 設定リストの描画
function renderSettingsList() {
    const list = document.getElementById('settings-list');
    list.innerHTML = '';

    currentConfig.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.cssText = "display:flex; align-items:center; padding:10px; border-bottom:1px solid #f0f0f0; background:white; gap:10px;";
        
        // 表示/非表示チェック (hiddenで管理)
        const isVisible = item.position !== 'hidden';
        
        div.innerHTML = `
            <div style="color:#ccc; cursor:grab; font-size:14px;"><i class="fa-solid fa-bars"></i></div>
            
            <div style="flex:1;">
                <div style="display:flex; gap:5px; margin-bottom:4px;">
                    <input type="text" class="setting-label" value="${item.label}" data-index="${index}" placeholder="表示名" style="border:1px solid #ddd; padding:4px 8px; border-radius:4px; font-weight:bold; width:100%;">
                </div>
                <div style="display:flex; align-items:center; gap:5px; font-size:11px; color:#888;">
                    <span>Key:</span>
                    <input type="text" class="setting-key" value="${item.key}" data-index="${index}" placeholder="列名(英字)" style="border:none; background:#f9f9f9; padding:2px 4px; border-radius:3px; color:#666; width:100px;">
                    <span>Icon:</span>
                    <input type="text" class="setting-icon" value="${item.icon}" data-index="${index}" placeholder="fa-xx" style="border:none; background:#f9f9f9; padding:2px 4px; border-radius:3px; color:#666; width:80px;">
                </div>
            </div>

            <select class="setting-pos" data-index="${index}" style="padding:5px; border:1px solid #ddd; border-radius:4px; font-size:12px;">
                <option value="top" ${item.position === 'top' ? 'selected' : ''}>上段 (メイン)</option>
                <option value="sub" ${item.position === 'sub' ? 'selected' : ''}>下段 (詳細)</option>
                <option value="hidden" ${item.position === 'hidden' ? 'selected' : ''}>非表示</option>
            </select>

            <div style="display:flex; flex-direction:column; gap:2px;">
                <button onclick="moveItem(${index}, -1)" style="border:none; background:none; cursor:pointer; color:#888; font-size:10px;">▲</button>
                <button onclick="moveItem(${index}, 1)" style="border:none; background:none; cursor:pointer; color:#888; font-size:10px;">▼</button>
            </div>

            <button onclick="deleteSettingItem(${index})" title="削除" style="border:none; background:none; cursor:pointer; color:#e02424; margin-left:5px; font-size:14px;">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        list.appendChild(div);
    });
}

// ★項目の追加
function addSettingItem() {
    // デフォルト値で追加
    currentConfig.push({
        key: 'new_column',
        label: '新しい項目',
        icon: 'fa-circle',
        color: 'blue',
        format: 'number',
        position: 'sub'
    });
    renderSettingsList();
    
    // スクロールを一番下へ
    const list = document.getElementById('settings-list');
    setTimeout(() => list.scrollTop = list.scrollHeight, 0);
}

// ★項目の削除
window.deleteSettingItem = function(index) {
    if(confirm('この項目を削除しますか？\n（スプレッドシートの設定行が削除されます）')) {
        currentConfig.splice(index, 1);
        renderSettingsList();
    }
};

// 項目の移動
window.moveItem = function(index, direction) {
    if (index + direction < 0 || index + direction >= currentConfig.length) return;
    const temp = currentConfig[index];
    currentConfig[index] = currentConfig[index + direction];
    currentConfig[index + direction] = temp;
    renderSettingsList();
};

// 設定の保存
async function saveSettings() {
    const list = document.getElementById('settings-list');
    const rows = list.children;
    
    const newConfig = [];
    for(let i=0; i<rows.length; i++) {
        // 画面の入力値を全て取得して反映
        const labelInput = rows[i].querySelector('.setting-label');
        const keyInput = rows[i].querySelector('.setting-key');
        const iconInput = rows[i].querySelector('.setting-icon');
        const posSelect = rows[i].querySelector('.setting-pos');
        
        // 元のデータから color, format は引き継ぐ（簡易編集のため今回は画面に出していない）
        // 完全編集にするならこれらもinputを追加すればOK
        const originalIndex = labelInput.dataset.index; // 元データのインデックスとは限らない（並べ替え後なので）
        // 並べ替え前のプロパティを引き継ぎたいが、currentConfigはリアルタイムで入れ替わっているので
        // currentConfig[i] をベースにするのが正しい
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

    // GASへ送信
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
            fetchData('getSales'); // 画面更新
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
// 描画: 売上 (トレンド表示対応)
// =================================================================
function renderSalesDashboard(data) {
    // データ取得時に config をグローバル変数に保存しておく（設定画面用）
    currentConfig = data.config;
    const config = data.config;
    const summary = data.summary;
    const prevSummary = data.prevSummary || {}; // 前月データ
    const history = data.history;

    const topContainer = document.getElementById('kpi-top-container');
    const subContainer = document.getElementById('kpi-sub-container');
    if(topContainer) topContainer.innerHTML = '';
    if(subContainer) subContainer.innerHTML = '';

    if (!config || !summary) return;

    config.forEach(item => {
         if (item.position === 'hidden') return; // ★非表示ならスキップ
        // --- 数値フォーマット ---
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

        // --- トレンド判定 (前月比) ---
        let trendHtml = '';
        let diff = val - prevVal;
        let diffPercent = 0;
        if (prevVal !== 0) {
            diffPercent = ((val - prevVal) / prevVal) * 100;
        }

        const isCancelMetric = item.key.includes('cancel');
        const isUp = diff >= 0;
        
        // 色とアイコンの決定
        let trendClass = 'flat';
        let trendIcon = 'fa-minus';
        let trendText = '前月比 ±0';

        if (diff !== 0) {
            // キャンセル系は「下がるのがGood」、売上などは「上がるのがGood」
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
        
        // --- HTML生成 ---
        const cardHtml = `
            <div class="card kpi-card">
                <div class="card-icon ${item.color}">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="card-info">
                    <h3>${item.label}</h3>
                    <p class="value">${unit === '¥' ? '¥' : ''}${displayVal}${unit === '%' ? '%' : ''}</p>
                    ${trendHtml}
                </div>
            </div>
        `;

        if (item.position === 'top') {
            if(topContainer) topContainer.insertAdjacentHTML('beforeend', cardHtml);
        } else {
            if(subContainer) subContainer.insertAdjacentHTML('beforeend', cardHtml);
        }
    });

    // --- グラフ描画 ---
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
                    borderColor: '#10b981', // 緑色
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
