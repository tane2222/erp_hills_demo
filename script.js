// GASのウェブアプリURL (前回のStepで取得したものをここに貼り付けてください)
// 例: const GAS_API_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxx/exec';
const GAS_API_URL = 'YOUR_GAS_WEB_APP_URL_HERE'; 

document.addEventListener('DOMContentLoaded', () => {
    initDate();
    initMenu();
    fetchData(); // データの取得開始
});

// 日付表示の初期化
function initDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('ja-JP', options);
}

// メニューのクリックイベント制御
function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // リンクのデフォルト動作を防ぐ
            e.preventDefault();

            // アクティブクラスの切り替え
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // タイトルの変更（デモ用）
            const text = item.querySelector('span').textContent;
            pageTitle.textContent = text + 'ダッシュボード';
            
            // "患者PHRアプリ連携" の場合のみ別ウィンドウで開く等の処理が可能
            // if (item.dataset.target === 'phr') { ... }
        });
    });
}

// GASからのデータ取得
async function fetchData() {
    // API URLが設定されていない場合のダミー動作防止
    if (GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
        console.warn('GAS_API_URLが設定されていません。ダミーデータで表示します。');
        renderDummyData(); 
        return;
    }

    try {
        const response = await fetch(GAS_API_URL, {
            method: "GET",
            mode: "cors",
            redirect: "follow" 
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const jsonData = await response.json();
        updateDashboard(jsonData);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').textContent = 'データ取得エラー（ダミー表示中）';
        renderDummyData(); // エラー時はダミーを表示
    }
}

// 取得したデータで画面更新
function updateDashboard(data) {
    document.getElementById('loading').style.display = 'none';

    // 1. KPIの更新 (直近のデータを合計などの計算をして表示するロジック)
    // ここでは簡易的にデータの最後の行を表示する例
    if(data.length > 0) {
        const latest = data[data.length - 1];
        // 数値を通貨フォーマット等に変換
        document.getElementById('kpi-sales').textContent = Number(latest.selfPay).toLocaleString();
        document.getElementById('kpi-visitors').textContent = latest.visitorCount;
    }

    // 2. グラフの描画
    renderChart(data);
}

// チャート描画処理
function renderChart(data) {
    const canvas = document.getElementById('salesChart');
    
    const labels = data.map(item => item.date); // 日付
    const insuranceData = data.map(item => item.insurancePoints); // 保険点数
    const selfPayData = data.map(item => item.selfPay); // 自費売上

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '自費売上 (円)',
                    data: selfPayData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)', // var(--accent-blue)
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: '保険点数 (点)',
                    data: insuranceData,
                    type: 'line',
                    borderColor: 'rgba(245, 158, 11, 1)', // var(--accent-orange)
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.3, // 曲線の滑らかさ
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { borderDash: [2, 4] },
                    title: { display: true, text: '自費売上 (円)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { display: false },
                    title: { display: true, text: '保険点数' }
                }
            }
        }
    });
}

// 開発用ダミーデータ生成（API未接続時用）
function renderDummyData() {
    const dummyData = [
        { date: '1/1', insurancePoints: 12000, selfPay: 30000, visitorCount: 20 },
        { date: '1/2', insurancePoints: 15000, selfPay: 45000, visitorCount: 25 },
        { date: '1/3', insurancePoints: 11000, selfPay: 20000, visitorCount: 18 },
        { date: '1/4', insurancePoints: 18000, selfPay: 60000, visitorCount: 30 },
        { date: '1/5', insurancePoints: 14000, selfPay: 55000, visitorCount: 22 },
    ];
    updateDashboard(dummyData);
}
