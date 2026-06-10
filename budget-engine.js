export const PERIOD_SECONDS = {
  hour: 60 * 60,
  day: 24 * 60 * 60,
  week: 7 * 24 * 60 * 60,
  month: 30 * 24 * 60 * 60,
};

export function createFixedAllowance({ limit, expiresAt }) {
  return { type: "fixed", limit, spent: 0, expiresAt };
}

export function createRecurringAllowance({ limit, period, startsAt }) {
  if (!PERIOD_SECONDS[period]) throw new Error("Unsupported period");
  return { type: "recurring", limit, spent: 0, period, periodStartedAt: startsAt };
}

export function authorizeSpend(allowance, amount, now) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { approved: false, reason: "Amount must be positive", allowance };
  }

  let current = { ...allowance };

  if (current.type === "fixed" && now >= current.expiresAt) {
    return { approved: false, reason: "Allowance expired", allowance: current };
  }

  if (current.type === "recurring") {
    const periodSeconds = PERIOD_SECONDS[current.period];
    const periodsElapsed = Math.floor((now - current.periodStartedAt) / periodSeconds);
    if (periodsElapsed > 0) {
      current = {
        ...current,
        spent: 0,
        periodStartedAt: current.periodStartedAt + periodsElapsed * periodSeconds,
      };
    }
  }

  const remaining = current.limit - current.spent;
  if (amount > remaining) {
    return {
      approved: false,
      reason: `Budget exceeded: ${remaining.toFixed(2)} USDC remaining`,
      allowance: current,
    };
  }

  return {
    approved: true,
    reason: "Spend authorized",
    allowance: { ...current, spent: current.spent + amount },
  };
}
