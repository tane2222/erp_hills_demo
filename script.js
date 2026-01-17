// =================================================================
// 設定
// =================================================================
// ★前回のまま、あなたのGASウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 

let currentToken = ""; // トークン保持用

// =================================================================
// アプリケーション開始処理
// =================================================================
window.startApp = function(token) {
    console.log("アプリ開始: トークン取得済み");
    currentToken = token; 
    initDate();
    initMenu();
    // 初期表示
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
// データ取得 (API通信)
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
        console.log(`GASへデータ要求送信 (${actionType})...`);

        const response = await fetch(GAS_API_URL, {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ 
                token: currentToken,
                action: actionType 
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData = await response.json();

        if (jsonData.error) {
            console.error("Server Error:", jsonData);
            alert(`エラー: ${jsonData.message}`);
            if(loadingElem) loadingElem.textContent = 'エラー: ' + jsonData.message;
            return;
        }

        // 取得したデータに応じて描画処理を分岐
        if (actionType === 'getPhr') {
            renderPhrDashboard(jsonData);
        } else {
            renderSalesDashboard(jsonData);
        }

    } catch (error) {
        console.error('Fetch Error:', error);
        if(loadingElem) loadingElem.textContent = '通信エラーが発生しました。';
    }
}

// =================================================================
// 描画: 売上 (Sales)
// =================================================================
function renderSalesDashboard(data) {
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    // グラフ描画
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const chartStatus = Chart.getChart(canvas);
    if (chartStatus) chartStatus.destroy();
    
    // データが空の場合のガード
    if (!data || data.length === 0) {
        // 空のグラフなどを表示しても良いが、今回はそのまま
        return;
    }

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.map(item => item.date),
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
                    borderWidth: 3,
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
