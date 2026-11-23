// Synthesise all SFX + the quiet music bed as WAV files (PCM 16-bit, 44.1kHz mono).
// No external samples: every sound is generated here so the edit owns its audio.
const fs = require('node:fs');
const path = require('node:path');
const DIR = '/home/hatch/workspace/makefun/post-tiktok-day7-v2';
const SR = 44100;

function writeWav(file, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(DIR, file), buf);
}
function sine(freq, t) { return Math.sin(2 * Math.PI * freq * t); }

// Pop: bright blip gliding up, pitch rises with combo. 0.14 s, loud.
function pop(combo) {
  const dur = 0.14, n = Math.floor(SR * dur), out = new Float32Array(n);
  const f0 = 620 + Math.min(combo, 12) * 55, f1 = f0 * 1.9;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, k = i / n;
    const f = f0 + (f1 - f0) * k;
    phase += 2 * Math.PI * f / SR;
    const env = Math.exp(-t * 38);
    out[i] = (Math.sin(phase) * 0.9 + Math.sin(phase * 2) * 0.25) * env;
  }
  return out;
}
// Chime: 3-note arpeggio for power-ups. 0.4 s.
function chime() {
  const notes = [880, 1174.66, 1567.98], dur = 0.45, n = Math.floor(SR * dur), out = new Float32Array(n);
  notes.forEach((f, idx) => {
    const start = Math.floor(idx * 0.07 * SR);
    for (let i = start; i < n; i++) {
      const t = (i - start) / SR;
      out[i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 0.55;
    }
  });
  return out;
}
// Fanfare: 4-note ascending for level-ups and the DAY 7 slam. 0.85 s.
function fanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5], dur = 0.9, n = Math.floor(SR * dur), out = new Float32Array(n);
  notes.forEach((f, idx) => {
    const start = Math.floor(idx * 0.1 * SR);
    for (let i = start; i < n; i++) {
      const t = (i - start) / SR;
      out[i] += (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(2 * Math.PI * f * 2 * t) * 0.2) * Math.exp(-t * 5) * 0.6;
    }
  });
  return out;
}
// Miss: descending buzz when a star drops. 0.3 s.
function miss() {
  const dur = 0.3, n = Math.floor(SR * dur), out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, k = i / n;
    const f = 300 + (120 - 300) * k;
    phase += 2 * Math.PI * f / SR;
    out[i] = (Math.sin(phase) * 0.8 + Math.sin(phase * 2.02) * 0.3) * Math.exp(-t * 10) * 0.9;
  }
  return out;
}
// Whoosh: noise sweep up for the DAY 1 -> DAY 7 transition. 0.9 s.
function whoosh() {
  const dur = 0.9, n = Math.floor(SR * dur), out = new Float32Array(n);
  let lp = 0, seed = 22222;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const cutoff = 0.02 + 0.25 * k * k;
    lp += cutoff * (rnd() - lp);
    const env = Math.sin(Math.PI * Math.min(1, k * 1.15));
    out[i] = lp * 2.2 * env;
  }
  return out;
}
// Music bed: slow soft pad, deliberately QUIET (peak ~0.06) so SFX dominate.
function music(totalSec) {
  const n = Math.floor(SR * totalSec), out = new Float32Array(n);
  const chords = [
    [220, 261.63, 329.63], [174.61, 220, 261.63],
    [196, 261.63, 329.63], [196, 246.94, 293.66],
  ];
  const chordLen = totalSec / chords.length;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const ci = Math.min(chords.length - 1, Math.floor(t / chordLen));
    const local = t - ci * chordLen;
    // Crossfade into the next chord over its last 1.2 s (no silent gap at boundaries).
    let w = 1;
    if (local > chordLen - 1.2 && ci < chords.length - 1) {
      w = 0.5 * (1 + Math.cos(Math.PI * (local - (chordLen - 1.2)) / 1.2));
    }
    const fade = Math.min(1, t / 0.8) * Math.min(1, (totalSec - t) / 0.8);
    const trem = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t);
    let v = 0;
    for (const f of chords[ci]) v += Math.sin(2 * Math.PI * f * t) * 0.33 * w;
    if (ci < chords.length - 1) for (const f of chords[ci + 1]) v += Math.sin(2 * Math.PI * f * t) * 0.33 * (1 - w);
    v += Math.sin(2 * Math.PI * 55 * t) * 0.25;
    out[i] = v * 0.06 * fade * trem;
  }
  return out;
}

writeWav('sfx-pop.wav', pop(1));
for (let c = 1; c <= 12; c++) writeWav('sfx-pop-c' + c + '.wav', pop(c));
writeWav('sfx-chime.wav', chime());
writeWav('sfx-fanfare.wav', fanfare());
writeWav('sfx-miss.wav', miss());
writeWav('sfx-whoosh.wav', whoosh());
writeWav('music-bed.wav', music(33));
console.log('synth done:', fs.readdirSync(DIR).filter(f => f.startsWith('sfx-') || f === 'music-bed.wav').join(', '));
