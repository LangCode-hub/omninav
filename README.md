# OmniNav project page

Static supplementary-video website for **OmniNav: Learning to Anticipate and React for High-Speed Quadrupedal Navigation amid Dense and Dynamic Obstacles**.

The page intentionally contains no author names, affiliations, contact details, analytics, or external font dependencies.

## Content

- Two YouTube embeds: Simulation (left), Real World (right).
- Six comparison scenes, each with this desktop arrangement:
  - Row 1: OmniNav, OmniNav(-).
  - Row 2: TRACE, ABS, Agile.
- Mobile layout stacks the videos without changing their order.
- Native video controls, muted playback by default, per-scene play/pause/reset controls, and 1x default playback.

## Local preview

Run `python tools/preview.py`, then open `http://127.0.0.1:8743`.
Use an HTTP preview instead of opening the HTML as a local file, so YouTube can receive the required referrer information.

Run `python tools/validate.py` to verify the expected files and layout configuration.

## GitHub Pages

The deployment workflow publishes only `dist/`. In the repository's **Settings → Pages**, choose **GitHub Actions** as the source. Pushing to `main` deploys the site.

All site URLs are relative, so the page works at a repository subpath. The 30 comparison videos are stored directly in the repository, not as Git LFS pointers. Use Git for uploading: the largest file exceeds the browser upload limit but is below the Git file-size limit.

## Media and anonymous review

Website video copies use H.264/AAC with fast-start MP4 packaging. Encoded video/audio are preserved; location, device, and other identifying metadata are omitted. The supplied media resolutions and frame rates are retained. The two overview videos are embedded from YouTube and are not included in this repository.

Removing names from a page cannot guarantee anonymity. Check the GitHub account, commit identity, YouTube channel, and any identifying material visible or audible in the videos before submitting a review link. Third-party players may expose their channel information.
