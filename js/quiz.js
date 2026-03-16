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
  document.getElementById('infoJenjang').textContent = jenjang;
  document.getElementById('infoKelas').textContent = 'Kelas ' + kelas;
  document.getElementById('infoLevel').textContent = 'Level ' + level;

  document.getElementById('xpCount').textContent = localStorage.getItem('xp') || 0;
  document.getElementById('streakCount').textContent = localStorage.getItem('streak') || 0;

  generateSoal();
}

// =====================
// GENERATE SOAL (Claude API)
// =====================
async function generateSoal() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('soalState').style.display = 'none';

  const prompt = `
Buatkan 1 soal pilihan ganda Bahasa Inggris untuk siswa ${jenjang} kelas ${kelas} level ${level}/5.
Soal harus sesuai tingkat kesulitan level tersebut.

Balas HANYA dengan format JSON ini, tanpa teks lain:
{
  "soal": "pertanyaan di sini",
  "pilihan": {
    "A": "pilihan A",
    "B": "pilihan B",
    "C": "pilihan C",
    "D": "pilihan D"
  },
  "jawaban": "A",
  "penjelasan": "kenapa jawabannya itu"
}
`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    const text = data.result;

    const clean = text.replace(/```json|```/g, '').trim();
    soalData = JSON.parse(clean);

    tampilkanSoal();

  } catch (err) {
    console.error(err);
    document.getElementById('loadingState').innerHTML =
      '<p style="color:#ff6b6b">❌ Gagal load soal. Cek koneksi internet.</p>';
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

  document.getElementById('soalNomor').textContent = `Soal ${soalSekarang} dari ${totalSoal}`;
  document.getElementById('soalText').textContent = soalData.soal;
  document.getElementById('soalCount').textContent = `${soalSekarang}/${totalSoal}`;

  const group = document.getElementById('pilihanGroup');
  group.innerHTML = '';

  Object.entries(soalData.pilihan).forEach(([key, value]) => {
    const btn = document.createElement('button');
    btn.textContent = `${key}. ${value}`;
    btn.onclick = () => jawab(key, btn);
    group.appendChild(btn);
  });
}

// =====================
// JAWAB SOAL
// =====================
function jawab(pilihan, btnEl) {
  document.querySelectorAll('#pilihanGroup button').forEach(btn => {
    btn.disabled = true;
  });

  const benar = pilihan === soalData.jawaban;
  const feedbackBox = document.getElementById('feedbackBox');

  if (benar) {
    skorBenar++;
    btnEl.style.background = '#3ecf8e';
    btnEl.style.borderColor = '#3ecf8e';
    feedbackBox.style.background = '#0d3d2a';
    feedbackBox.style.borderColor = '#3ecf8e';
    feedbackBox.innerHTML = `✅ <strong>Benar!</strong><br>${soalData.penjelasan}`;

    let xp = parseInt(localStorage.getItem('xp')) || 0;
    xp += 10;
    localStorage.setItem('xp', xp);
    document.getElementById('xpCount').textContent = xp;

  } else {
    btnEl.style.background = '#ff6b6b';
    btnEl.style.borderColor = '#ff6b6b';
    feedbackBox.style.background = '#3d0d0d';
    feedbackBox.style.borderColor = '#ff6b6b';
    feedbackBox.innerHTML = `❌ <strong>Salah!</strong> Jawaban benar: <strong>${soalData.jawaban}</strong><br>${soalData.penjelasan}`;

    document.querySelectorAll('#pilihanGroup button').forEach(btn => {
      if (btn.textContent.startsWith(soalData.jawaban)) {
        btn.style.background = '#3ecf8e';
        btn.style.borderColor = '#3ecf8e';
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
  generateSoal();
}

// =====================
// SELESAI
// =====================
function selesai() {
  document.getElementById('soalState').style.display = 'none';
  document.getElementById('selesaiState').style.display = 'block';

  const persentase = Math.round((skorBenar / totalSoal) * 100);
  document.getElementById('skorAkhir').textContent =
    `Skor: ${skorBenar}/${totalSoal} (${persentase}%) — XP didapat: ${skorBenar * 10}`;
}

// =====================
// START
// =====================
init();
