import test from "node:test";
import assert from "node:assert/strict";
import {
  PERIOD_SECONDS,
  authorizeSpend,
  createFixedAllowance,
  createRecurringAllowance,
} from "./budget-engine.js";

test("fixed allowance approves spends within the cap", () => {
  const allowance = createFixedAllowance({ limit: 100, expiresAt: 2_000 });
  const result = authorizeSpend(allowance, 35, 1_000);
  assert.equal(result.approved, true);
  assert.equal(result.allowance.spent, 35);
});

test("fixed allowance rejects overspending and expiry", () => {
  const allowance = createFixedAllowance({ limit: 100, expiresAt: 2_000 });
  assert.equal(authorizeSpend(allowance, 101, 1_000).approved, false);
  assert.equal(authorizeSpend(allowance, 10, 2_000).reason, "Allowance expired");
});

test("recurring allowance resets at the next period", () => {
  const start = 1_000;
  const allowance = { ...createRecurringAllowance({ limit: 50, period: "day", startsAt: start }), spent: 50 };
  const result = authorizeSpend(allowance, 15, start + PERIOD_SECONDS.day);
  assert.equal(result.approved, true);
  assert.equal(result.allowance.spent, 15);
});
