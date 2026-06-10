import { authorizeSpend, createFixedAllowance, createRecurringAllowance, PERIOD_SECONDS } from "./budget-engine.js";

const el = (id) => document.getElementById(id);
let now = Math.floor(Date.now() / 1000);
let allowance;

function render(message = "Allowance ready.", approved) {
  const remaining = allowance ? allowance.limit - allowance.spent : 0;
  el("remaining").textContent = allowance
    ? `${remaining.toFixed(2)} of ${allowance.limit.toFixed(2)} USDC remaining`
    : "No allowance";
  el("meter").style.width = allowance ? `${(remaining / allowance.limit) * 100}%` : "0";
  el("result").textContent = message;
  el("result").className = approved === undefined ? "" : approved ? "approved" : "denied";

  const recurring = allowance?.type === "recurring";
  el("code").textContent = recurring
    ? `// Production shape using @solana-program/subscriptions\nawait createRecurringDelegation({\n  amountPerPeriod: ${allowance?.limit ?? 0}_000000n,\n  period: "${allowance?.period ?? "day"}",\n  delegate: agentPublicKey,\n  destination: merchantTokenAccount,\n});`
    : `// Production shape using @solana-program/subscriptions\nawait createFixedDelegation({\n  amount: ${allowance?.limit ?? 0}_000000n,\n  expiresAt: expiryTimestamp,\n  delegate: agentPublicKey,\n  destination: merchantTokenAccount,\n});`;
}

el("create").addEventListener("click", () => {
  const limit = Number(el("limit").value);
  allowance = el("model").value === "fixed"
    ? createFixedAllowance({ limit, expiresAt: now + PERIOD_SECONDS.week })
    : createRecurringAllowance({ limit, period: el("period").value, startsAt: now });
  render("Allowance created. The agent can spend only inside this guardrail.");
});

el("spend").addEventListener("click", () => {
  if (!allowance) return render("Create an allowance first.", false);
  const amount = Number(el("amount").value);
  const result = authorizeSpend(allowance, amount, now);
  allowance = result.allowance;
  render(`${el("service").value}: ${result.reason}`, result.approved);
});

el("reset").addEventListener("click", () => {
  if (!allowance || allowance.type !== "recurring") return render("Only recurring allowances reset.", false);
  now += PERIOD_SECONDS[allowance.period];
  const result = authorizeSpend(allowance, 0.000001, now);
  allowance = { ...result.allowance, spent: 0 };
  render("Advanced one period. The recurring budget has reset.", true);
});

render();
