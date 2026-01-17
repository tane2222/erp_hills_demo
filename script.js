// =================================================================
// 設定
// =================================================================

// ★重要：ここにあなたのGASウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 


// =================================================================
// アプリケーション開始処理
// =================================================================

window.startApp = function(token) {
    console.log("アプリ開始: トークン取得済み");
    initDate();
    initMenu();
    fetchData(token); 
};


// =================================================================
// 画面初期化
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
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const text = item.querySelector('span').textContent;
            if(pageTitle) pageTitle.textContent = text + 'ダッシュボード';
        });
    });
}


// =================================================================
// データ取得 (API通信)
// =================================================================

async function fetchData(token) {
    if (!token) {
        console.error("トークンがありません");
        return;
    }

    try {
        // ★修正点: encodeURIComponent でトークンを安全な形式に変換
        const urlWithToken = `${GAS_API_URL}?token=${encodeURIComponent(token)}`;
        
        console.log("GASへデータ要求送信...");

        const response = await fetch(urlWithToken, {
            method: "GET",
            mode: "cors",
            redirect: "follow" 
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const jsonData = await response.json();

        // エラーチェック
        if (jsonData.error) {
            console.error("Server Error:", jsonData);
            // エラー内容をアラートで表示（デバッグ用）
            alert(`認証エラー: ${jsonData.message}\n(詳細: ${jsonData.debugInfo || ''})`);
            document.getElementById('loading').textContent = 'エラー: ' + jsonData.message;
            return;
        }

        updateDashboard(jsonData);

    } catch (error) {
        console.error('Fetch Error:', error);
        document.getElementById('loading').textContent = '通信エラーが発生しました。';
        renderDummyData(); 
    }
}


// =================================================================
// 画面描画
// =================================================================

function updateDashboard(data) {
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    if(data.length > 0) {
        const latest = data[data.length - 1];
        const salesElem = document.getElementById('kpi-sales');
        if(salesElem) salesElem.textContent = Number(latest.selfPay).toLocaleString();
        
        const visitorElem = document.getElementById('kpi-visitors');
        if(visitorElem) visitorElem.textContent = latest.visitorCount;
    }

    renderChart(data);
}

function renderChart(data) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const chartStatus = Chart.getChart(canvas);
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    
    const labels = data.map(item => item.date);
    const insuranceData = data.map(item => item.insurancePoints);
    const selfPayData = data.map(item => item.selfPay);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '自費売上 (円)',
                    data: selfPayData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: '保険点数 (点)',
                    data: insuranceData,
                    type: 'line',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.3, 
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'bottom' } },
            scales: {
                x: { grid: { display: false } },
                y: {
                    type: 'linear', display: true, position: 'left',
                    grid: { borderDash: [2, 4] },
                    title: { display: true, text: '自費売上 (円)' }
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    grid: { display: false },
                    title: { display: true, text: '保険点数' }
                }
            }
        }
    });
}

function renderDummyData() {
    // 通信失敗時用のダミーデータ
    const dummyData = [
        { date: '1/1', insurancePoints: 0, selfPay: 0, visitorCount: 0 }
    ];
    updateDashboard(dummyData);
}
