# CandidCrowd visual system

Source of product direction: AGENTS.md. Reviewed with the ui-ux-pro-max skill.

The two automatic design-system searches returned wedding invitation / motion-heavy photography recommendations. These do not fully match this product, so their palettes and styles were not persisted as authoritative guidance. The following decisions are explicitly derived from the repository's editorial photography and premium consumer direction, with the skill's relevant accessibility and performance rules.

- Warm ivory background, dark olive text, moss green primary actions, soft sage secondary surfaces. Semantic tokens are defined in src/app/globals.css.
- Cormorant Garamond display type, DM Sans product UI. Serif italic is reserved for emotional emphasis and photo captions.
- Spacious layouts; thin separators; restrained card use. Hero photography uses paper-like framing; product UI uses subtle 6–12px radii.
- Photography is primary. No generic SaaS gradients, fabricated metrics/testimonials, or heavy motion.
- Server components by default; client boundaries only for navigation, photo demo, and event form.
- Responsive local images using next/image, explicit image containers, eager hero photos, lazy noncritical images. Fonts self-hosted through next/font.
- Visible keyboard focus, labeled controls, native disclosure/dialog elements, polite contextual demo feedback, and reduced-motion support.
- Main actions use at least 44px targets. 375px mobile, tablet, landscape, and desktop layouts must remain usable without horizontal overflow.
- UI copy is English for the first homepage, following the supplied homepage messaging. Event domain remains generic; wedding-specific names are sample content only.
- Never suggest preview media has been uploaded, that a draft is live, or that unspecified pricing/limits are established product policy.
