// =================================================================
// 設定
// =================================================================
// ★前回のまま、あなたのGASウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 

let currentToken = ""; // トークン保持用
// ★追加: 現在選択中の日付オブジェクト（初期値は今日）
let selectedDate = new Date();

// =================================================================
// アプリケーション開始処理
// =================================================================
window.startApp = function(token) {
    currentToken = token; 
    initMenu();
    initDate();          // 本日の日付
    initMonthSelector(); // 月選択
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
    updatePickerValue(); // 初期値セット

    // ピッカー変更時 (2024年などに飛んだ時)
    picker.addEventListener('change', (e) => {
        if(e.target.value) {
            selectedDate = new Date(e.target.value + '-01'); // yyyy-MM-01
            fetchData('getSales');
        }
    });

    // 前月ボタン
    document.getElementById('prev-month-btn').addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() - 1);
        updatePickerValue();
        fetchData('getSales');
    });

    // 次月ボタン
    document.getElementById('next-month-btn').addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() + 1);
        updatePickerValue();
        fetchData('getSales');
    });
}

// selectedDate を input type="month" の形式 (yyyy-MM) にしてセット
function updatePickerValue() {
    const picker = document.getElementById('month-picker');
    const y = selectedDate.getFullYear();
    const m = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
    picker.value = `${y}-${m}`;
}

function getSelectedMonthString() {
    const y = selectedDate.getFullYear();
    const m = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
    return `${y}/${m}`;
}

// =================================================================
// ★追加: 月選択コントロールの制御
// =================================================================
function initMonthSelector() {
    updateMonthDisplay(); // 表示更新

    // 前月ボタン
    document.getElementById('prev-month-btn').addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() - 1); // 1ヶ月戻す
        updateMonthDisplay();
        fetchData('getSales'); // データ再取得
    });

    // 次月ボタン
    document.getElementById('next-month-btn').addEventListener('click', () => {
        selectedDate.setMonth(selectedDate.getMonth() + 1); // 1ヶ月進める
        updateMonthDisplay();
        fetchData('getSales'); // データ再取得
    });
}

function updateMonthDisplay() {
    // "2026年1月" のような形式で表示
    const displayStr = selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
    document.getElementById('display-month').textContent = displayStr;
}

// "yyyy/MM" 形式の文字列を作るヘルパー関数
function getSelectedMonthString() {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}/${month}`;
}

// =================================================================
// データ取得 (API通信)
// =================================================================
async function fetchData(actionType) {
    if (!currentToken) return;
    const loadingElem = document.getElementById('loading');
    if(loadingElem) { loadingElem.style.display = 'block'; loadingElem.textContent = '集計中...'; }

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
        
        if (jsonData.error) { alert(jsonData.message); return; }

        if (actionType === 'getPhr') renderPhrDashboard(jsonData);
        else renderSalesDashboard(jsonData);

    } catch (error) {
        console.error(error);
    }
}

// =================================================================
// 描画: 売上 (トレンド表示対応)
// =================================================================
function renderSalesDashboard(data) {
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

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
        // 0割対策
        let diff = val - prevVal;
        let diffPercent = 0;
        if (prevVal !== 0) {
            diffPercent = ((val - prevVal) / prevVal) * 100;
        }

        // 「良い方向」の定義 (キャンセル系は減るのが良い、それ以外は増えるのが良い)
        const isCancelMetric = item.key.includes('cancel');
        const isUp = diff >= 0;
        
        // 色とアイコンの決定
        // 基本: 増えたらGood(緑)、減ったらBad(青)
        // キャンセル系: 増えたらBad(青)、減ったらGood(緑)
        let trendClass = 'flat';
        let trendIcon = 'fa-minus';
        let trendText = '前月比 ±0';

        if (diff !== 0) {
            const isGood = isCancelMetric ? !isUp : isUp;
            trendClass = isGood ? 'up' : 'down'; // CSSの .up(緑) .down(青) に対応
            trendIcon = isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
            
            // 表示用テキスト (+5% などを生成)
            const sign = isUp ? '+' : '';
            if (item.format === 'percent') {
                // パーセント同士の差分はポイント差で表示
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
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    // 1. KPIカードの数値をPHR仕様に一時的に書き換え
    const summary = data.summary;
    const dailyData = data.dailyActivity;

    if (summary) {
        const cardSales = document.getElementById('kpi-sales');
        // 例: 売上エリアに「登録患者数」を表示
        if(cardSales) cardSales.textContent = summary.totalUsers ? summary.totalUsers.toLocaleString() : "0";

        const cardVisitors = document.getElementById('kpi-visitors');
        // 例: 来院数エリアに「診断ログ数」を表示
        if(cardVisitors) cardVisitors.textContent = summary.totalDiagnoses ? summary.totalDiagnoses.toLocaleString() : "0";
    }

    // 2. グラフ描画
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();

    // 日付と記録数
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
