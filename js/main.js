// =====================
// DATA & STATE
// =====================
let pilihanJenjang = null;
let pilihanKelas = null;
let pilihanLevel = null;

const kelasPerJenjang = {
  SD:  [1, 2, 3, 4, 5, 6],
  SMP: [7, 8, 9],
  SMA: [10, 11, 12],
  SMK: [10, 11, 12]
};

// =====================
// LOAD XP & STREAK
// =====================
function loadStats() {
  const xp = localStorage.getItem('xp') || 0;
  const streak = localStorage.getItem('streak') || 0;
  document.getElementById('xpCount').textContent = xp;
  document.getElementById('streakCount').textContent = streak;
}

// =====================
// PILIH JENJANG
// =====================
function pilihJenjang(jenjang) {
  pilihanJenjang = jenjang;
  pilihanKelas = null;
  pilihanLevel = null;

  document.querySelectorAll('#jenjangGroup button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === jenjang);
  });

  const kelasGroup = document.getElementById('kelasGroup');
  kelasGroup.innerHTML = '';
  kelasPerJenjang[jenjang].forEach(k => {
    const btn = document.createElement('button');
    btn.textContent = 'Kelas ' + k;
    btn.onclick = () => pilihKelas(k, btn);
    kelasGroup.appendChild(btn);
  });

  document.getElementById('kelasSection').style.display = 'block';
  document.getElementById('levelSection').style.display = 'none';
  document.getElementById('mulaiSection').style.display = 'none';
}

// =====================
// PILIH KELAS
// =====================
function pilihKelas(kelas, btnEl) {
  pilihanKelas = kelas;
  pilihanLevel = null;

  document.querySelectorAll('#kelasGroup button').forEach(btn => {
    btn.classList.remove('active');
  });
  btnEl.classList.add('active');

  document.getElementById('levelSection').style.display = 'block';
  document.getElementById('mulaiSection').style.display = 'none';
}

// =====================
// PILIH LEVEL
// =====================
function pilihLevel(level) {
  pilihanLevel = level;

  document.querySelectorAll('#levelGroup button').forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === level);
  });

  document.getElementById('mulaiSection').style.display = 'block';
}

// =====================
// MULAI QUIZ
// =====================
function mulaiQuiz() {
  if (!pilihanJenjang || !pilihanKelas || !pilihanLevel) {
    alert('Lengkapi pilihan dulu ya!');
    return;
  }

  localStorage.setItem('jenjang', pilihanJenjang);
  localStorage.setItem('kelas', pilihanKelas);
  localStorage.setItem('level', pilihanLevel);

  window.location.href = 'pages/quiz.html';
}

// =====================
// STREAK LOGIC
// =====================
function cekStreak() {
  const today = new Date().toDateString();
  const lastLogin = localStorage.getItem('lastLogin');
  let streak = parseInt(localStorage.getItem('streak')) || 0;

  if (lastLogin !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLogin === yesterday.toDateString()) {
      streak += 1;
    } else {
      streak = 1;
    }

    localStorage.setItem('streak', streak);
    localStorage.setItem('lastLogin', today);
  }
}

// =====================
// INIT
// =====================
cekStreak();
loadStats();
