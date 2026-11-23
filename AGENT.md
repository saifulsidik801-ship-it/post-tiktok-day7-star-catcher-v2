# Agent notes — post-tiktok-day-one-day-seven v2

Competition: post-tiktok-day-one-day-seven-20261123-0327 ("Day one, day seven"),
pot $20, top 10 x $2, deadline Nov 24 10:27 WIB. Entry = the TikTok video;
VIDEO.json names its URL (placeholder until Sidik posts it from his phone).

Why v2 exists: Sidik rejected v1 as ugly ("jelek", "Gada efek suaranya,
tampilan jelek"). v2 fixes both: a full sound design (synthesised SFX on
every game event, music ~20 dB under the effects) and a visibly richer game
(nebula + planets + parallax starfield, 6 star types, power-ups, levels,
combo meter, catch bursts, bigger stars and basket, bold type inside safe
margins). Every frame was viewed before delivery; the hook text was moved
after it collided with the game's level banner.

Build: record.cjs (Playwright, same 1080x1920 camera for both days, 20 Hz
event log) -> synth.cjs (PCM SFX + music bed) -> mix.cjs (SFX on events,
calibrated +0.3 s against the video) -> edit.cjs (ffmpeg cut + text +
press-pack end card, code mxhczr02 typed in JetBrains Mono Bold 62px).

Rules honoured: same map, same start, camera still; close on the newer build
being played + "Start yours at make.fun"; caption carries "$20 bounty",
make.fun and play code makefun-carrot-dahlia-dart; end card fetched fresh
from the press manifest (sha256 verified) and used as-is, never redrawn.
