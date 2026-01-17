const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbwtRjHytAQqgge6pvM_eLcgTHPPlDVIbG0ujxGGVvJg884pMsMM_qXIiw0Gn1y4Z7EzuA/exec'; 

// ★変更点: HTML側のFirebase処理から呼ばれる関数を定義
window.startApp = function(token) {
    initDate();
    initMenu();
    fetchData(token); // トークンを渡して実行
};

// DOMContentLoadedでの自動実行は削除します（認証を待つため）
// document.addEventListener('DOMContentLoaded', () => { ... }); は削除またはコメントアウト

// ★変更点: 引数でtokenを受け取る
async function fetchData(token) {
    if (!token) return;

    try {
        // トークンをクエリパラメータとして付与
        const urlWithToken = `${GAS_API_URL}?token=${token}`;

        const response = await fetch(urlWithToken, {
            method: "GET",
            mode: "cors",
            redirect: "follow" 
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const jsonData = await response.json();

        // 認証エラーのチェック
        if (jsonData.error) {
            alert("データ取得エラー: " + jsonData.message);
            return;
        }

        updateDashboard(jsonData);

    } catch (error) {
        console.error('Error:', error);
        // エラー処理
    }
}

// ... updateDashboard, renderChart などの他の関数は変更なし ...
