// =================================================================
// 設定
// =================================================================

// ★ここにGASのウェブアプリURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 


// =================================================================
// アプリケーション開始処理 (Firebase認証後に呼ばれる)
// =================================================================

/**
 * ログイン成功時にHTML側から呼ばれる関数
 * @param {string} token - Firebaseから取得したIDトークン
 */
window.startApp = function(token) {
    console.log("認証成功。アプリを開始します。");
    initDate();
    initMenu();
    fetchData(token); // トークンを渡してデータ取得へ
};


// =================================================================
// 画面初期化・UI操作
// =================================================================

// 日付表示の初期化
function initDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('ja-JP', options);
}

// サイドバーメニューのクリック制御
function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // アクティブクラスの切り替え
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // タイトルの変更（簡易実装）
            const text = item.querySelector('span').textContent;
            pageTitle.textContent = text + 'ダッシュボード';
            
            // 将来的な拡張: ここでページごとの表示切り替えロジックを入れる
            // if (item.dataset.target === 'phr') { ... }
        });
    });
}


// =================================================================
// データ取得 (API通信)
// =================================================================

async function fetchData(token) {
    // URLが未設定の場合のガード
    if (GAS_API_URL === 'YOUR_GAS_WEB_APP_URL_HERE') {
        console.warn('GAS_API_URLが設定されていません。ダミーデータで表示します。');
        renderDummyData(); 
        return;
    }

    try {
        // トークンをクエリパラメータとして付与してGASへリクエスト
        const urlWithToken = `${GAS_API_URL}?token=${token}`;
        
        const response = await fetch(urlWithToken, {
            method: "GET",
            mode: "cors",
            redirect: "follow" 
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const jsonData = await response.json();

        // GAS側からの認証エラーチェック
        if (jsonData.error) {
            console.error("Auth Error:", jsonData.message);
            alert("認証エラー: " + jsonData.message);
            // エラー時はローディング表示を更新
            document.getElementById('loading').textContent = 'アクセス権限がありません。';
            return;
        }

        // 正常にデータが取れた場合
        updateDashboard(jsonData);

    } catch (error) {
        console.error('Fetch Error:', error);
        document.getElementById('loading').textContent = 'データ取得に失敗しました。';
        // 開発中はエラー時もダミーを表示しておくと確認しやすい（本番では消しても良い）
        renderDummyData(); 
    }
}


// =================================================================
// 画面描画・グラフ生成
// =================================================================

// 取得したデータで画面全体を更新
function updateDashboard(data) {
    // ローディング非表示
    const loadingElem = document.getElementById('loading');
    if(loadingElem) loadingElem.style.display = 'none';

    // 1. KPIの更新 (最新のデータ行を表示)
    if(data.length > 0) {
        const latest = data[data.length - 1]; // 最後の行を最新とする
        
        // 数値を通貨フォーマット等に変換して表示
        const salesElem = document.getElementById('kpi-sales');
        if(salesElem) salesElem.textContent = Number(latest.selfPay).toLocaleString();
        
        const visitorElem = document.getElementById('kpi-visitors');
        if(visitorElem) visitorElem.textContent = latest.visitorCount;
    }

    // 2. グラフの描画
    renderChart(data);
}

// Chart.jsによるグラフ描画
function renderChart(data) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    // 既存のチャートがあれば破棄（再描画のため）
    const chartStatus = Chart.getChart(canvas);
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    
    // データ加工
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
                    tension: 0.3, 
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
