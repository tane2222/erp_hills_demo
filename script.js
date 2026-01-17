// =================================================================
// 設定
// =================================================================
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
            if(pageTitle) pageTitle.textContent = item.querySelector('span').textContent + 'ダッシュボード';
        });
    });
}

// =================================================================
// データ取得 (API通信) ★ここをPOSTに変更
// =================================================================
async function fetchData(token) {
    if (!token) return;

    try {
        console.log("GASへデータ要求送信 (POST)...");

        // ★変更点: POSTメソッドを使用し、bodyにJSONとしてトークンを入れる
        const response = await fetch(GAS_API_URL, {
            method: "POST",  // GETからPOSTへ
            mode: "cors",
            redirect: "follow",
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // GASのCORS対策でtext/plain推奨
            },
            body: JSON.stringify({ token: token }) // トークンを封筒に入れる
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const jsonData = await response.json();

        if (jsonData.error) {
            console.error("Server Error:", jsonData);
            alert(`エラー: ${jsonData.message}\n(詳細: ${jsonData.debugInfo || ''})`);
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

    // データが空配列の場合のガード
    if(Array.isArray(data) && data.length > 0) {
        const latest = data[data.length - 1];
        const salesElem = document.getElementById('kpi-sales');
        if(salesElem) salesElem.textContent = Number(latest.selfPay).toLocaleString();
        
        const visitorElem = document.getElementById('kpi-visitors');
        if(visitorElem) visitorElem.textContent = latest.visitorCount;
        
        renderChart(data);
    } else {
        // データがない場合
        document.getElementById('kpi-sales').textContent = "0";
        document.getElementById('kpi-visitors').textContent = "0";
        // 空のグラフなどを表示するか、メッセージを出す
    }
}

function renderChart(data) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const chartStatus = Chart.getChart(canvas);
    if (chartStatus != undefined) chartStatus.destroy();
    
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
    const dummyData = [
        { date: '1/1', insurancePoints: 0, selfPay: 0, visitorCount: 0 }
    ];
    updateDashboard(dummyData);
}
