# Agent Budget Fuse

An interactive technical demo of a practical Solana Native Subscriptions and Allowances use case: giving an autonomous AI agent useful purchasing power without giving it unlimited custody.

The user creates either:

- a **fixed delegation**, suitable for a finite trip, research, or procurement budget; or
- a **recurring delegation**, suitable for a daily or monthly API and compute budget.

The agent can request purchases, but the budget engine rejects spending above the configured allowance. The browser demo also generates the corresponding production integration shape.

## Why it matters

AI agents need a way to pay for APIs, data, compute, and services without receiving unrestricted access to a user's wallet. Solana's shared Subscriptions Delegation Program provides a root Subscription Authority plus narrow, revocable authorization records. This makes the spending policy enforceable instead of merely advisory.

The demo uses a Canadian weather API purchase as its default scenario, illustrating how Canadian API and AI companies could monetize agent-accessible services while customers retain hard spending limits.

## Run

No dependencies are required.

```bash
npm test
npx serve .
```

Open the printed local URL and:

1. Select a fixed or recurring allowance.
2. Set the USDC limit.
3. Ask the agent to purchase services.
4. Observe approved and denied transactions.
5. For recurring budgets, advance one period to see the allowance reset.

You can also open `index.html` directly in a browser.

## Production integration

This repository intentionally keeps the interactive demo dependency-free and does not request wallet signatures or spend funds. In production, replace `budget-engine.js` with calls to the audited [Solana Subscriptions Delegation Program](https://github.com/solana-program/subscriptions).

The production flow is:

1. The user initializes a Subscription Authority PDA for a token mint.
2. The user's token account approves that PDA as its delegate.
3. The user creates a fixed or recurring delegation for the agent's public key.
4. The agent signs pull transactions.
5. The program enforces amount, expiry, period, and destination constraints.
6. The user can revoke the delegation.

See the official [Subscriptions overview](https://solana.com/docs/payments/subscriptions/overview), [fixed delegation](https://solana.com/docs/payments/subscriptions/fixed-delegation), and [recurring delegation](https://solana.com/docs/payments/subscriptions/recurring-delegation) documentation.

## Security notes

- Never give an agent a wallet private key or recovery phrase.
- Start with short expiries and small limits.
- Treat insufficient balances and failed pulls as expected states.
- Make revocation obvious and easy.
- Validate the token program and Token-2022 extensions.
- The current program rejects Token-2022 mints configured with Transfer Hooks.

## Project structure

- `index.html` - interactive demo
- `ui.js` - browser UI and generated integration shape
- `budget-engine.js` - deterministic allowance model
- `budget-engine.test.js` - fixed, recurring, expiry, and overspend tests
