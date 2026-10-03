const W = 40; // inner width in characters

const params = new URLSearchParams(window.location.search);
const link = params.get('link');

// output window
function base64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  
  const base64 = btoa(binary);
  
  return base64
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "");
}

function base64urlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  
  const binary = atob(base64);
  
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// output window
function topLine(t) {
  if (!t) return '╔' + '═'.repeat(W) + '╗';
  const s = ' ' + t + ' ';
  return '╔═' + s + '═'.repeat(W - 1 - s.length) + '╗';
}
const bottom = () => '╚' + '═'.repeat(W) + '╝';

function row(inner) {
  const r = document.createElement('div');
  r.className = 'row';
  r.style.width = (W + 2) + 'ch';
  r.innerHTML = '<span class="side">║</span><div class="in"></div><span class="side">║</span>';
  r.querySelector('.in').appendChild(inner);
  return r;
}
function line(text) { const d = document.createElement('div'); d.textContent = text; return d; }
function pad() { const s = document.createElement('span'); s.textContent = ' '; return s; }

function build(el, title, rows) {
  el.appendChild(line(topLine(title)));
  rows.forEach(r => el.appendChild(r));
  el.appendChild(line(bottom()));
}

// main frame
const input = document.createElement('input');
input.type = 'url'; input.placeholder = 'https://...'; input.autocomplete = 'off'; input.spellcheck = false;
const inWrap = document.createElement('div');
inWrap.style.cssText = 'display:flex;width:100%;padding:0 1ch;box-sizing:border-box';
inWrap.appendChild(input);

const btn = document.createElement('button');
btn.textContent = '[ longer ]';

const blank = () => row(document.createTextNode(''));
build(document.getElementById('main'), 'URL', [
  blank(), row(inWrap), blank(), row(btn), blank()
]);

// output frame
const out = document.createElement('div');
out.id = 'out';
out.textContent = '// output';
const outWrap = document.createElement('div');
outWrap.style.cssText = 'width:100%;padding:0 1ch;box-sizing:border-box';
outWrap.appendChild(out);
const copyBtn = document.createElement('button');
copyBtn.textContent = '[ copy ]';
build(document.getElementById('out-wrap'), 'OUTPUT', [blank(), row(outWrap), blank(), row(copyBtn), blank()]);

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((res, rej) => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
    ta.remove();
  });
}
copyBtn.addEventListener('click', () => {
  copyText(out.innerText).then(
    () => { copyBtn.textContent = '[ copied! ]'; },
    () => { copyBtn.textContent = '[ error ]'; }
  ).finally(() => setTimeout(() => { copyBtn.textContent = '[ copy ]'; }, 1500));
});

function handle(url) {
  out.textContent = window.location.href + "/?link=" + base64urlEncode(url);
}

function submit() {
  const url = input.value.trim();
  document.getElementById('out-wrap').classList.add('show');
  handle(url);
}
btn.addEventListener('click', submit);
input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  
// blinking stars 
  const chars = ['*', '.', '+', '·', '*', '✦'];
  for (let i = 0; i < 110; i++) {
    const s = document.createElement('span');
    s.className = 'star';
    s.textContent = chars[Math.floor(Math.random() * chars.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.top = Math.random() * 100 + 'vh';
    s.style.fontSize = (8 + Math.random() * 10) + 'px';
    s.style.animationDuration = (1 + Math.random() * 3) + 's';
    s.style.animationDelay = (-Math.random() * 4) + 's';
    document.body.appendChild(s);
  }

if (link != null){
  window.location.replace(base64urlDecode(link))
}