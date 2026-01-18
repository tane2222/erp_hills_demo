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
    initMonthSelector(); // ★追加
    
    // 初回ロード（今の月で）
    fetchData('getSales'); 
};

// =================================================================
// 画面初期化・メニュー制御
// =================================================================
function initDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    const dateElem = document.getElementById('current-date');
    if(dateElem) dateElem.textContent = now.toLocaleDateString('ja-JP', options);
}

function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // アクティブ表示の切り替え
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // ★修正箇所: <a>タグから正しく情報を取得する
            const link = item.querySelector('a');
            const target = link.dataset.target; // ここが修正ポイント
            const text = link.querySelector('span').textContent;
            
            if(pageTitle) pageTitle.textContent = text + ' ダッシュボード';

            // 画面切り替えロジック
            if (target === 'phr') {
                fetchData('getPhr');       // PHRデータ取得へ
            } else if (target === 'dashboard') {
                fetchData('getSales');     // 売上データ取得へ
            } else {
                alert('この機能は開発中です');
            }
        });
    });
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
    if(loadingElem) {
        loadingElem.style.display = 'block';
        loadingElem.textContent = 'データを取得中...';
    }

    // ★追加: 現在選択中の月を文字列にする ("2026/01")
    const targetMonthStr = getSelectedMonthString();

    try {
        const response = await fetch(GAS_API_URL, {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ 
                token: currentToken,
                action: actionType,
                targetMonth: targetMonthStr // ★GASへ送る
            })
        });

        // ... (以下、エラーハンドリング等は変更なし) ...
        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData = await response.json();
        if (jsonData.error) { alert(jsonData.message); return; }

        if (actionType === 'getPhr') {
            renderPhrDashboard(jsonData);
        } else {
            renderSalesDashboard(jsonData);
        }

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

// =================================================================
// 描画: 売上 (Sales) - Dynamic Version
// =================================================================
function renderSalesDashboard(data) {
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    // データ構造: { config: [...], summary: {...}, history: [...] }
    const config = data.config;
    const summary = data.summary;
    const history = data.history;

    const topContainer = document.getElementById('kpi-top-container');
    const subContainer = document.getElementById('kpi-sub-container');
    
    // コンテナの中身をクリア
    if(topContainer) topContainer.innerHTML = '';
    if(subContainer) subContainer.innerHTML = '';

    if (!config || !summary) return;

    // --- KPIカードの動的生成 ---
    config.forEach(item => {
        // 数値のフォーマット
        let displayValue = summary[item.key] || 0;
        let unit = '';
        
        if (item.format === 'currency') {
            displayValue = Number(displayValue).toLocaleString();
            unit = '¥';
        } else if (item.format === 'percent') {
            displayValue = Number(displayValue).toFixed(1);
            unit = '%';
        } else {
            displayValue = Number(displayValue).toLocaleString();
            unit = '';
        }

        // HTML生成
        const cardHtml = `
            <div class="card kpi-card">
                <div class="card-icon ${item.color}">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="card-info">
                    <h3>${item.label}</h3>
                    <p class="value">${unit === '¥' ? '¥' : ''}${displayValue}${unit === '%' ? '%' : ''}</p>
                    ${unit === '' && item.format !== 'percent' ? '<span style="font-size:12px; color:#999;">名/件</span>' : ''}
                </div>
            </div>
        `;

        // 配置場所に応じて挿入
        if (item.position === 'top') {
            if(topContainer) topContainer.insertAdjacentHTML('beforeend', cardHtml);
        } else {
            if(subContainer) subContainer.insertAdjacentHTML('beforeend', cardHtml);
        }
    });

    // --- グラフ描画 (主要項目のみ表示) ---
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();

    // グラフには「保険売上」と「自費売上」を表示（設定にキーが存在すれば）
    if (!history) return;

    const labels = history.map(item => item.date.substring(5)); // 月/日だけ表示
    const insuranceData = history.map(item => item.insurance_sales || 0);
    const selfPayData = history.map(item => item.self_pay_sales || 0);
    const visitorData = history.map(item => item.visitors || 0);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '自費売上',
                    data: selfPayData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: '保険売上',
                    data: insuranceData,
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: '来院数',
                    data: visitorData,
                    type: 'line',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { type: 'linear', display: true, position: 'left', stacked: true }, // 売上は積み上げ
                y1: { type: 'linear', display: true, position: 'right', grid: { display: false } }
            }
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
