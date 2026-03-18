// =====================
// STATE
// =====================
let soalSekarang = 1;
let totalSoal = 10;
let skorBenar = 0;
let soalData = null;

const jenjang = localStorage.getItem('jenjang');
const kelas = localStorage.getItem('kelas');
const level = localStorage.getItem('level');

// =====================
// INIT
// =====================
function init() {
  if (!jenjang || !kelas || !level) {
    window.location.href = '../index.html';
    return;
  }

  document.getElementById('xpCount').textContent = localStorage.getItem('xp') || 0;
  document.getElementById('streakCount').textContent = localStorage.getItem('streak') || 0;

  updateProgress();
  generateSoal();
}

// =====================
// PROGRESS BAR
// =====================
function updateProgress() {
  const persen = ((soalSekarang - 1) / totalSoal) * 100;
  document.getElementById('progressBar').style.width = persen + '%';
  document.getElementById('quizLabel').textContent =
    `${jenjang} - Kelas ${kelas} - Level ${level} - Soal ${soalSekarang}/${totalSoal}`;
}

// =====================
// GENERATE SOAL
// =====================
async function generateSoal() {
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('soalState').style.display = 'none';
  document.getElementById('selesaiState').style.display = 'none';

  const prompt = `Buatkan 1 soal pilihan ganda Bahasa Inggris untuk siswa ${jenjang} kelas ${kelas} level ${level}/5. Sesuaikan kesulitan dengan level tersebut.

Balas HANYA dengan JSON ini tanpa teks lain:
{
  "soal": "pertanyaan",
  "pilihan": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "jawaban": "A",
  "penjelasan": "penjelasan singkat"
}`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    const clean = data.result.replace(/```json|```/g, '').trim();
    soalData = JSON.parse(clean);
    tampilkanSoal();

  } catch (err) {
    document.getElementById('loadingState').innerHTML = `
      <div style="text-align:center; color:#ff4b4b; padding: 40px 20px">
        <div style="font-size:2rem; margin-bottom:12px">&#9888;</div>
        <div style="font-weight:700; margin-bottom:8px">Gagal memuat soal</div>
        <div style="font-size:0.85rem; color:#afafaf; margin-bottom:20px">Cek koneksi internet kamu</div>
        <button onclick="generateSoal()" style="background:#58cc02; color:white; border:none; padding:12px 24px; border-radius:12px; font-weight:700; cursor:pointer">Coba Lagi</button>
      </div>`;
  }
}

// =====================
// TAMPILKAN SOAL
// =====================
function tampilkanSoal() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('soalState').style.display = 'block';
  document.getElementById('feedbackBox').style.display = 'none';
  document.getElementById('btnNext').style.display = 'none';

  document.getElementById('soalText').textContent = soalData.soal;

  const group = document.getElementById('pilihanGroup');
  group.innerHTML = '';

  Object.entries(soalData.pilihan).forEach(([key, value]) => {
    const btn = document.createElement('button');
    btn.className = 'pilihan-btn';
    btn.innerHTML = `<span class="pilihan-key">${key}</span>${value}`;
    btn.onclick = () => jawab(key, btn);
    group.appendChild(btn);
  });
}

// =====================
// JAWAB
// =====================
function jawab(pilihan, btnEl) {
  document.querySelectorAll('.pilihan-btn').forEach(btn => {
    btn.disabled = true;
  });

  const benar = pilihan === soalData.jawaban;
  const feedbackBox = document.getElementById('feedbackBox');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackText = document.getElementById('feedbackText');

  if (benar) {
    skorBenar++;
    btnEl.classList.add('benar');
    feedbackBox.className = 'feedback-box benar';
    feedbackTitle.textContent = 'Benar!';
    feedbackText.textContent = soalData.penjelasan;

    let xp = parseInt(localStorage.getItem('xp')) || 0;
    xp += 10;
    localStorage.setItem('xp', xp);
    document.getElementById('xpCount').textContent = xp;

  } else {
    btnEl.classList.add('salah');
    feedbackBox.className = 'feedback-box salah';
    feedbackTitle.textContent = 'Kurang tepat!';
    feedbackText.textContent = `Jawaban benar: ${soalData.jawaban}. ${soalData.penjelasan}`;

    document.querySelectorAll('.pilihan-btn').forEach(btn => {
      if (btn.querySelector('.pilihan-key').textContent === soalData.jawaban) {
        btn.classList.add('benar');
      }
    });
  }

  feedbackBox.style.display = 'block';
  document.getElementById('btnNext').style.display = 'block';
}

// =====================
// NEXT SOAL
// =====================
function nextSoal() {
  if (soalSekarang >= totalSoal) {
    selesai();
    return;
  }
  soalSekarang++;
  updateProgress();
  generateSoal();
}

// =====================
// SELESAI
// =====================
function selesai() {
  document.getElementById('soalState').style.display = 'none';
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('selesaiState').style.display = 'block';

  const persen = Math.round((skorBenar / totalSoal) * 100);
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('skorAkhir').textContent =
    `Skor ${skorBenar}/${totalSoal} (${persen}%) - XP didapat: +${skorBenar * 10}`;
}

// =====================
// START
// =====================
init();
