# Design workspace

This folder is for the design side of the fork: the parts that explain *why*
the app should change, not just what changed.

## Structure

- `screenshots/` — before/after captures, annotated when useful.
- `decisions/` — one short note per meaningful change: the problem, the
  options considered, and the chosen direction.
- `flows/` — sketches or flow diagrams for multi-screen work.

## A useful decision note

Keep it short enough to read on a phone:

```md
# Thread list: make active agents scannable

## Problem
Three agents running across two projects all look the same in the list. I have
to open each thread to see which one needs me.

## Change
Status becomes the leading visual instead of the project name. Active work gets
a motion cue; waiting-for-input gets a stronger one.

## Tradeoff
Project context moves to the second line, so scanning by project is slower.
That is the right trade for the "what needs me now?" job.
```

## Capturing evidence

- Simulator: `Cmd+S` saves a screenshot to the Desktop.
- Device: side button + volume up.
- Short interactions: record the simulator with `Cmd+R` (or QuickTime for a
  device), trim to the interaction, and keep it under 20 seconds.

Screenshots live in `screenshots/<area>/<before|after>-<short-name>.png`.
