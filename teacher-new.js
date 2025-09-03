/* =============== Teacher Dashboard (Offline, localStorage) =============== */
/* Storage keys */
const K = {
  students: 'nds_students',
  progress: 'nds_progress',
  quizzes:  'nds_quizzes',
  results:  'nds_results',
  points:   'nds_points'   // NEW: gamification (points & badges)
};

/* Helpers */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const uid = () => Math.random().toString(36).slice(2,9);
const get = (k, fallback) => { try{ return JSON.parse(localStorage.getItem(k)) ?? fallback; }catch{ return fallback; } };
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* Seed data once */
/* Seed data once (only if storage is completely empty) */
(() => {
  if (localStorage.getItem(K.students) === null) {
    set(K.students, [
      {id: uid(), name: "Amanpreet Kaur", class: "6A"},
      {id: uid(), name: "Gurpreet Singh", class: "7B"},
      {id: uid(), name: "Simran", class: "6B"}
    ]);
  }
  if (localStorage.getItem(K.progress) === null) set(K.progress, {});
  if (localStorage.getItem(K.quizzes)  === null) set(K.quizzes, []);
  if (localStorage.getItem(K.results)  === null) set(K.results, []);
  if (localStorage.getItem(K.points)   === null) set(K.points, {});
})();

/* Tabs */
(() => {
  const btns = $$('.tab-btn');
  const sections = {
    students: $('#tab-students'),
    quizzes:  $('#tab-quizzes'),
    reports:  $('#tab-reports'),
    gamification: $('#tab-gamification')  // NEW
  };
  btns.forEach(b => b.addEventListener('click', ()=>{
    btns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    Object.values(sections).forEach(s=>s.style.display='none');
    sections[b.dataset.tab].style.display='block';

    if (b.dataset.tab==='reports') renderReports();
    if (b.dataset.tab==='quizzes') renderQuizzesTable();
    if (b.dataset.tab==='gamification') renderGamification(); // NEW
  }));
})();

/* -------- STUDENTS -------- */
const renderStudents = () => {
  const students = get(K.students, []);
  const progress = get(K.progress, {});
  const course = $('#progress-course').value;
  const tbody = $('#students-table tbody');
  tbody.innerHTML = '';
  students.forEach(stu => {
    const tr = document.createElement('tr');
    const pct = progress[stu.id]?.[course] ?? 0;
    tr.innerHTML = `
      <td><input type="checkbox" class="row-check" data-id="${stu.id}"></td>
      <td>${stu.name}</td>
      <td>${stu.class}</td>
      <td><input type="number" min="0" max="100" value="${pct}" data-id="${stu.id}" class="progress-input" style="width:80px"></td>
      <td><button class="btn secondary btn-del" data-id="${stu.id}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });

  // events
  $('#check-all').checked = false;
  $$('#students-table .progress-input').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const id = inp.dataset.id;
      const val = Math.max(0, Math.min(100, Number(inp.value||0)));
      const prog = get(K.progress, {});
      prog[id] = prog[id] || {};
      prog[id][course] = val;
      set(K.progress, prog);
    });
  });
  $$('#students-table .btn-del').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      let students = get(K.students, []);
      students = students.filter(s=>s.id!==id);
      set(K.students, students);
      const prog = get(K.progress, {});
      delete prog[id];
      set(K.progress, prog);
      renderStudents();
    });
  });
};

$('#add-student').addEventListener('click', ()=>{
  const name = $('#stu-name').value.trim();
  const klass = $('#stu-class').value.trim();
  if(!name || !klass) return alert('Enter name and class.');
  const students = get(K.students, []);
  students.push({id: uid(), name, class: klass});
  set(K.students, students);
  $('#stu-name').value=''; $('#stu-class').value='';
  renderStudents();
});

$('#apply-progress').addEventListener('click', ()=>{
  const course = $('#progress-course').value;
  const val = Number($('#progress-value').value||0);
  if (val<0 || val>100) return alert('Enter % between 0 and 100.');

  const prog = get(K.progress, {});
  const points = get(K.points, {});

  $$('.row-check:checked').forEach(ch=>{
    const id = ch.dataset.id;
    prog[id] = prog[id] || {};
    prog[id][course] = val;

    // ✅ Award points if student completed at least 50%
    if (val >= 50) {
      points[id] = (points[id] || 0) + 10;  // +10 points
    }
  });

  set(K.progress, prog);
  set(K.points, points);
  renderStudents();
  renderGamification(); // refresh gamification
});

$('#clear-students').addEventListener('click', ()=>{
  if (!confirm('Clear all students and their progress?')) return;
  set(K.students, []);
  set(K.progress, {});
  renderStudents();
});

$('#export-students').addEventListener('click', ()=>{
  const students = get(K.students, []);
  const course = $('#progress-course').value;
  const progress = get(K.progress, {});
  const rows = [['Name','Class',`Progress - ${course}%`], ...students.map(s=>[
    s.name, s.class, progress[s.id]?.[course] ?? 0
  ])];
  const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'students_progress.csv';
  a.click();
});

/* course switch triggers table refresh */
$('#progress-course').addEventListener('change', renderStudents);
$('#check-all').addEventListener('change', e=>{
  $$('.row-check').forEach(c=>c.checked = e.target.checked);
});
renderStudents();

/* -------- QUIZZES -------- */
const renderQuizzesTable = () => {
  const quizzes = get(K.quizzes, []);
  const tbody = $('#quizzes-table tbody');
  tbody.innerHTML = '';
  quizzes.forEach(q=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${q.title}</td>
      <td>${q.course}</td>
      <td>${q.questions.length}</td>
      <td><a class="btn secondary" href="quiz-new.html?quiz=${q.id}">Open</a></td>
      <td><button class="btn secondary del-quiz" data-id="${q.id}">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
  $$('.del-quiz').forEach(b=> b.addEventListener('click', ()=>{
    if(!confirm('Delete this quiz?')) return;
    let quizzes = get(K.quizzes, []);
    quizzes = quizzes.filter(x=>x.id !== b.dataset.id);
    set(K.quizzes, quizzes);
    renderQuizzesTable();
  }));
};

/* dynamic question UI */
const questionField = (index) => {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.innerHTML = `
    <strong>Q${index+1}</strong>
    <input class="q-text" type="text" placeholder="Question text" style="width:100%;margin:.5rem 0">
    <div class="grid">
      <input class="opt" type="text" placeholder="Option A">
      <input class="opt" type="text" placeholder="Option B">
      <input class="opt" type="text" placeholder="Option C">
      <input class="opt" type="text" placeholder="Option D">
    </div>
    <div class="controls" style="margin-top:.5rem">
      <label>Correct option:
        <select class="ans">
          <option value="0">A</option><option value="1">B</option>
          <option value="2">C</option><option value="3">D</option>
        </select>
      </label>
      <button class="btn secondary remove-q">Remove</button>
    </div>
  `;
  wrap.querySelector('.remove-q').addEventListener('click', ()=> wrap.remove());
  return wrap;
};

$('#add-question').addEventListener('click', ()=>{
  const idx = $$('#questions .card').length;
  $('#questions').appendChild(questionField(idx));
});

$('#save-quiz').addEventListener('click', ()=>{
  const title = $('#quiz-title').value.trim();
  const course = $('#quiz-course').value;
  const qCards = $$('#questions .card');
  if (!title) return alert('Enter quiz title');
  if (qCards.length === 0) return alert('Add at least one question');

  const questions = qCards.map(card=>{
    const q = card.querySelector('.q-text').value.trim();
    const options = $$('.opt', card).map(inp=>inp.value.trim());
    const ans = Number(card.querySelector('.ans').value);
    if (!q || options.some(o=>!o)) throw new Error('Fill all question fields.');
    return { q, options, answerIndex: ans };
  });

  const quiz = { id: uid(), title, course, questions };
  const quizzes = get(K.quizzes, []);
  quizzes.push(quiz);
  set(K.quizzes, quizzes);

  // reset UI
  $('#quiz-title').value = ''; $('#questions').innerHTML = '';
  renderQuizzesTable();
  alert('Quiz saved. Use "Open" to start the quiz player.');
});

renderQuizzesTable();

/* -------- REPORTS -------- */
const renderReports = () => {
  const quizzes = get(K.quizzes, []);
  const results = get(K.results, []);
  const students = get(K.students, []);

  // by quiz
  const byQuiz = quizzes.map(q=>{
    const rs = results.filter(r=>r.quizId===q.id);
    const avg = rs.length ? Math.round(rs.reduce((a,b)=>a+b.scorePercent,0)/rs.length) : 0;
    return { title:q.title, attempts: rs.length, avg };
  });
  const tb1 = $('#report-quizzes tbody');
  tb1.innerHTML = '';
  byQuiz.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.title}</td><td>${r.attempts}</td><td>${r.avg}%</td>`;
    tb1.appendChild(tr);
  });

  // by student
  const byStu = students.map(s=>{
    const rs = results.filter(r=>r.studentId===s.id);
    const avg = rs.length ? Math.round(rs.reduce((a,b)=>a+b.scorePercent,0)/rs.length) : 0;
    return { name:s.name, attempts: rs.length, avg };
  });
  const tb2 = $('#report-students tbody');
  tb2.innerHTML = '';
  byStu.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.name}</td><td>${r.attempts}</td><td>${r.avg}%</td>`;
    tb2.appendChild(tr);
  });
};

/* --- Export Reports CSV --- */
$('#export-reports').addEventListener('click', ()=>{
  const quizzes = get(K.quizzes, []);
  const results = get(K.results, []);
  const students = get(K.students, []);

  let rows = [];
  rows.push(["--- Scores by Quiz ---"]);
  rows.push(["Quiz","Attempts","Average %"]);
  quizzes.forEach(q=>{
    const rs = results.filter(r=>r.quizId===q.id);
    const avg = rs.length ? Math.round(rs.reduce((a,b)=>a+b.scorePercent,0)/rs.length) : 0;
    rows.push([q.title, rs.length, avg]);
  });

  rows.push([]);
  rows.push(["--- Scores by Student ---"]);
  rows.push(["Name","Attempts","Average %"]);
  students.forEach(s=>{
    const rs = results.filter(r=>r.studentId===s.id);
    const avg = rs.length ? Math.round(rs.reduce((a,b)=>a+b.scorePercent,0)/rs.length) : 0;
    rows.push([s.name, rs.length, avg]);
  });

  const csv = rows.map(r=>r.join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "reports.csv";
  a.click();
});

/* -------- GAMIFICATION -------- */
function renderGamification() {
  const students = get(K.students, []);
  const points   = get(K.points, {});
  const tbody = document.querySelector('#points-table tbody');
  const leaderboard = document.querySelector('#leaderboard');

  tbody.innerHTML = '';
  leaderboard.innerHTML = '';

  // fill student points
  students.forEach(stu => {
    const pts = points[stu.id] || 0;
    const badges = pts >= 100 ? '🏆 Gold' 
                 : pts >= 50  ? '🥈 Silver' 
                 : pts >= 20  ? '🥉 Bronze' 
                 : '—';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${stu.name}</td><td>${pts}</td><td>${badges}</td>`;
    tbody.appendChild(tr);
  });

  // sort by points for leaderboard
  const sorted = [...students].sort((a,b)=>(points[b.id]||0) - (points[a.id]||0));
  sorted.forEach(stu => {
    const pts = points[stu.id] || 0;
    const li = document.createElement('li');
    li.textContent = `${stu.name} — ${pts} pts`;
    leaderboard.appendChild(li);
  });
  /* -------- DEMO DATA LOADER -------- */
document.getElementById("load-demo").addEventListener("click", () => {
  if (!confirm("This will overwrite your current data with demo records. Continue?")) return;

  // sample students
  const demoStudents = [
    {id: uid(), name: "Amanpreet Kaur", class: "6A"},
    {id: uid(), name: "Gurpreet Singh", class: "7B"},
    {id: uid(), name: "Simran", class: "6B"},
    {id: uid(), name: "Rohit Kumar", class: "5A"}
  ];

  // sample quizzes
  const demoQuizzes = [
    {
      id: uid(),
      title: "Basics of Computer",
      course: "Basic Computer Skills",
      questions: [
        { q: "What does CPU stand for?", options: ["Central Processing Unit","Computer Personal Unit","Central Power Utility","None"], answerIndex: 0 },
        { q: "Which device is used for typing?", options: ["Mouse","Keyboard","Monitor","Speaker"], answerIndex: 1 }
      ]
    },
    {
      id: uid(),
      title: "Simple Math Quiz",
      course: "Interactive Mathematics",
      questions: [
        { q: "2 + 2 = ?", options: ["3","4","5","6"], answerIndex: 1 },
        { q: "10 × 5 = ?", options: ["15","25","50","100"], answerIndex: 2 }
      ]
    }
  ];

  // sample results
  const demoResults = [
    { quizId: demoQuizzes[0].id, studentId: demoStudents[0].id, scorePercent: 80, ts: Date.now() },
    { quizId: demoQuizzes[0].id, studentId: demoStudents[1].id, scorePercent: 60, ts: Date.now() },
    { quizId: demoQuizzes[1].id, studentId: demoStudents[2].id, scorePercent: 100, ts: Date.now() }
  ];

  // store in localStorage
  set(K.students, demoStudents);
  set(K.progress, {}); // reset progress
  set(K.quizzes, demoQuizzes);
  set(K.results, demoResults);
  set(K.points, {}); // reset gamification points

  // re-render UI
  renderStudents();
  renderQuizzesTable();
  renderReports();
  renderGamification();

  alert("✅ Demo data loaded successfully!");
});
}
