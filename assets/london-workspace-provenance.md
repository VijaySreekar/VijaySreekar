# London workspace artwork

Decorative footer illustration generated with the built-in image generation tool on 6 September 2026. This is an imagined workspace, not a photograph or project screenshot. Saved asset: `london-workspace.png`.

Style reference: the existing `hero-static.png` London-to-cloud artwork. The original banner was retained unchanged.

## Generation prompt

Use case: stylized-concept. Create a new wide decorative footer illustration for Vijay Sreekar's GitHub portfolio, 3:1 panoramic composition. Reference image is STYLE AND PALETTE ONLY, not an edit target: retain its elegant illustrated London/cloud identity, midnight navy, muted cyan, warm gold, atmospheric depth, restrained texture. New scene: a quiet developer's workspace beside a large window overlooking London's Thames and illuminated skyline at blue hour. An open laptop with abstract unobtrusive code marks (no readable words), a small notebook and desk lamp, with the river and city beyond. Crisp considered composition, mature editorial illustration, not photoreal, not a UI screenshot. Balanced warm desk light and cool city light. Keep detailed objects along the lower half, spacious dark blue upper region. No people, no logos, no badges, no slogans, no readable text, no statistics, no artificial UI, no invented project interfaces. This complements the existing main London-to-cloud banner rather than replacing it.

## Animated banner

`london-workspace-animated.gif` is a locally rendered animation of the same illustration, built by `scripts/build-london-animation.cjs` using Canvas and Sharp. The original composition stays fixed; localized river displacement, lamplight, existing window lights, laptop glow, and fine steam ribbons repeat in an eight-second loop. The source PNG remains the reduced-motion fallback and footer artwork. The original London-to-cloud assets are retained in the repository.

Build dependencies: `@napi-rs/canvas` and `sharp`. Run `node scripts/build-london-animation.cjs` with those modules available.
