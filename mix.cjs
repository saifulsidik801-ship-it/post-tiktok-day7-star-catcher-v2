// Build the final audio mix: quiet music bed + SFX placed exactly on game events.
// Timeline (32.7 s total):
//   0.0-1.5  HOOK (day7 9.0-10.5)      pop 0.10, pop 0.80
//   1.5-9.4  DAY 1 (day1 4.0-11.9)     catch pops from day1 events
//   9.4-10.4 TRANSITION               whoosh 9.4, fanfare 9.6
//  10.4-26.4 DAY 7 (day7 6.0-22.0)    pops/chimes/fanfares/miss from day7 events
//  26.4-30.2 CLOSE (day7 22.0-25.8)   invite chime 26.5 + catch pops
//  30.2-32.7 END CARD (day7 25.8-28.3) level-up / miss under the card
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const DIR = '/home/hatch/workspace/makefun/post-tiktok-day7-v2';
const SYNC = 0.3; // calibration: events log ~0.3 s early vs the video

const day1 = JSON.parse(fs.readFileSync(path.join(DIR, 'day1-events.json'), 'utf8')).events;
const day7 = JSON.parse(fs.readFileSync(path.join(DIR, 'day7-events.json'), 'utf8')).events;

const clips = []; // {file, at (s), vol}
function add(file, at, vol) { clips.push({ file, at: +at.toFixed(3), vol }); }
function sfxFor(ev) {
  if (ev.type === 'catch') return 'sfx-pop-c' + Math.max(1, Math.min(12, ev.combo || 1)) + '.wav';
  if (ev.type === 'powerup') return 'sfx-chime.wav';
  if (ev.type === 'levelup') return 'sfx-fanfare.wav';
  if (ev.type === 'miss') return 'sfx-miss.wav';
  return 'sfx-pop.wav';
}
function mapEvents(events, clipStart, segStart) {
  for (const ev of events) {
    if (ev.t < clipStart || ev.t > clipStart + 30) continue;
    const at = (ev.t - clipStart) + segStart + SYNC;
    if (ev.type === 'catch') add(sfxFor(ev), at, 1.0);
    else if (ev.type === 'powerup') add('sfx-chime.wav', at, 0.95);
    else if (ev.type === 'levelup') add('sfx-fanfare.wav', at, 0.95);
    else if (ev.type === 'miss') add('sfx-miss.wav', at, 0.95);
  }
}
// Hook pops
add('sfx-pop-c1.wav', 0.10, 1.0);
add('sfx-pop-c6.wav', 0.80, 1.0);
// Day-1 catches (clip 4.0-11.9, segment 1.5-9.4), combo rises 1..6 across the segment
let d1i = 0;
for (const ev of day1) {
  if (ev.t < 4.0 || ev.t > 11.9) continue;
  d1i++;
  add('sfx-pop-c' + Math.min(12, d1i) + '.wav', (ev.t - 4.0) + 1.5 + SYNC, 1.0);
}
// Transition
add('sfx-whoosh.wav', 9.40, 1.0);
add('sfx-fanfare.wav', 9.60, 0.95);
// Day-7 main (clip 6.0-22.0, segment 10.4-26.4)
mapEvents(day7.filter(e => e.t >= 6.0 && e.t <= 22.0), 6.0, 10.4);
// Close (clip 22.0-25.8, segment 26.4-30.2)
add('sfx-chime.wav', 26.50, 0.8);
mapEvents(day7.filter(e => e.t > 22.0 && e.t <= 25.8), 22.0, 26.4);
// End-card tail (clip 25.8-28.3, segment 30.2-32.7)
mapEvents(day7.filter(e => e.t > 25.8 && e.t <= 28.3), 25.8, 30.2);

clips.sort((a, b) => a.at - b.at);
fs.writeFileSync(path.join(DIR, 'audio-timeline.json'), JSON.stringify(clips, null, 1));
console.log('SFX clips:', clips.length);
for (const c of clips) console.log(' ', c.at.toFixed(2), c.file, 'vol', c.vol);

const inputs = ['-i', 'music-bed.wav'];
clips.forEach((c) => inputs.push('-i', c.file));
const filters = [];
filters.push('[0:a]volume=1.0[music]');
clips.forEach((c, i) => {
  const ms = Math.round(c.at * 1000);
  filters.push(`[${i + 1}:a]adelay=${ms}|${ms},volume=${c.vol}[s${i}]`);
});
const all = ['[music]'].concat(clips.map((_, i) => `[s${i}]`)).join('');
filters.push(`${all}amix=inputs=${clips.length + 1}:normalize=0,alimiter=limit=0.95:level=false[aout]`);
const cmd = `ffmpeg -y -v error ${inputs.map(s => "'" + s + "'").join(' ')} -filter_complex "${filters.join(';')}" -map "[aout]" -t 32.7 -c:a pcm_s16le audio-mix.wav`;
execSync(cmd, { cwd: DIR, stdio: 'inherit' });
console.log('audio-mix.wav written');
const vd = execSync('ffmpeg -i audio-mix.wav -af volumedetect -f null - 2>&1', { cwd: DIR }).toString();
console.log(vd.split('\n').filter(l => /mean_volume|max_volume/.test(l)).join('\n'));
