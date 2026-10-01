# IKEA ReWard

Student prototype for the TEK830 Capstone (Chalmers, 2026), IKEA Challenge 1: *Make sustainable affordability the engine of growth*.

**The idea:** a cashback/points system where the reward depends on how sustainable a product is, not on how much you spend. Second-hand products get the highest reward. This makes the sustainable choice the affordable choice for families on a tight budget.

> This repository is a concept prototype built by students. It is not an official IKEA product and all product and sustainability data is simulated.

## What is in this repo

One React app with two parts:

| Route | What it is |
|---|---|
| `/` | Project website (problem, solution, prototype, sustainability impact, team, pitch, references, GenAI statement) |
| `/demo` | Interactive prototype: shop, product pages, bag, checkout, rewards wallet |
| `/demo/admin` | Admin panel where "IKEA" tunes the cashback model |

## Docs

Read these before writing code:

1. [`docs/SPEC.md`](docs/SPEC.md): what to build, routes, features, data model, acceptance criteria
2. [`docs/CASHBACK-MODEL.md`](docs/CASHBACK-MODEL.md): how scores, tiers and points are calculated
3. [`docs/DESIGN.md`](docs/DESIGN.md): design tokens and rules, measured from ikea.com
4. [`CLAUDE.md`](CLAUDE.md): working rules for Claude Code and for the team

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # Vitest
npm run build      # production build to dist/
```

## Team (Group 12)

Moa Pettersson, Sofia Nguyen, Isak Treptow, Sara Salam, Max Fägersten
