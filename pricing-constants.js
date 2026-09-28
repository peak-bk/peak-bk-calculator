// Peak Bookkeeping — shared pricing constants.
// Source of truth for both the internal calculator (index.html) and the
// public range estimator (estimate.html). Edit values here; both pages
// load this file via <script src="pricing-constants.js"></script>, so a
// rate change only has to happen once instead of drifting between files.

const TIERS = [
  { id:'starter',    name:'Starter',    price:149,  txns:30,   accts:1, onboarding:120 },
  { id:'essentials', name:'Essentials', price:249,  txns:100,  accts:2, onboarding:180 },
  { id:'growth',     name:'Growth',     price:479,  txns:300,  accts:4, onboarding:240 },
  { id:'premium',    name:'Premium',    price:749,  txns:600,  accts:6, onboarding:395 },
  { id:'scale',      name:'Scale',      price:1499, txns:1000, accts:8, onboarding:595 }
];
const EXTRA_TXN_RATE = 0.75;   // per extra txn over Scale's cap
const EXTRA_ACCT_RATE = 30;    // per extra account over Scale's cap
const CLEANUP_DISCOUNT = 0.85;
const CLEANUP_MIN = 600;
const REVIEW_ONLY_FACTOR = 0.35;   // DEPRECATED as of 2026-08-11 — no longer used in calcCatchup().
                                    // Was a flat % of tier price for catch-up months already mostly
                                    // categorized; didn't scale with actual account complexity the
                                    // way R&R ongoing does, so it diverged for loan-heavy accounts.
                                    // Review-only pricing is now itemized (RECON_HR_BANK/CARD/LOAN,
                                    // same as R&R ongoing) — see catchupReviewBank/Cards/Loans in
                                    // index.html. Left here only because prior quotes built before
                                    // this date (e.g. PC #1's original review-only figure) used this
                                    // factor — do not recalculate those against the new formula,
                                    // honor what was already quoted.
const LOAN_CATEGORIZE_HR = 0.15;   // R&R hybrid add-on: Madison actually splits/codes each loan payment (principal vs.
                                    // interest) instead of just verifying the client's own entry. This is a small,
                                    // bounded, mechanical add on top of RECON_HR_LOAN, not a new analytical task —
                                    // the split amount is already determined during the existing reconciliation check,
                                    // this just covers the extra few minutes of actually entering it in QBO.
const RECON_HOURLY_RATE = 60;   // RECURRING reconciliation-task rate (Sept 2026 split). Covers anything that's the same
                                  // underlying task as ongoing monthly R&R reconciliation, whether billed as ongoing R&R
                                  // itself, elapsed/catch-up reconciliation at cutover, or the Standalone Cleanup tab's
                                  // review-only pass — cadence differs, the task doesn't. Matches the ~$60/hr effective
                                  // benchmark the flat monthly packages already use (see Pricing Rules sheet, cell A2),
                                  // since this is the same low-overhead recurring-work positioning, not named as a literal
                                  // rate to clients (packages and R&R monthly fees are both quoted as flat dollar amounts).
                                  // Also used, as a deliberate simplification, inside the timeline/capacity-planning
                                  // functions (estimateTimeline, estimateWeeksRaw, solveElapsedMonths,
                                  // calculateRequiredCapacity) to convert blended fee totals back into hours for
                                  // scheduling purposes — those totals mix RECON_HOURLY_RATE and AD_HOC_HOURLY_RATE work,
                                  // so using the lower rate here slightly overstates hours rather than understates them,
                                  // erring toward more schedule buffer, consistent with PROJECT_HOURS_BUFFER_FACTOR below.
const AD_HOC_HOURLY_RATE = 75;   // ONE-OFF / diagnostic-work rate (Sept 2026 split). Covers genuinely ad hoc, judgment-heavy
                                  // work that isn't routine reconciliation matching: the cutover complexity fee (inventory,
                                  // customer/vendor deposits, gift card/store credit liabilities), the fixed-asset schedule
                                  // verification fee, the "Additional hours from specific things you've already found" field,
                                  // and A/R & A/P diagnostic/cleanup. This rate DOES get named directly to clients (Out-of-
                                  // Scope Work clause, A/R & A/P Cleanup Fee), so it's set at the low end of the standard
                                  // $75-150/hr floor rather than below it, consistent with never quoting a bookkeeper rate
                                  // under industry norms even informally.
const RECON_CUTOVER_COMPLEXITY_HOURS = 2;   // flat hours for verifying inventory, customer/vendor deposits, or gift card/store credit
                                              // liabilities at cutover (accounts with no bank-style statement to check against).
                                              // Priced at AD_HOC_HOURLY_RATE, not RECON_HOURLY_RATE, see that constant's comment.
                                              // A/R and A/P are NOT priced from this constant, they have their own flat Diagnostic
                                              // Fee (RECON_CUTOVER_BASE) and hourly Cleanup rate. Rough estimate, not yet calibrated —
                                              // PC #1's actual findings here (Sept 2026: gift certificates and payment-in-kind
                                              // balances that turned out to be real barter transactions, not routine verification)
                                              // ran well past what 2 hours covers. Those specific items were CPA-flagged rather than
                                              // priced as bookkeeping work, so they don't by themselves prove this constant is too
                                              // low, but it's worth revisiting with real time data before the next R&R quote that
                                              // checks this box.
const RECON_CUTOVER_BASE = 300;   // base Transition Reconciliation fee — see index.html's fuller cutover formula (RECON_CUTOVER_PER_ACCOUNT/MAX) for the detailed per-account version
const PROJECT_HOURS_PER_WEEK_AVAILABLE = 10;   // Madison's usual capacity for one-time project work (True-Up / Catch-Up / Cleanup) on top of existing client load
const PROJECT_HOURS_BUFFER_FACTOR = 0.7;   // planning uses 70% of stated capacity (~7 hr/wk effective) so timeline estimates have real
                                            // margin built in for interruptions from existing clients, not a best-case number. Adjust if
                                            // real project timing consistently comes in faster or slower than this estimates.

function pickTier(txns, accts) {
  for (const t of TIERS) {
    if (txns <= t.txns && accts <= t.accts) return t;
  }
  return TIERS[TIERS.length - 1];
}
