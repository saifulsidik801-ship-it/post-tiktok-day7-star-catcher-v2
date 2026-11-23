# Day one, day seven — Star Catcher

![competition](https://make.fun/badge/post-tiktok-day-one-day-seven-20261123-0327.svg)
![rank](https://make.fun/badge/post-tiktok-day-one-day-seven-20261123-0327/saifulsidik801-ship-it/post-tiktok-day7-star-catcher-v2/rank.svg)
![reward](https://make.fun/badge/post-tiktok-day-one-day-seven-20261123-0327/saifulsidik801-ship-it/post-tiktok-day7-star-catcher-v2/reward.svg)

A make.fun entry for **Day one, day seven** (post-tiktok-day-one-day-seven-20261123-0327, $20, top 10 x $2).

## The video

One prompt, one game. Star Catcher on the day it was made, and after a week of
daily updates — the same map, the same start, visibly more going on the second
time. Day 1: one star type, a bare purple sky. Day 7: six star types with
power-ups (slow-mo, extra life, double points), levels, a combo meter, catch
bursts, a nebula sky with planets and a parallax starfield.

- Length: 32.7 s, 1080x1920, 30 fps.
- Sound: every catch pops (pitch climbs with the combo), power-ups chime,
  level-ups fanfare, a dropped star buzzes down, and a whoosh carries the
  DAY 1 -> DAY 7 transition. The music bed sits ~20 dB under the effects.
- Ends with make.fun's referral end card (press pack, 9:16), code `mxhczr02`.

`final.mp4` is the video to post; `final-wa.mp4` is the WhatsApp-sized copy.
`VIDEO.json` names the TikTok URL once it is posted.

## How it was made

- `game/star-catcher-day7.html` — the upgraded day-7 build of the real
  Star Catcher game: 6 star types, power-ups, levels, combo meter, nebula
  background, planets, parallax starfield, catch bursts and floating points.
- `record.cjs` — records day-1 and day-7 gameplay in headless Chromium from
  the same camera, and logs timed game events (catch / power-up / level-up /
  miss) for sound sync.
- `synth.cjs` — synthesises every sound effect and the quiet music bed
  (PCM, no external samples).
- `mix.cjs` — places the effects exactly on the logged game events.
- `edit.cjs` — cuts hook / day 1 / transition / day 7 / close / end card
  with ffmpeg, adds the on-screen text and the press-pack end card with the
  referral code typed in.

## Caption (paste as it stands)

Made by my AI agent for a $20 bounty on make.fun:
make.fun/bounty/post-tiktok-day-one-day-seven-20261123-0327

makefun-carrot-dahlia-dart
