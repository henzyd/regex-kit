## What this changes

<!-- One or two sentences. What is different after this is merged? -->

## Why

<!-- The problem being solved. Link the issue if there is one: Closes #123 -->

## How you verified it

<!-- The most important section. Reviewers cannot re-derive this.
     Say what you actually ran and observed, not what you expect to be true. -->

- [ ] `npm run check` passes locally

<!-- If you could not verify part of it, say so plainly and why. That is far more
     useful than silence. -->

## Type of change

- [ ] Bug fix
- [ ] New pattern or helper
- [ ] Performance
- [ ] Refactor with no behaviour change
- [ ] Documentation
- [ ] Build, CI, or tooling

## Checklist

- [ ] Tests added or updated for the behaviour that changed
- [ ] `CHANGELOG.md` updated under `## [Unreleased]`, if this is user-visible
- [ ] New patterns have a test for strings they must reject, not only ones they accept
- [ ] No pattern can backtrack catastrophically on a long non-matching input
- [ ] Documentation under `docs/` updated, or no guide is made wrong by this

## Notes for the reviewer

<!-- Anything you are unsure about, a tradeoff you made, a case you deliberately did
     not handle. Flagging these gets you a faster review, not a harsher one. -->
