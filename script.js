// --- Configuration: 診断コンテンツ ---
const DATA = {
  // 1. 歯周病
  periodontal: {
    title: '歯周病リスク',
    questions: [
      { text: '歯磨きの時、出血しますか？', options: [{t:'よくある', s:20}, {t:'たまに', s:10}, {t:'なし', s:0}] },
      { text: '起床時、口がネバネバしますか？', options: [{t:'はい', s:20}, {t:'少し', s:10}, {t:'いいえ', s:0}] },
      { text: '口臭を指摘されたことは？', options: [{t:'ある', s:20}, {t:'気なる', s:10}, {t:'ない', s:0}] },
      { text: '歯茎が下がった気がしますか？', options: [{t:'はい', s:20}, {t:'少し', s:10}, {t:'いいえ', s:0}] },
      { text: '定期検診に行っていますか？', options: [{t:'行っていない', s:20}, {t:'時々', s:10}, {t:'定期的に', s:0}] }
    ],
    results: [
      { max: 20, level: '安全圏', color: '#00C6AB', msg: '素晴らしい状態です。今のケアを続けましょう。' },
      { max: 60, level: '注意', color: '#FF9800', msg: '初期リスクがあります。クリーニングを推奨します。' },
      { max: 100, level: '危険', color: '#FF5252', msg: '進行している可能性があります。早急に受診してください。' }
    ]
  },
  // 2. 審美
  aesthetic: {
    title: '審美チェック',
    questions: [
      { text: '自分の歯の色は好きですか？', options: [{t:'嫌い', s:20}, {t:'普通', s:10}, {t:'好き', s:0}] },
      { text: '笑う時、口元を隠しますか？', options: [{t:'よく隠す', s:20}, {t:'たまに', s:10}, {t:'隠さない', s:0}] },
      { text: '写真の自分の歯が気になりますか？', options: [{t:'気になる', s:20}, {t:'少し', s:10}, {t:'気にならない', s:0}] }
    ],
    results: [
      { max: 20, level: '満足', color: '#00C6AB', msg: '自信をお持ちですね。現状を維持しましょう。' },
      { max: 40, level: '関心あり', color: '#FF9800', msg: 'ホワイトニング等でさらに魅力的にできる可能性があります。' },
      { max: 60, level: '要改善', color: '#FF5252', msg: '印象が大きく変わる可能性があります。ご相談ください。' }
    ]
  },
  // 3. ステイン
  stain: {
    title: 'ステインリスク',
    questions: [
      { text: 'コーヒーを毎日飲みますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] },
      { text: '紅茶や緑茶をよく飲みますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] },
      { text: '赤ワインを飲みますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] },
      { text: 'カレーなど色の濃い食べ物が好きですか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] },
      { text: 'タバコを吸いますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] }
    ],
    results: [
      { max: 1, level: '低リスク', color: '#00C6AB', msg: '着色のリスクは低いですが、油断は禁物です。' },
      { max: 3, level: '中リスク', color: '#FF9800', msg: '少し注意が必要です。食後のうがいを意識しましょう。' },
      { max: 5, level: '高リスク', color: '#FF5252', msg: '着色しやすい習慣です。定期的なクリーニングをお勧めします。' }
    ]
  },
  // 4. 口臭
  breath: {
    title: '口臭チェック',
    questions: [
      { text: '口の中が乾きやすいですか？', options: [{t:'よくある', s:20}, {t:'たまに', s:10}, {t:'ない', s:0}] },
      { text: '舌が白くなっていますか？', options: [{t:'はい', s:20}, {t:'少し', s:10}, {t:'いいえ', s:0}] },
      { text: '家族に口臭を指摘されたことは？', options: [{t:'ある', s:20}, {t:'ない', s:0}] }
    ],
    results: [
      { max: 20, level: '問題なし', color: '#00C6AB', msg: 'きれいな息が保たれています。' },
      { max: 40, level: '注意', color: '#FF9800', msg: 'ドライマウスや舌苔が原因かもしれません。水分補給を。' },
      { max: 60, level: '要ケア', color: '#FF5252', msg: 'ケアが必要です。歯科医院でのチェックをお勧めします。' }
    ]
  },
  // 5. ブラッシング
  brushing: {
    title: '磨き方診断',
    questions: [
      { text: '歯磨きにかける時間は？', options: [{t:'1分以内', s:20}, {t:'3分以内', s:10}, {t:'3分以上', s:0}] },
      { text: 'デンタルフロスを使っていますか？', options: [{t:'使っていない', s:20}, {t:'時々', s:10}, {t:'毎日', s:0}] },
      { text: '歯ブラシの交換頻度は？', options: [{t:'3ヶ月以上', s:20}, {t:'2ヶ月', s:10}, {t:'1ヶ月', s:0}] }
    ],
    results: [
      { max: 20, level: '優良', color: '#00C6AB', msg: '素晴らしい習慣です。その調子で続けましょう。' },
      { max: 40, level: '普通', color: '#FF9800', msg: 'あと一歩です。フロスの併用をお勧めします。' },
      { max: 60, level: '要改善', color: '#FF5252', msg: '磨き残しが多い可能性があります。指導を受けてみませんか？' }
    ]
  }
};

// --- ★修正：診断ごとのアドバイス文章 ---
const ADVICE_MESSAGES = {
  periodontal: "あなたのリスクレベルに基づき、専門家による早期のカウンセリングをお勧めします。",
  aesthetic: "ホワイトニングで、より白く美しい歯を手に入れませんか？当院では患者様に合わせたプランをご提案しています。",
  stain: "着色が気になる方には、微細な粒子で汚れを落とす「パウダーメンテナンス」がおすすめです。本来の白さを取り戻しましょう。",
  breath: "口臭ケアには、歯科専売の洗口液「ハビットプロ」が効果的です。毎日のケアにプラスして、クリアな息を保ちましょう。",
  brushing: "歯ブラシは毛先が開いていなくても、1ヶ月に1回は交換しましょう。新しい歯ブラシで効率よく汚れを落とすことが大切です。"
};

// --- Knowledge Data (★修正：お子様の歯Q&A) ---
const KNOWLEDGE_DATA = {
  perio_truth: { title: '歯周病の正体とは？', content: "実は歯周病は、口の中だけの問題ではありません。\n\n心筋梗塞や糖尿病など、全身の病気と深く関わっています。\n\n「サイレントキラー」と呼ばれる理由は、初期段階ではほとんど自覚症状がないためです。気づいた時には手遅れになり、歯を失う原因No.1となっています。" },
  pro_care: { title: 'プロのケア vs 自宅のケア', content: "「毎日磨いてるから大丈夫」と思っていませんか？\n\n実は歯ブラシで落とせる汚れは全体の約60%と言われています。\n\n残りの汚れ（バイオフィルム）は、歯科医院の専用機器でないと除去できません。3ヶ月に1度のプロケアが推奨されるのはこのためです。" },
  child: { 
    title: 'お子様の歯 Q&A', 
    content: "Q. フッ素はいつから？\nA. 歯が生え始めたらすぐに始められます。\n\nQ. 仕上げ磨きは何歳まで？\nA. 小学校中学年くらいまでは推奨しています。\n\nQ. 矯正を始めるタイミングは？\nA. 上の前歯２本、下の前歯４本、奥の6歳臼歯が生えた頃です。" 
  },
  implant: { title: 'インプラントの秘訣', content: "インプラントは「第二の永久歯」ですが、天然歯以上にケアが重要です。\n\nケアを怠ると「インプラント周囲炎」になり、抜け落ちてしまうこともあります。\n\n長持ちさせる秘訣は、毎日の丁寧なブラッシングと、定期的な噛み合わせのチェックです。" },
  goods: { title: 'おすすめケアグッズ', content: "【歯ブラシ】\nヘッドが小さめで、毛先が柔らかいものが歯周ポケットに届きやすくおすすめです。\n\n【デンタルフロス】\n歯ブラシだけでは届かない歯間の汚れを除去します。初心者にはホルダータイプ（Y字型）が使いやすいでしょう。" }
};

// --- Config ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycby-TmXAoKsyyie_srkFnvX3xghsPO4QQuIlSnEn-0c31uEX8Up6M5dwhEGwhd7dzgoMZg/exec'; 
const LIFF_ID = '2008709251-eFKUYcgF'; 

const app = {
  state: {
    user: null, history: [], radarData: [0,0,0,0,0],
    type: null, score: 0, qIndex: 0, answers: {},
    chartData: {}, // Myデンタルチャート用
    selectedTooth: null
  },

  init: async () => {
    const timer = setTimeout(() => { document.getElementById('global-loading').classList.add('hidden'); }, 5000);

    try {
      await liff.init({ liffId: LIFF_ID });
      if (!liff.isLoggedIn()) { liff.login(); return; }
      
      const profile = await liff.getProfile();
      app.state.user = profile;
      document.getElementById('user-name').innerText = profile.displayName;
      if(profile.pictureUrl) document.getElementById('user-icon').src = profile.pictureUrl;

      // データ取得（並列）
      await Promise.all([app.fetchUserData(), app.fetchChartData()]);

      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const id = params.get('id');

      if (page && id) {
        setTimeout(() => {
          if (page === 'check') app.startDiagnosis(id);
          if (page === 'know') app.showKnowledge(id);
        }, 500);
      }

    } catch (err) {
      console.error(err);
      app.state.user = { userId: 'dummy', displayName: 'Demo' };
      app.renderHistory();
      app.drawRadarChart([60, 40, 70, 50, 80]);
    } finally {
      clearTimeout(timer);
      const loader = document.getElementById('global-loading');
      if(loader) loader.classList.add('hidden');
    }
  },

  // --- Dental Chart Logic (New) ---
  openChart: () => {
    app.switchView('view-chart');
    document.querySelector('.bottom-nav').style.display = 'none';
    app.renderChartSvg();
  },

  fetchChartData: async () => {
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'get_chart', userId: app.state.user.userId })
      });
      const data = await res.json();
      if(data.status === 'success' && data.chartData) {
        app.state.chartData = data.chartData;
      }
    } catch(e) { console.log('Chart Fetch Error', e); }
  },

  renderChartSvg: () => {
    const teeth = document.querySelectorAll('.tooth');
    teeth.forEach(el => {
      el.classList.remove('warning', 'silver', 'ortho', 'missing');
      const id = el.id;
      const status = app.state.chartData[id];
      if (status && status !== 'healthy') {
        el.classList.add(status);
      }
      el.onclick = () => app.openToothModal(id);
    });
  },

  openToothModal: (toothId) => {
    app.state.selectedTooth = toothId;
    document.getElementById('modal-tooth-name').innerText = `部位: ${toothId}`;
    document.getElementById('modal-tooth').classList.remove('hidden');
  },

  setToothStatus: (status) => {
    if (app.state.selectedTooth) {
      app.state.chartData[app.state.selectedTooth] = status;
      app.renderChartSvg();
    }
    app.closeToothModal();
  },

  closeToothModal: () => {
    document.getElementById('modal-tooth').classList.add('hidden');
    app.state.selectedTooth = null;
  },

  saveChartData: () => {
    document.getElementById('global-loading').classList.remove('hidden');
    fetch(GAS_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'save_chart',
        userId: app.state.user.userId,
        chartData: app.state.chartData
      })
    }).then(() => {
      document.getElementById('global-loading').classList.add('hidden');
      alert('保存しました');
      app.finishAndReturn();
    }).catch(e => {
      document.getElementById('global-loading').classList.add('hidden');
      alert('保存に失敗しました');
    });
  },

  // --- Data Fetch ---
  fetchUserData: async () => {
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'get_user_data', userId: app.state.user.userId })
      });
      if(!res.ok) throw new Error("Net Error");
      const data = await res.json();
      if (data.status === 'success') {
        app.state.history = data.history;
        app.drawRadarChart(data.radar);
        app.renderHistory();
      }
    } catch(e) { 
      app.renderHistory(); 
      app.drawRadarChart([50,50,50,50,50]); 
    }
  },
  
  renderHistory: () => {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    
    // 実データのみ表示
    if (!app.state.history || app.state.history.length === 0) {
      list.innerHTML = '<div class="empty-state" style="text-align:center;color:#999;padding:20px;">履歴なし</div>';
      return;
    }

    app.state.history.forEach(h => {
      let title = h.type;
      if (DATA[h.type]) title = DATA[h.type].title;
      else if (KNOWLEDGE_DATA[h.type]) title = KNOWLEDGE_DATA[h.type].title;

      const d = document.createElement('div');
      d.className = 'history-item';
      
      const scoreText = (h.score > 0) ? `<span style="color:var(--primary);font-weight:bold;">${h.score}pt</span>` : '<span style="font-size:0.8rem;color:#888;">読了</span>';
      
      d.innerHTML = `
        <div style="display:flex; flex-direction:column;">
          <span class="h-date">${h.date}</span>
          <span class="h-title">${title}</span>
        </div>
        <div class="h-score">${scoreText}</div>
      `;
      list.appendChild(d);
    });
  },

  // --- Diagnosis Logic ---
  startDiagnosis: (type) => {
    app.state.type = type;
    app.state.score = 0;
    app.state.qIndex = 0;
    app.state.answers = {};
    app.renderQuestion();
    app.switchTab('menu'); 
    app.switchView('view-question'); 
    document.querySelector('.bottom-nav').style.display = 'none';
  },

  renderQuestion: () => {
    const qData = DATA[app.state.type].questions[app.state.qIndex];
    const total = DATA[app.state.type].questions.length;
    document.getElementById('progress-bar').style.width = `${((app.state.qIndex)/total)*100}%`;
    document.getElementById('q-current').innerText = app.state.qIndex + 1;
    document.getElementById('q-text').innerText = qData.text;

    const div = document.getElementById('q-options');
    div.innerHTML = '';
    qData.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-option';
      btn.innerText = opt.t;
      btn.onclick = () => app.handleAnswer(opt.s, opt.t);
      div.appendChild(btn);
    });
  },

  handleAnswer: (score, text) => {
    app.state.score += score;
    app.state.answers[`q${app.state.qIndex}`] = text;
    if (app.state.qIndex < DATA[app.state.type].questions.length - 1) {
      app.state.qIndex++;
      app.renderQuestion();
    } else {
      app.showResultCalc();
    }
  },

  showResultCalc: () => {
    document.getElementById('global-loading').classList.remove('hidden');
    const payload = {
      action: 'save_diagnosis', userId: app.state.user.userId, displayName: app.state.user.displayName,
      type: app.state.type, score: app.state.score, answers: app.state.answers
    };
    fetch(GAS_URL, {
      method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(payload)
    }).then(r=>r.json()).then(d=>{
      app.renderResultScreen();
      document.getElementById('global-loading').classList.add('hidden');
      app.switchView('view-result');
    }).catch(e=>{
      app.renderResultScreen();
      document.getElementById('global-loading').classList.add('hidden');
      app.switchView('view-result');
    });
  },

  renderResultScreen: () => {
    const score = app.state.score;
    const settings = DATA[app.state.type].results;
    const result = settings.find(r => score <= r.max) || settings[settings.length-1];
    
    document.getElementById('result-date').innerText = new Date().toLocaleDateString();
    document.getElementById('result-score').innerText = score;
    const badge = document.getElementById('result-level');
    badge.innerText = result.level; badge.style.backgroundColor = result.color;
    document.getElementById('result-summary').innerText = result.msg;
    
    const adviceEl = document.getElementById('result-advice');
    if (adviceEl) {
      // ★修正: 診断タイプごとのアドバイスを表示
      const adviceText = ADVICE_MESSAGES[app.state.type] || "定期的な検診で健康な歯を守りましょう。";
      adviceEl.innerText = adviceText;
    }

    app.drawResultBarChart(score);
  },

  // --- Knowledge Logic ---
  showKnowledge: (key) => {
    const data = KNOWLEDGE_DATA[key];
    if(!data) return;
    
    document.getElementById('k-title').innerText = data.title;
    document.getElementById('k-content').innerText = data.content;
    app.switchTab('menu');
    app.switchView('view-knowledge');
    document.querySelector('.bottom-nav').style.display = 'none';

    if(app.state.user && app.state.user.userId !== 'dummy') {
      fetch(GAS_URL, {
        method: 'POST', headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({
          action: 'log_knowledge',
          userId: app.state.user.userId,
          displayName: app.state.user.displayName,
          type: key
        })
      }).catch(e => console.log('Log Error', e)); 
    }
  },

  closeKnowledge: () => {
    app.switchTab('menu');
    app.switchSubTab('know');
  },

  // --- Navigation ---
  switchTab: (tabName) => {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.querySelector('.bottom-nav').style.display = 'flex';
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${tabName}`).classList.add('active');
    
    if (tabName === 'mypage') {
      document.getElementById('view-mypage').classList.remove('hidden');
      if (app.state.user && app.state.user.userId !== 'dummy') app.fetchUserData();
    } else {
      document.getElementById('view-menu').classList.remove('hidden');
    }
    window.scrollTo(0,0);
  },

  switchSubTab: (subName) => {
    document.querySelectorAll('.sub-nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`sub-${subName}`).classList.add('active');
    if (subName === 'check') {
      document.getElementById('content-check').classList.remove('hidden');
      document.getElementById('content-know').classList.add('hidden');
    } else {
      document.getElementById('content-check').classList.add('hidden');
      document.getElementById('content-know').classList.remove('hidden');
    }
  },

  switchView: (viewId) => {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    window.scrollTo(0,0);
  },

  finishAndReturn: () => app.switchTab('mypage'),

  // --- Charts ---
  drawResultBarChart: (score) => {
    const ctx = document.getElementById('scoreChart'); if(!ctx) return;
    const exist = Chart.getChart(ctx); if(exist) exist.destroy();
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['あなた', '平均', '理想'],
        datasets: [{
          data: [score, 45, 10], 
          backgroundColor: ['#0056D2', '#E0E0E0', '#00C6AB'],
          borderRadius: 8, barThickness: 40
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true, max: 100,
            grid: { display: true, drawBorder: false, color: '#f0f0f0' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },
  
  drawRadarChart: (d) => {
    const ctx = document.getElementById('radarChart'); if(!ctx) return;
    const exist = Chart.getChart(ctx); if(exist) exist.destroy();
    const is0 = d.every(v=>v===0); const data = is0 ? [50,50,50,50,50] : d;
    
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['歯茎','清潔','口臭','習慣','知識'],
        datasets: [{
          data: data,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: '#FFFFFF',
          pointBackgroundColor: '#00C6AB',
          borderWidth: 1.5, pointRadius: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
            grid: { color: 'rgba(255, 255, 255, 0.2)' },
            pointLabels: { color: '#FFFFFF', font: { size: 10 } },
            ticks: { display: false, max: 100, min: 0 }
          }
        }
      }
    });
  }
};
app.init();
