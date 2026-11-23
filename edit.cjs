// Assemble the 32.7 s vertical video from the two gameplay recordings + end card + audio mix.
// Timeline:
//   0.0-1.5  HOOK   day7 [9.0,10.5]   "ONE PROMPT." / "ONE GAME."
//   1.5-9.4  DAY 1  day1 [4.0,11.9]   "DAY 1" label
//   9.4-10.4 TRANSITION (whoosh in audio) "DAY 7" + "one week of daily updates"
//  10.4-26.4 DAY 7  day7 [6.0,22.0]
//  26.4-30.2 CLOSE  day7 [22.0,25.8] "Start yours at make.fun"
//  30.2-32.7 END CARD day7 [25.8,28.3] blurred/desat + press card + code mxhczr02
const { execSync } = require('node:child_process');
const DIR = '/home/hatch/workspace/makefun/post-tiktok-day7-v2';
const FONT = 'JetBrainsMono-Bold.ttf';

function dt(text, size, color, y, enable, extra) {
  return `drawtext=fontfile=${FONT}:text='${text}':fontsize=${size}:fontcolor=${color}:borderw=6:bordercolor=black@0.6:x=(w-text_w)/2:y=${y}:enable='between(t,${enable})'${extra || ''}`;
}

const vf = [
  // segments
  "[0:v]trim=start=9.0:end=10.5,setpts=PTS-STARTPTS,fps=30[hook]",
  "[1:v]trim=start=4.0:end=11.9,setpts=PTS-STARTPTS,fps=30[d1]",
  "[0:v]trim=start=6.0:end=22.0,setpts=PTS-STARTPTS,fps=30[d7]",
  "[0:v]trim=start=22.0:end=25.8,setpts=PTS-STARTPTS,fps=30[close]",
  "[0:v]trim=start=25.8:end=28.3,setpts=PTS-STARTPTS,fps=30,boxblur=14:2,eq=saturation=0.4[tail]",
  "[hook][d1][d7][close][tail]concat=n=5:v=1:a=0[base]",
  // overlays
  `[base]${dt('ONE PROMPT.', 110, 'white', 1050, '0.05,0.75')}[v1]`,
  `[v1]${dt('ONE GAME.', 110, '#ffd23f', 1050, '0.75,1.5')}[v2]`,
  `[v2]${dt('DAY 1', 150, 'white', 820, '1.5,3.3')}[v3]`,
  `[v3]${dt('DAY 7', 150, '#ffd23f', 800, '9.5,11.2')}[v4]`,
  `[v4]${dt('one week of daily updates', 52, 'white', 1010, '9.5,11.2')}[v5]`,
  `[v5]${dt('Start yours at make.fun', 64, 'white', 1480, '26.4,30.2', ":box=1:boxcolor=black@0.55:boxborderw=30")}[v6]`,
  // end card: shift its 2.5 s animation to start at 30.2, lay over the blurred tail
  "[2:v]setpts=PTS+30.2/TB[card]",
  "[v6][card]overlay=0:0[v7]",
  // caret cover (white 9x82 at 208,1230) once the field is at rest
  "[v7]drawbox=x=208:y=1230:w=9:h=82:color=white:t=fill:enable='between(t,31.6,32.7)'[v8]",
  // the referral code, typed in once the field rests (card rest 30.2+1.433=31.63)
  "[v8]drawtext=fontfile=JetBrainsMono-Bold.ttf:text='mxhczr02':fontsize=62:fontcolor=#191419:x=215:y=1235:enable='between(t,31.6,32.7)'[vout]",
].join(';');

const cmd = `ffmpeg -y -v error -i day7.webm -i day1.webm -i endcard-9x16.webm -i audio-mix.wav -filter_complex "${vf}" -map "[vout]" -map 3:a -t 32.7 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k final.mp4`;
execSync(cmd, { cwd: DIR, stdio: 'inherit' });
console.log('final.mp4 done');
execSync(`ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate -of default=noprint_wrappers=1 final.mp4`, { cwd: DIR, stdio: 'inherit' });
execSync(`ffmpeg -i final.mp4 -af volumedetect -f null - 2>&1 | grep -E 'mean_volume|max_volume'`, { cwd: DIR, stdio: 'inherit' });
// WhatsApp-sized copy: 720x1280, lighter bitrate, must stay under 16 MB.
execSync(`ffmpeg -y -v error -i final.mp4 -vf scale=720:1280 -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k final-wa.mp4`, { cwd: DIR, stdio: 'inherit' });
execSync(`ls -la final.mp4 final-wa.mp4`, { cwd: DIR, stdio: 'inherit' });
