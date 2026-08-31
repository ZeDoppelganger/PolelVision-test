const views = [...document.querySelectorAll('.view')];
const scanButton = document.querySelector('#scanButton');
const uploadButton = document.querySelector('#uploadButton');
const fileInput = document.querySelector('#fileInput');
const videoUrl = document.querySelector('#videoUrl');
const progressFill = document.querySelector('#progressFill');
const percent = document.querySelector('#percent');
const scanStatus = document.querySelector('#scanStatus');
const toast = document.querySelector('#toast');
const findings = document.querySelector('#findings');

const statuses = ['Extraction des images clés…', 'Recherche de traces de génération…', 'Analyse de la synchronisation audio…', 'Évaluation de la source…'];
function showView(id) { views.forEach(view => view.classList.toggle('active', view.id === id)); }
function notify(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); }
function sourceLooksSuspicious() { return /ai|sora|midjourney|runway|synthetic|deepfake/i.test(videoUrl.value); }
function setFindings(items) { findings.innerHTML = items.map(item => `<article class="finding"><span class="finding-icon ${item.warning ? 'warning' : ''}">${item.warning ? '!' : '✓'}</span><div><h3>${item.title}</h3><p>${item.detail}</p></div></article>`).join(''); }
function showResult() {
  const suspicious = sourceLooksSuspicious();
  const title = document.querySelector('#resultTitle');
  const score = document.querySelector('#scoreValue');
  const label = document.querySelector('#scoreLabel');
  const detail = document.querySelector('#scoreDetail');
  const circle = document.querySelector('.score-circle');
  if (suspicious) {
    title.innerHTML = 'La vidéo présente des <em>signaux IA</em>.'; score.textContent = '42'; label.textContent = 'Signaux à surveiller'; detail.textContent = 'Plusieurs éléments sont compatibles avec une génération ou une modification par IA.'; circle.style.borderColor = 'var(--orange)'; circle.style.color = 'var(--orange)';
    setFindings([{warning:true,title:'Régions visuelles incohérentes',detail:'Des détails changent entre plusieurs images clés.'},{warning:true,title:'Métadonnées absentes',detail:'La source ne fournit pas d’informations de capture vérifiables.'},{title:'Audio cohérent',detail:'Aucun signe évident de clonage vocal détecté dans cet extrait.'}]);
  } else {
    title.innerHTML = 'La vidéo semble <em>authentique</em>.'; score.textContent = '84'; label.textContent = 'Indice d’authenticité élevé'; detail.textContent = 'Peu de signaux associés à une génération par IA ont été détectés.'; circle.style.borderColor = 'var(--green)'; circle.style.color = 'var(--green)';
    setFindings([{title:'Mouvements naturels',detail:'Les variations de visage, de lumière et de mouvement sont cohérentes.'},{title:'Audio synchronisé',detail:'La voix et les expressions observées correspondent.'},{warning:true,title:'Source à confirmer',detail:'Le contexte de publication reste à vérifier avant tout partage.'}]);
  }
  showView('resultView');
}
function startScan() {
  const url = videoUrl.value.trim();
  if (!url && !fileInput.files.length) { notify('Collez un lien ou importez une vidéo pour lancer l’analyse.'); return; }
  showView('scanningView');
  let value = 8; let phase = 0;
  progressFill.style.width = `${value}%`; percent.textContent = `${value} %`; scanStatus.textContent = statuses[0];
  const timer = setInterval(() => { value += Math.ceil(Math.random() * 10); phase = Math.min(statuses.length - 1, Math.floor(value / 26)); progressFill.style.width = `${Math.min(value, 100)}%`; percent.textContent = `${Math.min(value, 100)} %`; scanStatus.textContent = statuses[phase]; if (value >= 100) { clearInterval(timer); setTimeout(showResult, 300); } }, 380);
}
scanButton.addEventListener('click', startScan);
videoUrl.addEventListener('keydown', event => { if (event.key === 'Enter') startScan(); });
uploadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { if (fileInput.files[0]) { videoUrl.value = ''; notify(`« ${fileInput.files[0].name} » est prête à être analysée.`); } });
document.querySelectorAll('[data-go-home]').forEach(button => button.addEventListener('click', () => showView('homeView')));
document.querySelector('#shareButton').addEventListener('click', async () => { const shareData = { title:'Vrai — analyse vidéo', text:'J’ai vérifié cette vidéo avec Vrai.' }; try { if (navigator.share) await navigator.share(shareData); else { await navigator.clipboard.writeText(shareData.text); notify('Le résultat a été copié.'); } } catch (_) {} });
document.querySelector('#infoButton').addEventListener('click', () => notify('Vrai évalue des signaux : il ne remplace pas la vérification des sources.'));
