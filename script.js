// --- Configuration (省略なし) ---
const DATA = { /* ...前回のデータ... */ periodontal: { title: '歯周病リスク', questions: [ { text: '歯磨きの時、出血しますか？', options: [{t:'よくある', s:20}, {t:'たまに', s:10}, {t:'なし', s:0}] }, { text: '起床時、口がネバネバしますか？', options: [{t:'はい', s:20}, {t:'少し', s:10}, {t:'いいえ', s:0}] }, { text: '口臭を指摘されたことは？', options: [{t:'ある', s:20}, {t:'気なる', s:10}, {t:'ない', s:0}] }, { text: '歯茎が下がった気がしますか？', options: [{t:'はい', s:20}, {t:'少し', s:10}, {t:'いいえ', s:0}] }, { text: '定期検診に行っていますか？', options: [{t:'行っていない', s:20}, {t:'時々', s:10}, {t:'定期的に', s:0}] } ], results: [ { max: 20, level: '安全圏', color: '#00C6AB', msg: '素晴らしい状態です。今のケアを続けましょう。' }, { max: 60, level: '注意', color: '#FF9800', msg: '初期リスクがあります。クリーニングを推奨します。' }, { max: 100, level: '危険', color: '#FF5252', msg: '進行している可能性があります。早急に受診してください。' } ] }, aesthetic: { title: '審美チェック', questions: [ { text: '自分の歯の色は好きですか？', options: [{t:'嫌い', s:20}, {t:'普通', s:10}, {t:'好き', s:0}] }, { text: '笑う時、口元を隠しますか？', options: [{t:'よく隠す', s:20}, {t:'たまに', s:10}, {t:'隠さない', s:0}] }, { text: '写真の自分の歯が気になりますか？', options: [{t:'気になる', s:20}, {t:'少し', s:10}, {t:'気にならない', s:0}] } ], results: [ { max: 20, level: '満足', color: '#00C6AB', msg: '自信をお持ちですね。現状を維持しましょう。' }, { max: 40, level: '関心あり', color: '#FF9800', msg: 'ホワイトニング等でさらに魅力的にできる可能性があります。' }, { max: 60, level: '要改善', color: '#FF5252', msg: '印象が大きく変わる可能性があります。ご相談ください。' } ] }, stain: { title: 'ステインリスク', questions: [ { text: 'コーヒーを毎日飲みますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] }, { text: '紅茶や緑茶をよく飲みますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] }, { text: '赤ワインを飲みますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] }, { text: 'カレーなど色の濃い食べ物が好きですか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] }, { text: 'タバコを吸いますか？', options: [{t:'はい', s:1}, {t:'いいえ', s:0}] } ], results: [ { max: 1, level: '低リスク', color: '#00C6AB', msg: '着色のリスクは低いですが、油断は禁物です。' }, { max: 3, level: '中リスク', color: '#FF9800', msg: '少し注意が必要です。食後のうがいを意識しましょう。' }, { max: 5, level: '高リスク', color: '#FF5252', msg: '着色しやすい習慣です。定期的なクリーニングをお勧めします。' } ] }, breath: { title: '口臭チェック', questions: [ { text: '口の中が乾きやすいですか？', options: [{t:'よくある', s:20}, {t:'たまに', s:10}, {t:'ない', s:0}] }, { text: '舌が白くなっていますか？', options: [{t:'はい', s:20}, {t:'少し', s:10}, {t:'いいえ', s:0}] }, { text: '家族に口臭を指摘されたことは？', options: [{t:'ある', s:20}, {t:'ない', s:0}] } ], results: [ { max: 20, level: '問題なし', color: '#00C6AB', msg: 'きれいな息が保たれています。' }, { max: 40, level: '注意', color: '#FF9800', msg: 'ドライマウスや舌苔が原因かもしれません。水分補給を。' }, { max: 60, level: '要ケア', color: '#FF5252', msg: 'ケアが必要です。歯科医院でのチェックをお勧めします。' } ] }, brushing: { title: '磨き方診断', questions: [ { text: '歯磨きにかける時間は？', options: [{t:'1分以内', s:20}, {t:'3分以内', s:10}, {t:'3分以上', s:0}] }, { text: 'デンタルフロスを使っていますか？', options: [{t:'使っていない', s:20}, {t:'時々', s:10}, {t:'毎日', s:0}] }, { text: '歯ブラシの交換頻度は？', options: [{t:'3ヶ月以上', s:20}, {t:'2ヶ月', s:10}, {t:'1ヶ月', s:0}] } ], results: [ { max: 20, level: '優良', color: '#00C6AB', msg: '素晴らしい習慣です。その調子で続けましょう。' }, { max: 40, level: '普通', color: '#FF9800', msg: 'あと一歩です。フロスの併用をお勧めします。' }, { max: 60, level: '要改善', color: '#FF5252', msg: '磨き残しが多い可能性があります。指導を受けてみませんか？' } ] } };
const ADVICE_MESSAGES = { periodontal: "あなたのリスクレベルに基づき、専門家による早期のカウンセリングをお勧めします。", aesthetic: "ホワイトニングで、より白く美しい歯を手に入れませんか？当院では患者様に合わせたプランをご提案しています。", stain: "着色が気になる方には、微細な粒子で汚れを落とす「パウダーメンテナンス」がおすすめです。本来の白さを取り戻しましょう。", breath: "口臭ケアには、歯科専売の洗口液「ハビットプロ」が効果的です。毎日のケアにプラスして、クリアな息を保ちましょう。", brushing: "歯ブラシは毛先が開いていなくても、1ヶ月に1回は交換しましょう。新しい歯ブラシで効率よく汚れを落とすことが大切です。" };
const KNOWLEDGE_DATA = { perio_truth: { title: '歯周病の正体とは？', content: "実は歯周病は、口の中だけの問題ではありません。\n\n心筋梗塞や糖尿病など、全身の病気と深く関わっています。\n\n「サイレントキラー」と呼ばれる理由は、初期段階ではほとんど自覚症状がないためです。気づいた時には手遅れになり、歯を失う原因No.1となっています。" }, pro_care: { title: 'プロのケア vs 自宅のケア', content: "「毎日磨いてるから大丈夫」と思っていませんか？\n\n実は歯ブラシで落とせる汚れは全体の約60%と言われています。\n\n残りの汚れ（バイオフィルム）は、歯科医院の専用機器でないと除去できません。3ヶ月に1度のプロケアが推奨されるのはこのためです。" }, child: { title: 'お子様の歯 Q&A', content: "Q. フッ素はいつから？\nA. 歯が生え始めたらすぐに始められます。\n\nQ. 仕上げ磨きは何歳まで？\nA. 小学校中学年くらいまでは推奨しています。\n\nQ. 矯正を始めるタイミングは？\nA. 上の前歯２本、下の前歯４本、奥の6歳臼歯が生えた頃です。" }, implant: { title: 'インプラントの秘訣', content: "インプラントは「第二の永久歯」ですが、天然歯以上にケアが重要です。\n\nケアを怠ると「インプラント周囲炎」になり、抜け落ちてしまうこともあります。\n\n長持ちさせる秘訣は、毎日の丁寧なブラッシングと、定期的な噛み合わせのチェックです。" }, goods: { title: 'おすすめケアグッズ', content: "【歯ブラシ】\nヘッドが小さめで、毛先が柔らかいものが歯周ポケットに届きやすくおすすめです。\n\n【デンタルフロス】\n歯ブラシだけでは届かない歯間の汚れを除去します。初心者にはホルダータイプ（Y字型）が使いやすいでしょう。" } };
const TOOTH_NAMES = { UR1: '右上1 (中切歯)', UR2: '右上2 (側切歯)', UR3: '右上3 (犬歯)', UR4: '右上4 (第一小臼歯)', UR5: '右上5 (第二小臼歯)', UR6: '右上6 (第一大臼歯)', UR7: '右上7 (第二大臼歯)', UR8: '右上8 (親知らず)', UL1: '左上1 (中切歯)', UL2: '左上2 (側切歯)', UL3: '左上3 (犬歯)', UL4: '左上4 (第一小臼歯)', UL5: '左上5 (第二小臼歯)', UL6: '左上6 (第一大臼歯)', UL7: '左上7 (第二大臼歯)', UL8: '左上8 (親知らず)', LR1: '右下1 (中切歯)', LR2: '右下2 (側切歯)', LR3: '右下3 (犬歯)', LR4: '右下4 (第一小臼歯)', LR5: '右下5 (第二小臼歯)', LR6: '右下6 (第一大臼歯)', LR7: '右下7 (第二大臼歯)', LR8: '右下8 (親知らず)', LL1: '左下1 (中切歯)', LL2: '左下2 (側切歯)', LL3: '左下3 (犬歯)', LL4: '左下4 (第一小臼歯)', LL5: '左下5 (第二小臼歯)', LL6: '左下6 (第一大臼歯)', LL7: '左下7 (第二大臼歯)', LL8: '左下8 (親知らず)' };

const GAS_URL = 'https://script.google.com/macros/s/AKfycby-TmXAoKsyyie_srkFnvX3xghsPO4QQuIlSnEn-0c31uEX8Up6M5dwhEGwhd7dzgoMZg/exec'; 
const LIFF_ID = '2008709251-eFKUYcgF'; 

const app = {
  state: {
    user: null, history: [], radarData: [0,0,0,0,0],
    type: null, score: 0, qIndex: 0, answers: {},
    chartData: {}, selectedTooth: null, tempToothData: {},
    onboardStep: 1, regData: {},
    dailyLogTemp: { timing: null, tools: [], conditions: [] },
    // ★New States
    todayScore: 0, trendData: null
  },

  init: async () => {
    document.getElementById('global-loading').classList.remove('hidden');
    const timer = setTimeout(() => { document.getElementById('global-loading').classList.add('hidden'); }, 8000);
    try {
      await liff.init({ liffId: LIFF_ID });
      if (!liff.isLoggedIn()) { liff.login(); return; }
      const profile = await liff.getProfile();
      app.state.user = profile;
      const res = await fetch(GAS_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'check_user', userId: profile.userId }) });
      const data = await res.json();
      if (data.status === 'success' && data.registered) {
        if(data.userData && data.userData.name) document.getElementById('user-name').innerText = data.userData.name + " 様";
        else document.getElementById('user-name').innerText = profile.displayName;
        if(profile.pictureUrl) document.getElementById('user-icon').src = profile.pictureUrl;
        await Promise.all([app.fetchUserData(), app.fetchChartData()]);
        const params = new URLSearchParams(window.location.search);
        if (params.get('page') && params.get('id')) {
          setTimeout(() => {
            if (params.get('page') === 'check') app.startDiagnosis(params.get('id'));
            if (params.get('page') === 'know') app.showKnowledge(params.get('id'));
          }, 500);
        }
        app.switchTab('mypage');
      } else {
        app.switchView('view-register');
        document.querySelector('.bottom-nav').style.display = 'none';
      }
    } catch (err) {
      console.error(err);
      app.state.user = { userId: 'dummy', displayName: 'Guest' };
      app.switchTab('mypage');
      app.renderHistory(); app.drawRadarChart([60, 40, 70, 50, 80]);
    } finally {
      clearTimeout(timer);
      const loader = document.getElementById('global-loading');
      if(loader) loader.classList.add('hidden');
    }
  },

  // --- Main Fetch (Updated) ---
  fetchUserData: async () => {
    try {
      const res = await fetch(GAS_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'get_user_data', userId: app.state.user.userId }) });
      const data = await res.json();
      if(data.status==='success'){
        app.state.history = data.history;
        app.drawRadarChart(data.radar);
        app.renderHistory();
        
        // お口年齢
        if(data.dentalAge) {
          document.getElementById('dental-age').innerText = data.dentalAge;
          const diff = data.dentalAge - data.realAge;
          const diffEl = document.getElementById('age-diff-text');
          if (diff < 0) { diffEl.innerText = `実年齢より ${Math.abs(diff)}歳 若いです！✨`; diffEl.style.color = '#00C6AB'; } 
          else if (diff > 0) { diffEl.innerText = `実年齢より +${diff}歳 です。ケアしましょう！`; diffEl.style.color = '#FF5252'; } 
          else { diffEl.innerText = `実年齢と同じです。キープしましょう！`; diffEl.style.color = '#666'; }
        }

        // デイリーログ
        if(data.dailyLogs) {
          if(data.dailyLogs.morning) { document.getElementById('log-btn-morning').classList.add('done'); document.getElementById('status-morning').innerText='✅'; }
          if(data.dailyLogs.noon) { document.getElementById('log-btn-noon').classList.add('done'); document.getElementById('status-noon').innerText='✅'; }
          if(data.dailyLogs.night) { document.getElementById('log-btn-night').classList.add('done'); document.getElementById('status-night').innerText='✅'; }
        }

        // ★コンディションスコア描画
        if(data.todayScore !== undefined) {
          app.renderConditionRing(data.todayScore);
        }

        // ★トレンドグラフ描画
        if(data.trend) {
          app.drawTrendChart(data.trend);
        }
      }
    } catch(e){ app.renderHistory(); app.drawRadarChart([50,50,50,50,50]); }
  },

  // --- Condition Ring Logic ---
  renderConditionRing: (score) => {
    const el = document.getElementById('score-ring');
    const valEl = document.getElementById('condition-score');
    const adviceEl = document.getElementById('condition-advice');
    
    // スコアアニメーション
    let current = 0;
    const interval = setInterval(() => {
      if(current >= score) { clearInterval(interval); current = score; }
      valEl.innerText = current;
      
      // 色の決定 (Oura風)
      let color = '#FF5252'; // Bad
      let advice = '休息が必要です。無理せずケアしましょう。';
      if(current >= 60) { color = '#FF9800'; advice = 'まずまずの状態です。丁寧なケアを。'; } // Fair
      if(current >= 80) { color = '#00C6AB'; advice = '素晴らしいコンディションです！'; } // Good
      
      el.style.background = `conic-gradient(${color} ${current}%, #eee ${current}%)`;
      adviceEl.innerText = advice;
      current += 2;
    }, 20);
  },

  // --- Trend Chart Logic ---
  drawTrendChart: (trendData) => {
    const ctx = document.getElementById('trendChart'); if(!ctx) return;
    const exist = Chart.getChart(ctx); if(exist) exist.destroy();
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trendData.labels,
        datasets: [{
          label: 'スコア',
          data: trendData.data,
          backgroundColor: trendData.data.map(s => s >= 80 ? '#00C6AB' : (s >= 60 ? '#FF9800' : '#FF5252')),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
          x: { grid: { display: false } }
        }
      }
    });
  },

  // --- Registration Logic ---
  showConfirmRegistration: () => {
    const name = document.getElementById('reg-name').value;
    const birth = document.getElementById('reg-birth').value;
    if(!name || !birth) { alert("すべての項目を入力してください"); return; }
    const age = app.calculateAge(birth);
    app.state.regData = { name, birth, age };
    document.getElementById('conf-name').innerText = name;
    document.getElementById('conf-birth').innerText = birth;
    document.getElementById('conf-age').innerText = age;
    app.switchView('view-confirm-reg');
  },
  calculateAge: (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  },
  backToRegister: () => { app.switchView('view-register'); },
  executeRegistration: async () => {
    document.getElementById('global-loading').classList.remove('hidden');
    try {
      await fetch(GAS_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'register_user', userId: app.state.user.userId, name: app.state.regData.name, birth: app.state.regData.birth, age: app.state.regData.age }) });
      app.startOnboarding();
    } catch(e) { alert("登録エラー"); } finally { document.getElementById('global-loading').classList.add('hidden'); }
  },
  startOnboarding: () => { app.switchView('view-onboarding'); app.state.onboardStep = 1; app.updateSlide(); },
  nextSlide: () => {
    if (app.state.onboardStep < 3) { app.state.onboardStep++; app.updateSlide(); }
    else { 
      if(app.state.regData.name) document.getElementById('user-name').innerText = app.state.regData.name + " 様";
      app.switchTab('mypage'); app.fetchUserData(); app.fetchChartData(); 
    }
  },
  updateSlide: () => {
    for(let i=1; i<=3; i++) { document.getElementById(`slide-${i}`).classList.add('hidden'); document.getElementById(`dot-${i}`).classList.remove('active'); }
    const step = app.state.onboardStep;
    document.getElementById(`slide-${step}`).classList.remove('hidden'); document.getElementById(`dot-${step}`).classList.add('active');
    document.getElementById('btn-next-slide').innerText = (step === 3) ? "はじめる" : "次へ";
  },

  // --- Daily Log Logic ---
  openCareModal: (timing) => {
    app.state.dailyLogTemp = { timing: timing, tools: [], conditions: [] };
    document.querySelectorAll('.btn-tool, .btn-cond').forEach(el => el.classList.remove('selected'));
    const label = { morning: '朝', noon: '昼', night: '夜' }[timing];
    document.getElementById('care-modal-title').innerText = `${label}のケア記録`;
    document.getElementById('modal-care-log').classList.remove('hidden');
  },
  toggleTool: (tool) => {
    const idx = app.state.dailyLogTemp.tools.indexOf(tool);
    if(idx > -1) app.state.dailyLogTemp.tools.splice(idx, 1); else app.state.dailyLogTemp.tools.push(tool);
    document.getElementById(`tool-${tool}`).classList.toggle('selected');
  },
  toggleCond: (cond) => {
    const idx = app.state.dailyLogTemp.conditions.indexOf(cond);
    if(idx > -1) app.state.dailyLogTemp.conditions.splice(idx, 1); else app.state.dailyLogTemp.conditions.push(cond);
    document.getElementById(`cond-${cond}`).classList.toggle('selected');
  },
  closeCareModal: () => { document.getElementById('modal-care-log').classList.add('hidden'); },
  saveCareLog: async () => {
    const log = app.state.dailyLogTemp;
    if(log.tools.length === 0 && log.conditions.length === 0) { alert('項目を選択してください'); return; }
    document.getElementById('global-loading').classList.remove('hidden');
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await fetch(GAS_URL, {
        method: 'POST', headers: {'Content-Type': 'text/plain'},
        body: JSON.stringify({ action: 'save_daily_log', userId: app.state.user.userId, date: todayStr, timing: log.timing, tools: log.tools, conditions: log.conditions })
      });
      document.getElementById(`log-btn-${log.timing}`).classList.add('done');
      document.getElementById(`status-${log.timing}`).innerText = '✅';
      app.closeCareModal();
      // スコア再計算のためリロード
      app.fetchUserData();
    } catch(e) { alert("保存失敗"); } finally { document.getElementById('global-loading').classList.add('hidden'); }
  },

  // --- Other Existing Logic (省略なし) ---
  renderHistory: () => { const list = document.getElementById('history-list'); list.innerHTML = ''; if (!app.state.history || app.state.history.length === 0) { list.innerHTML = '<div class="empty-state" style="text-align:center;color:#999;padding:20px;">履歴なし</div>'; return; } app.state.history.forEach(h => { let title = h.type; if (DATA[h.type]) title = DATA[h.type].title; else if (KNOWLEDGE_DATA[h.type]) title = KNOWLEDGE_DATA[h.type].title; const d = document.createElement('div'); d.className = 'history-item'; const scoreText = (h.score > 0) ? `<span style="color:var(--primary);font-weight:bold;">${h.score}pt</span>` : '<span style="font-size:0.8rem;color:#888;">読了</span>'; d.innerHTML = `<div><span class="h-date">${h.date}</span><span class="h-title">${title}</span></div><div class="h-score">${scoreText}</div>`; list.appendChild(d); }); },
  openChart: () => { app.switchView('view-chart'); document.querySelector('.bottom-nav').style.display = 'none'; app.renderChartSvg(); },
  toggleWisdom: () => { const isChecked = document.getElementById('toggle-wisdom').checked; document.querySelectorAll('.wisdom').forEach(el => { if (isChecked) el.classList.remove('hidden'); else el.classList.add('hidden'); }); },
  fetchChartData: async () => { try { const res = await fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'get_chart', userId: app.state.user.userId }) }); const data = await res.json(); if(data.status === 'success' && data.chartData) app.state.chartData = data.chartData; } catch(e) {} },
  renderChartSvg: () => { const teeth = document.querySelectorAll('.tooth'); teeth.forEach(el => { el.classList.remove('warning', 'silver', 'ortho', 'missing'); const id = el.id; const data = app.state.chartData[id]; const status = (typeof data === 'object') ? data.status : data; if (status && status !== 'healthy') el.classList.add(status); el.onclick = () => app.openToothModal(id); }); },
  openToothModal: (toothId) => { app.state.selectedTooth = toothId; const currentData = app.state.chartData[toothId] || { status: 'healthy', sub: '', note: '' }; app.state.tempToothData = (typeof currentData === 'string') ? { status: currentData, sub:'', note:'' } : { ...currentData }; document.getElementById('modal-tooth-name').innerText = TOOTH_NAMES[toothId] || toothId; document.getElementById('tooth-note').value = app.state.tempToothData.note || ''; app.renderModalUI(); document.getElementById('modal-tooth').classList.remove('hidden'); },
  renderModalUI: () => { const d = app.state.tempToothData; document.querySelectorAll('.btn-status').forEach(btn => btn.classList.remove('selected')); const statusBtn = document.querySelector(`.btn-status.${d.status}`); if(statusBtn) statusBtn.classList.add('selected'); const subArea = document.getElementById('sub-options-area'); if (d.status === 'silver') { subArea.classList.remove('hidden'); document.querySelectorAll('.btn-sub').forEach(btn => btn.classList.remove('selected')); const buttons = document.querySelectorAll('.btn-sub'); buttons.forEach(b => { if(b.getAttribute('onclick').includes(`'${d.sub}'`)) b.classList.add('selected'); }); } else { subArea.classList.add('hidden'); } },
  selectStatus: (status) => { app.state.tempToothData.status = status; if(status !== 'silver') app.state.tempToothData.sub = ''; app.renderModalUI(); },
  selectSub: (sub) => { app.state.tempToothData.sub = sub; app.renderModalUI(); },
  confirmToothUpdate: () => { const note = document.getElementById('tooth-note').value; app.state.tempToothData.note = note; if (app.state.selectedTooth) { app.state.chartData[app.state.selectedTooth] = app.state.tempToothData; app.renderChartSvg(); } app.closeToothModal(); },
  closeToothModal: () => { document.getElementById('modal-tooth').classList.add('hidden'); app.state.selectedTooth = null; },
  saveChartData: () => { document.getElementById('global-loading').classList.remove('hidden'); fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'save_chart', userId: app.state.user.userId, chartData: app.state.chartData }) }).then(() => { document.getElementById('global-loading').classList.add('hidden'); alert('保存しました'); app.finishAndReturn(); }).catch(e => { document.getElementById('global-loading').classList.add('hidden'); alert('保存失敗'); }); },
  startDiagnosis: (type) => { app.state.type = type; app.state.score = 0; app.state.qIndex = 0; app.state.answers = {}; app.renderQuestion(); app.switchTab('menu'); app.switchView('view-question'); document.querySelector('.bottom-nav').style.display = 'none'; },
  renderQuestion: () => { const qData = DATA[app.state.type].questions[app.state.qIndex]; document.getElementById('progress-bar').style.width = `${((app.state.qIndex)/DATA[app.state.type].questions.length)*100}%`; document.getElementById('q-current').innerText = app.state.qIndex + 1; document.getElementById('q-text').innerText = qData.text; const div = document.getElementById('q-options'); div.innerHTML = ''; qData.options.forEach(opt => { const btn = document.createElement('button'); btn.className = 'btn-option'; btn.innerText = opt.t; btn.onclick = () => app.handleAnswer(opt.s, opt.t); div.appendChild(btn); }); },
  handleAnswer: (score, text) => { app.state.score += score; app.state.answers[`q${app.state.qIndex}`] = text; if (app.state.qIndex < DATA[app.state.type].questions.length - 1) { app.state.qIndex++; app.renderQuestion(); } else { app.showResultCalc(); } },
  showResultCalc: () => { document.getElementById('global-loading').classList.remove('hidden'); const payload = { action: 'save_diagnosis', userId: app.state.user.userId, displayName: app.state.user.displayName, type: app.state.type, score: app.state.score, answers: app.state.answers }; fetch(GAS_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(payload) }).then(r=>r.json()).then(d=>{ app.renderResultScreen(); document.getElementById('global-loading').classList.add('hidden'); app.switchView('view-result'); }).catch(e=>{ app.renderResultScreen(); document.getElementById('global-loading').classList.add('hidden'); app.switchView('view-result'); }); },
  renderResultScreen: () => { const score = app.state.score; const settings = DATA[app.state.type].results; const result = settings.find(r => score <= r.max) || settings[settings.length-1]; document.getElementById('result-date').innerText = new Date().toLocaleDateString(); document.getElementById('result-score').innerText = score; const badge = document.getElementById('result-level'); badge.innerText = result.level; badge.style.backgroundColor = result.color; document.getElementById('result-summary').innerText = result.msg; const adviceEl = document.getElementById('result-advice'); if (adviceEl) adviceEl.innerText = ADVICE_MESSAGES[app.state.type] || "定期的な検診で健康な歯を守りましょう。"; app.drawResultBarChart(score); },
  showKnowledge: (key) => { const data = KNOWLEDGE_DATA[key]; if(!data) return; document.getElementById('k-title').innerText = data.title; document.getElementById('k-content').innerText = data.content; app.switchTab('menu'); app.switchView('view-knowledge'); document.querySelector('.bottom-nav').style.display = 'none'; if(app.state.user && app.state.user.userId !== 'dummy') { fetch(GAS_URL, { method: 'POST', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify({ action: 'log_knowledge', userId: app.state.user.userId, displayName: app.state.user.displayName, type: key }) }).catch(e=>{}); } },
  closeKnowledge: () => { app.switchTab('menu'); app.switchSubTab('know'); },
  switchTab: (tabName) => { document.querySelectorAll('.view').forEach(el => el.classList.add('hidden')); document.querySelector('.bottom-nav').style.display = 'flex'; document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active')); document.getElementById(`nav-${tabName}`).classList.add('active'); if (tabName === 'mypage') { document.getElementById('view-mypage').classList.remove('hidden'); if (app.state.user && app.state.user.userId !== 'dummy') app.fetchUserData(); } else { document.getElementById('view-menu').classList.remove('hidden'); } window.scrollTo(0,0); },
  switchSubTab: (subName) => { document.querySelectorAll('.sub-nav-item').forEach(el => el.classList.remove('active')); document.getElementById(`sub-${subName}`).classList.add('active'); if (subName === 'check') { document.getElementById('content-check').classList.remove('hidden'); document.getElementById('content-know').classList.add('hidden'); } else { document.getElementById('content-check').classList.add('hidden'); document.getElementById('content-know').classList.remove('hidden'); } },
  switchView: (viewId) => { document.querySelectorAll('.view').forEach(el => el.classList.add('hidden')); document.getElementById(viewId).classList.remove('hidden'); window.scrollTo(0,0); },
  finishAndReturn: () => app.switchTab('mypage'),
  drawResultBarChart: (score) => { const ctx = document.getElementById('scoreChart'); if(!ctx) return; const exist = Chart.getChart(ctx); if(exist) exist.destroy(); new Chart(ctx, { type: 'bar', data: { labels: ['あなた', '平均', '理想'], datasets: [{ data: [score, 45, 10], backgroundColor: ['#0056D2', '#E0E0E0', '#00C6AB'], borderRadius: 8, barThickness: 40 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { display: true, drawBorder: false, color: '#f0f0f0' } }, x: { grid: { display: false } } } } }); },
  drawRadarChart: (d) => { const ctx = document.getElementById('radarChart'); if(!ctx) return; const exist = Chart.getChart(ctx); if(exist) exist.destroy(); const is0 = d.every(v=>v===0); const data = is0 ? [50,50,50,50,50] : d; new Chart(ctx, { type: 'radar', data: { labels: ['歯茎','清潔','口臭','習慣','知識'], datasets: [{ data: data, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: '#FFFFFF', pointBackgroundColor: '#00C6AB', borderWidth: 1.5, pointRadius: 3 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { angleLines: { color: 'rgba(255, 255, 255, 0.2)' }, grid: { color: 'rgba(255, 255, 255, 0.2)' }, pointLabels: { color: '#FFFFFF', font: { size: 10 } }, ticks: { display: false, max: 100, min: 0 } } } } }); }
};
app.init();
