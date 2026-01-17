// =================================================================
// 設定
// =================================================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 
let currentToken = ""; // トークンを保持しておく変数

// =================================================================
// アプリ開始
// =================================================================
window.startApp = function(token) {
    currentToken = token; // トークンを保存
    initDate();
    initMenu();
    // 初期表示は「経営数値(sales)」
    fetchData('getSales'); 
};

// =================================================================
// メニュー制御
// =================================================================
function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // アクティブ切り替え
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // タイトル変更
            const target = item.dataset.target; // htmlの data-target="..."
            const text = item.querySelector('span').textContent;
            if(pageTitle) pageTitle.textContent = text + ' ダッシュボード';

            // ★画面切り替えロジック
            if (target === 'phr') {
                // PHRデータの取得へ
                fetchData('getPhr');
            } else if (target === 'dashboard') {
                // 売上データの取得へ
                fetchData('getSales');
            } else {
                // まだ未実装のページ
                alert('この機能は開発中です');
            }
        });
    });
}

function initDate() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

// =================================================================
// データ取得 (共通)
// =================================================================
async function fetchData(actionType) {
    if (!currentToken) return;
    
    // ローディング表示
    const loadingElem = document.getElementById('loading');
    if(loadingElem) {
        loadingElem.style.display = 'block';
        loadingElem.textContent = 'データを取得中...';
    }

    try {
        const response = await fetch(GAS_API_URL, {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            // ★変更点: actionタイプ（getSales または getPhr）を送信
            body: JSON.stringify({ 
                token: currentToken,
                action: actionType 
            })
        });

        if (!response.ok) throw new Error('Network error');
        const jsonData = await response.json();

        if (jsonData.error) {
            alert("Error: " + jsonData.message);
            return;
        }

        // ★分岐: 取得したデータの種類に応じて描画関数を変える
        if (actionType === 'getPhr') {
            renderPhrDashboard(jsonData);
        } else {
            renderSalesDashboard(jsonData);
        }

    } catch (error) {
        console.error(error);
        if(loadingElem) loadingElem.textContent = 'データ取得エラー';
    }
}

// =================================================================
// 描画: 売上 (Sales)
// =================================================================
function renderSalesDashboard(data) {
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    // カード表示エリア（KPI）の更新は省略または必要に応じて実装
    // ここではグラフの更新のみ行います

    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    // 既存チャート破棄
    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();

    const labels = data.map(item => item.date);
    
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '自費売上 (円)',
                    data: data.map(item => item.selfPay),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    yAxisID: 'y'
                },
                {
                    label: '保険点数 (点)',
                    data: data.map(item => item.insurancePoints),
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
                y: { type: 'linear', display: true, position: 'left' },
                y1: { type: 'linear', display: true, position: 'right', grid: { display: false } }
            }
        }
    });
}

// =================================================================
// 描画: PHR (修正版)
// =================================================================
function renderPhrDashboard(data) {
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    // 1. サマリー情報の表示（KPIカードの数値を上書きする演出）
    // 実際のKPIカードIDに合わせて適宜調整してください
    const summary = data.summary;
    const dailyData = data.dailyActivity;

    // 例: 売上エリアなどを一時的にPHR情報に書き換え（デモ用）
    const cardSales = document.getElementById('kpi-sales');
    if(cardSales) {
        // カードのラベルを変えたい場合は親要素を操作する必要がありますが、ここでは数値のみ
        cardSales.textContent = summary.totalUsers.toLocaleString(); 
        // 単位などを変える処理が必要ならここに記述
        // cardSales.parentElement.querySelector('h3').textContent = 'PHR登録患者数';
    }

    const cardVisitors = document.getElementById('kpi-visitors');
    if(cardVisitors) {
        cardVisitors.textContent = summary.totalDiagnoses.toLocaleString();
        // cardVisitors.parentElement.querySelector('h3').textContent = '診断ログ総数';
    }


    // 2. グラフの描画 (daily_logsの推移)
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();

    // 日付ラベルとデータ
    const labels = dailyData.map(item => item.date);
    const logCounts = dailyData.map(item => item.count);

    new Chart(canvas, {
        type: 'line', // 推移を見るため折れ線に変更
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'PHR記録アクション数 (daily_logs)',
                    data: logCounts,
                    borderColor: 'rgba(59, 130, 246, 1)', // 青
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4 // 曲線にする
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: { display: true, text: '日別 患者PHR利用アクティビティ' },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: '記録数 (件)' }
                }
            }
        }
    });
}
