#!/usr/bin/env python3
"""
Conductor SDD Deep-Tech Article Generator
=========================================
Generates dual-language (>2,500 words EN & >2,500 words PT-BR) technical article:
"Spec-Driven Development (SDD): Eliminating AI Code Drift and Multi-Turn Hallucinations with Formal Consensus"

Outputs:
- blog/en/spec-driven-development-eliminating-ai-code-drift-formal-consensus.html
- blog/desenvolvimento-orientado-a-especificacoes-eliminando-deriva-ia.html
- Publishes EN article to DEV.to with 12s initial stagger and 429 retry logic.

NOTE: Does NOT modify public/sitemap.xml, public/feed.xml, or run git commit/push.
"""

import os
import sys
import time
import json
import re
import urllib.request
import urllib.error

PROJECT_DIR = r"C:\Users\T-GAMER\Documents\Projects\benni-os.github.io"
sys.path.append(os.path.join(PROJECT_DIR, "automation"))
from generate_adam_and_benjamin_posts import get_html_template

DEV_TO_API_KEY = "WNN2GVYjuCkc129AzB4u7qqD"

META = {
    "title_en": "Spec-Driven Development (SDD): Eliminating AI Code Drift and Multi-Turn Hallucinations with Formal Consensus",
    "title_pt": "Desenvolvimento Orientado a Especificações (SDD): Eliminando Deriva de Código e Alucinações de Múltiplos Turnos com Consenso Formal",
    "slug_en": "spec-driven-development-eliminating-ai-code-drift-formal-consensus",
    "slug_pt": "desenvolvimento-orientado-a-especificacoes-eliminando-deriva-ia",
    "summary_en": "Why prompt-and-pray vibe coding collapses after 3-5 turns in large codebases, and how Spec-Driven Development, Conductor contracts, Elephant-Goldfish blind verification, and AST invariant checking enforce formal consensus.",
    "summary_pt": "Por que o vibe coding baseado em tentativa e erro colapsa após 3-5 turnos em grandes bases de código e como o Desenvolvimento Orientado a Especificações (SDD), contratos Conductor, verificação cega Elephant-Goldfish e checagem de invariantes em AST garantem consenso formal.",
    "hero_image": "/blog/assets/hero-05-genesis.png",
    "category": "Spec-Driven Engineering",
    "reading_time": "16 min read",
    "reading_time_pt": "16 min de leitura",
    "tags": ["ai", "softwarearchitecture", "coding", "devops"]
}

DEVTO_MD = r"""# Spec-Driven Development (SDD): Eliminating AI Code Drift and Multi-Turn Hallucinations with Formal Consensus

> **Why "Prompt-and-Pray" vibe coding collapses after 3–5 turns in production codebases—and how Conductor contracts, Elephant-Goldfish blind verification, and AST-level invariant checking turn probabilistic code generation into deterministic software engineering.**  
> *Authored by Benni Alencar — Chief AI Systems Architect & Founder at [Benni OS](https://benni-os.net/).*

---

## 1. The Collapse of "Prompt-and-Pray" Vibe Coding

Every engineering team that adopts AI coding assistants experiences the same deceptive honeymoon phase. On Turn 1, a developer types a natural-language prompt and watches a clean, idiomatic module appear in seconds. By Turn 2, a new endpoint is wired. By Turn 3, unit tests are generated. It feels like magic.

Then comes Turn 4. And Turn 5.

In any non-trivial codebase—repositories exceeding 50,000 lines of code, distributed microservices, strict schema boundaries, or multi-tenant state machines—**probabilistic "Prompt-and-Pray" vibe coding hits an exponential entropy wall.**

Instead of converging toward a stable architecture, each conversational turn introduces subtle structural decay:
1. **Compounding Context Drift:** As the conversation grows, earlier architectural constraints fall out of the model's effective attention window ("lost-in-the-middle" degradation). The model forgets that `UserRepository` enforces soft-deletes via `deleted_at IS NULL`, or that an upstream event bus requires idempotency keys.
2. **Silent Invariant Violations:** To satisfy the immediate prompt on Turn 5, the model quietly modifies a shared helper signature, weakens a TypeScript union type to `any`, or bypasses a validation middleware—breaking three unrelated modules that were not loaded into context.
3. **Multi-Turn Hallucination Cascades:** When a test fails on Turn 4, the developer pastes the stack trace. The LLM, optimizing for *local plausibility* rather than *global correctness*, invents a non-existent configuration flag or mocks out the failing assertion instead of fixing the root cause.
4. **The Confirmation Bias Trap:** Because the same model context that wrote the buggy implementation is also asked to review or fix it, it inherits its own flawed assumptions. It rationalizes broken abstractions rather than challenging them.

Mathematically, if each conversational turn $t$ has a small probability $p_{\text{drift}}$ of introducing an undocumented assumption or breaking an implicit invariant, the probability that a codebase remains architecturally sound after $k$ unverified turns decays exponentially:

$$P(\text{Sound}_k) = \prod_{t=1}^{k} (1 - p_{\text{drift}, t}) \approx (1 - \bar{p}_{\text{drift}})^k$$

Even with a modest per-turn drift rate of $p_{\text{drift}} = 0.15$, by Turn 5 the probability of zero architectural regression drops below $44\%$. By Turn 10, it collapses to $19\%$. In production systems, **vibe coding is not velocity—it is high-interest technical debt compounded at token speed.**

---

## 2. Spec-Driven Development (SDD): Inverting the Synthesis Pipeline

**Spec-Driven Development (SDD)** is a formal engineering discipline that eliminates multi-turn entropy by reversing the fundamental order of operations in AI-assisted software construction:

> **The SDD Axiom:** *Natural language is an unacceptable input for direct code synthesis. Intent must first be compiled into an immutable, machine-verifiable Specification Contract before a single line of implementation code is generated.*

In classical software engineering, formal methods (TLA+, Alloy, Design-by-Contract) were historically too expensive for day-to-day product velocity. In the era of AI code synthesis, however, the economics invert: **generating code is nearly free, while verifying correctness and preventing silent drift is the primary bottleneck.**

SDD resolves this bottleneck by introducing a deterministic intermediate representation between human/agent intent and AST code emission:

```mermaid
flowchart TD
    Intent["1. Operator / Product Intent"] --> SpecCompiler["2. Conductor Spec Compiler"]
    SpecCompiler --> Contract["3. Immutable Conductor Contract\n(Schemas, Invariants, State Transitions, Acceptance Gates)"]
    Contract --> Gate0{"4. Spec Completeness & Ambiguity Gate"}
    Gate0 -->|Ambiguous / Underspecified| SpecCompiler
    Gate0 -->|Locked & Hashed| Synthesis["5. Constrained Code Synthesis\n(Bounded to Contract Scope)"]
    Synthesis --> ASTCheck["6. AST-Level Invariant & Boundary Checker\n(Zero-Execution Structural Proof)"]
    ASTCheck -->|Violation Detected| Synthesis
    ASTCheck -->|AST Clean| Goldfish["7. Elephant-Goldfish Blind Verification\n(Zero-Context Reviewer: Sees ONLY Spec + Diff)"]
    Goldfish -->|Discrepancy / Drift Found| Synthesis
    Goldfish -->|Formal Consensus Reached| TestSuite["8. Deterministic Test & Reality Lock Gate"]
    TestSuite -->|All Gates Green| Merge["9. Atomic Promotion & Run Ledger Receipt"]
```

Notice what changes in this pipeline:
- **Zero open-ended "chatting" over code:** The implementation agent never guesses what "handle errors gracefully" means. The Conductor Contract defines exact error classes, HTTP status mappings, retry policies, and rollback invariants.
- **Zero self-grading:** The agent that writes the code never approves its own pull request. Approval requires **Formal Consensus** between the AST Invariant Checker, a zero-context Goldfish Reviewer, and deterministic test execution.

---

## 3. Conductor Contracts: Anatomy of an Executable Specification

Within **Benni Master OS**, the **Conductor** subsystem governs Spec-Driven Development. A Conductor Contract is not a vague markdown wishlist—it is a structured, version-hashed specification artifact that locks four dimensions before synthesis begins:

1. **Boundary & Interface Contracts:** Exact input/output schemas, strict type definitions, error variants, and module seam boundaries.
2. **State & Side-Effect Invariants:** Explicit declarations of what state may be mutated, what must remain idempotent, and what external I/O is permitted or forbidden.
3. **Scope Lock (Allowlist / Denylist):** The exact set of files and symbols the synthesis agent is authorized to touch. Any diff outside the declared scope is rejected automatically before review.
4. **Acceptance & Reality Lock Criteria:** Machine-checkable assertions and deterministic test commands that prove implementation matches specification.

Consider a concrete example: an engineering team needs to add an idempotent webhook ingestion handler for billing events. In vibe coding, a developer writes: *"Add a Stripe webhook endpoint that updates user subscriptions and logs failures."* Within 4 turns, the AI might forget signature verification, skip database transactions, or introduce a race condition on duplicate deliveries.

In Conductor SDD, the specification is compiled first as an immutable contract:

```yaml
contract_id: "spec-billing-webhook-v1"
scope_lock:
  allowed_files:
    - "src/billing/webhook_handler.py"
    - "src/billing/models.py"
    - "tests/billing/test_webhook_handler.py"
  forbidden_mutations:
    - "src/auth/**"
    - "migrations/**"

interface:
  entrypoint: "handle_billing_webhook(payload: bytes, sig_header: str, db: AsyncSession) -> WebhookReceipt"
  errors:
    - "InvalidSignatureError -> HTTP 401"
    - "MalformedPayloadError -> HTTP 400"
    - "TransientStorageError -> HTTP 503 (trigger retry)"

invariants:
  - id: "INV-01"
    rule: "Cryptographic HMAC signature MUST be verified before JSON deserialization."
  - id: "INV-02"
    rule: "Duplicate event_id MUST return 200 OK idempotently without mutating subscription state."
  - id: "INV-03"
    rule: "Subscription state update and event_id ledger insert MUST execute inside a single atomic DB transaction."
  - id: "INV-04"
    rule: "Zero raw secrets, tokens, or PII may appear in structured error logs."

acceptance_gates:
  - "pytest tests/billing/test_webhook_handler.py -v"
  - "ast_invariant_check --contract spec-billing-webhook-v1"
```

When this contract is locked, the synthesis agent has zero room for architectural improvisation. Every invariant (`INV-01` through `INV-04`) becomes a binary verification target.

---

## 4. Formal Workflow Comparison: Vibe Coding vs. Conductor SDD

To quantify why SDD scales across enterprise repositories while multi-turn prompting collapses, compare the two paradigms across every stage of the software lifecycle:

| Engineering Dimension | Prompt-and-Pray (Vibe Coding) | Conductor Spec-Driven Development (SDD) |
| :--- | :--- | :--- |
| **Primary Source of Truth** | Ephemeral chat history & implicit assumptions | Immutable, hashed Conductor Contract |
| **Multi-Turn Drift Profile** | Exponential entropy decay after 3–5 turns | Bounded zero-drift; each turn resets against locked spec |
| **Scope Control** | Unbounded; model frequently edits unrelated files | Strict `scope_lock` allowlist enforced at diff time |
| **Code Review Mechanism** | Self-review in same context (high confirmation bias) | **Elephant-Goldfish** blind zero-context consensus |
| **Structural Verification** | Runtime crash or manual human inspection | **AST-Level Invariant Checking** prior to execution |
| **Error Handling** | Ad-hoc `try/except` or swallowed exceptions | Exhaustive typed error contracts mapped in spec |
| **Auditability & Compliance** | Non-reproducible prompt logs | Cryptographic Run Ledger receipts linking spec, AST, and tests |
| **Production Cost Curve** | Cheap Turn 1, catastrophic debugging cost by Turn 5+ | Front-loaded 10% spec effort, near-zero regression cost |

---

## 5. The Elephant-Goldfish Model (EGM): Blind Zero-Context Verification

Even with a rigorous specification, a subtle failure mode remains when a single AI agent writes and verifies code: **shared cognitive bias**.

If Agent A spends 40,000 tokens exploring a repository, reading legacy workarounds, drafting a plan, and writing an implementation, Agent A develops *tunnel vision*. When asked *"Does your code satisfy all invariants?"*, Agent A's attention is saturated with its own justifications. It will overlook a subtle missing `await`, an edge case in `INV-02`, or a silent type cast because it *intended* the code to work.

To defeat confirmation bias, **Benni Master OS** enforces the **Elephant-Goldfish Model (EGM)**—a two-role formal consensus architecture:

### Role 1: The Elephant (Systemic Context & Synthesis)
The **Elephant** holds the long-horizon architectural memory of the codebase: dependency graphs, legacy constraints, design history, and cross-module relationships. The Elephant authors the Conductor Contract and synthesizes the implementation diff.

### Role 2: The Goldfish (Zero-Context Blind Reviewer)
The **Goldfish** is spawned in a **completely isolated, zero-history context**. It has never seen the Elephant's reasoning trace, scratchpad, or conversational struggles. The Goldfish receives **exactly two inputs**:
1. The **Immutable Conductor Contract** (the specification and invariants).
2. The **Resulting Git Diff / AST Artifact** (the implementation).

The Goldfish's mandate is adversarial and strictly objective: **Prove that the diff satisfies every invariant in the contract, or reject it with exact line-level counterexamples.**

```
+-------------------------------------------------------------------------+
|                    ELEPHANT-GOLDFISH CONSENSUS PROTOCOL                 |
|                                                                         |
|  [ELEPHANT AGENT]                                                       |
|   - Full codebase memory & design history                               |
|   - Compiles Spec + Synthesizes Diff                                    |
|           |                                                             |
|           +---> Produces: (1) Conductor Contract  (2) Code Diff         |
|                                  |                     |                |
|                                  v                     v                |
|                         [INFORMATION BARRIER: ZERO TRACE LEAKAGE]       |
|                                  |                     |                |
|                                  v                     v                |
|  [GOLDFISH AGENT (Zero-Context Subagent)]                               |
|   - Sees ONLY Contract + Diff (No Elephant reasoning or excuses)        |
|   - Audits every INV-xx rule adversarially                              |
|           |                                                             |
|           +---> REJECT (Counterexample) ---> Returned to Elephant       |
|           +---> APPROVE (Formal Consensus) ---> Proceeds to AST/Tests   |
+-------------------------------------------------------------------------+
```

Why is this barrier so effective? Because **a Goldfish cannot be gaslit by the Elephant's prior reasoning.** If the Elephant accidentally wrote `if event_id:` instead of checking the database transaction lock, the Elephant's own context might "remember" wanting a transaction and gloss over the bug. The Goldfish, seeing only `INV-03` and the raw diff, immediately flags: *"INV-03 VIOLATION: `subscription_repo.update()` and `event_ledger.insert()` execute in separate implicit commits; no atomic transaction block wraps both calls."*

### EGM Consensus Gates Matrix

| Gate Stage | Actor | Inputs Visible | Rejection Trigger |
| :--- | :--- | :--- | :--- |
| **Gate 1: Spec Lock** | Elephant + Operator | User Intent + Repo Architecture | Ambiguous types, missing error paths, unbounded scope |
| **Gate 2: AST Gate** | Deterministic Parser | Conductor Contract + Synthesized AST | Forbidden imports, signature mismatch, complexity overflow |
| **Gate 3: Goldfish Audit** | Zero-Context Subagent | Contract + Diff ONLY | Any unproved invariant, silent fallback, or spec drift |
| **Gate 4: Reality Lock** | Test & Telemetry Runner | Full Build + Deterministic Test Suite | Failing assertion, skipped test, or unverified mock |

---

## 6. AST-Level Invariant Checking Before Code Execution

Waiting for runtime tests to catch structural drift is too slow and incomplete—tests only exercise the paths they explicitly cover. SDD adds a deterministic **Abstract Syntax Tree (AST) Verification Layer** that inspects code structure *before* the code is ever executed.

By parsing generated Python, TypeScript, or Rust files into their native ASTs, the verifier proves structural properties in milliseconds with **zero LLM token cost**:

1. **Signature & Type Fidelity:** Verifies that exported functions match the exact parameter names, type annotations, and return types declared in the Conductor Contract.
2. **Import & Dependency Boundary Enforcement:** Guarantees that domain logic modules do not import forbidden infrastructure layers (e.g., preventing a pure domain service from importing `requests`, `subprocess`, or `os.environ` directly).
3. **Control-Flow & Complexity Bounds:** Flags deeply nested conditionals, bare `except:` clauses, swallowed errors, or unbounded recursion that violate production reliability standards.
4. **Order-of-Operations Proofs:** For security invariants like `INV-01` (*"Verify HMAC signature before JSON parsing"*), an AST visitor can statically verify that `verify_hmac(...)` dominates `json.loads(...)` on every control-flow path inside `handle_billing_webhook`.

Consider how cleanly a lightweight Python AST invariant check catches a classic AI hallucination—an LLM inserting a bare `except Exception: pass` or calling `json.loads()` before signature verification:

```python
import ast
from typing import List

class WebhookInvariantVisitor(ast.NodeVisitor):
    '''Static AST verifier proving INV-01 and banning silent exception swallowing.'''

    def __init__(self) -> None:
        self.hmac_line: int | None = None
        self.json_parse_line: int | None = None
        self.violations: List[str] = []

    def visit_Call(self, node: ast.Call) -> None:
        func_name = ast.unparse(node.func)
        if "verify_hmac" in func_name and self.hmac_line is None:
            self.hmac_line = node.lineno
        if func_name in {"json.loads", "orjson.loads"} and self.json_parse_line is None:
            self.json_parse_line = node.lineno
        self.generic_visit(node)

    def visit_ExceptHandler(self, node: ast.ExceptHandler) -> None:
        # Ban bare except or silent pass handlers
        if node.type is None:
            self.violations.append(f"Line {node.lineno}: Bare 'except:' clause forbidden by contract.")
        if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
            self.violations.append(f"Line {node.lineno}: Silent exception swallowing ('pass') forbidden.")
        self.generic_visit(node)

    def verify(self, source_code: str) -> List[str]:
        tree = ast.parse(source_code)
        self.visit(tree)
        if self.json_parse_line is not None:
            if self.hmac_line is None or self.hmac_line > self.json_parse_line:
                self.violations.append(
                    "INV-01 VIOLATION: JSON deserialization occurs before cryptographic HMAC verification."
                )
        return self.violations
```

This 30-line AST pass runs in under 2 milliseconds, cannot be persuaded by clever variable naming, and permanently eliminates an entire class of security and reliability regressions before a test runner even boots.

---

## 7. Reality Lock: Separating Intent from Observed Evidence

A pervasive failure mode in autonomous coding agents is **optimistic reporting**: an agent edits a file, runs a partial or mocked check, and declares *"All tests pass and production is ready."*

Conductor SDD enforces **Reality Lock**—a strict epistemic protocol across the entire engineering lifecycle:
- **Intent** is what the user asked for.
- **Plan** is the compiled Conductor Contract.
- **Dispatch** is the bounded execution assigned to a worker or subagent.
- **Execution** is the actual file mutation and AST generation.
- **Observed Evidence** is the raw, unedited stdout/stderr and exit code from the post-edit test run, plus the SHA-256 digest of the verified artifact.

Under Reality Lock, **no agent is permitted to claim completion unless the observed evidence was captured *after* the final edit.** If a single character changes in a file, all prior test receipts are invalidated, and the AST + Reality Lock gates must re-execute.

### Multi-File Refactoring & Cross-Module Contract Propagation
In enterprise repositories, the hardest failure mode is not a single-function syntax bug—it is **cross-module signature drift** during multi-file refactors. When an agent updates a core domain model in `models.py`, conventional multi-turn prompting frequently leaves stale call sites in `services.py`, `serializers.py`, or `workers.py`. Conductor SDD solves this by propagating the updated Conductor Contract across the dependency graph before synthesis begins: every downstream consumer in the `scope_lock` is bound to the exact new AST signature, and the Goldfish reviewer audits all modified edges simultaneously against the unified contract.

---

## 8. Implementing SDD in Your Engineering Organization

Adopting Spec-Driven Development does not require replacing your existing languages, frameworks, or CI/CD pipelines. It requires changing *where* engineering rigor is applied:

1. **Freeze the Contract First:** For any feature touching more than two files or mutating persistent state, require a written Conductor Contract (interfaces, invariants, scope lock) before prompting any coding agent.
2. **Isolate Your Reviewers:** Never ask the same chat session that wrote a 400-line diff to audit it. Spin up a fresh, zero-context Goldfish agent with only the contract and the git diff.
3. **Automate Structural Invariants with ASTs:** Encode your team's recurring code-review comments (forbidden imports, transaction boundaries, logging rules, type strictness) into lightweight AST visitors in CI.
4. **Enforce Reality Lock on Every Merge:** Require cryptographic or immutable CI receipts showing that every acceptance gate passed on the exact commit SHA being merged.

The era of treating AI coding assistants as conversational slot machines is over. Organizations that master **Spec-Driven Development, Conductor Contracts, and Elephant-Goldfish Formal Consensus** achieve both the speed of autonomous synthesis and the reliability of formal systems engineering.

---

### Build Sovereign, Zero-Drift AI Engineering Systems

Ready to eliminate AI code drift, multi-turn hallucinations, and fragile vibe coding across your engineering organization?

- **Explore the Benni OS Architecture & Engineering Academy:** [https://benni-os.net/blog/academy.html](https://benni-os.net/blog/academy.html)
- **Discover the Complete Benni Master OS Ecosystem:** [https://benni-os.net/](https://benni-os.net/)
"""

BODY_EN = r"""
<h2>1. The Collapse of "Prompt-and-Pray" Vibe Coding</h2>
<p>Every engineering team that adopts AI coding assistants experiences the same deceptive honeymoon phase. On Turn 1, a developer types a natural-language prompt and watches a clean, idiomatic module appear in seconds. By Turn 2, a new endpoint is wired. By Turn 3, unit tests are generated. It feels like magic.</p>
<p>Then comes Turn 4. And Turn 5.</p>
<p>In any non-trivial codebase—repositories exceeding 50,000 lines of code, distributed microservices, strict schema boundaries, or multi-tenant state machines—<strong>probabilistic "Prompt-and-Pray" vibe coding hits an exponential entropy wall.</strong></p>
<p>Instead of converging toward a stable architecture, each conversational turn introduces subtle structural decay:</p>
<ul>
  <li><strong>Compounding Context Drift:</strong> As the conversation grows, earlier architectural constraints fall out of the model's effective attention window ("lost-in-the-middle" degradation). The model forgets that <code>UserRepository</code> enforces soft-deletes via <code>deleted_at IS NULL</code>, or that an upstream event bus requires idempotency keys.</li>
  <li><strong>Silent Invariant Violations:</strong> To satisfy the immediate prompt on Turn 5, the model quietly modifies a shared helper signature, weakens a TypeScript union type to <code>any</code>, or bypasses a validation middleware—breaking three unrelated modules that were not loaded into context.</li>
  <li><strong>Multi-Turn Hallucination Cascades:</strong> When a test fails on Turn 4, the developer pastes the stack trace. The LLM, optimizing for <em>local plausibility</em> rather than <em>global correctness</em>, invents a non-existent configuration flag or mocks out the failing assertion instead of fixing the root cause.</li>
  <li><strong>The Confirmation Bias Trap:</strong> Because the same model context that wrote the buggy implementation is also asked to review or fix it, it inherits its own flawed assumptions. It rationalizes broken abstractions rather than challenging them.</li>
</ul>
<p>Mathematically, if each conversational turn <code>t</code> has a small probability <code>p_drift</code> of introducing an undocumented assumption or breaking an implicit invariant, the probability that a codebase remains architecturally sound after <code>k</code> unverified turns decays exponentially:</p>
<pre><code>P(Sound_k) = Product_{t=1..k} (1 - p_drift_t) ≈ (1 - p_drift)^k</code></pre>
<p>Even with a modest per-turn drift rate of <code>p_drift = 0.15</code>, by Turn 5 the probability of zero architectural regression drops below <strong>44%</strong>. By Turn 10, it collapses to <strong>19%</strong>. In production systems, <strong>vibe coding is not velocity—it is high-interest technical debt compounded at token speed.</strong></p>

<h2>2. Spec-Driven Development (SDD): Inverting the Synthesis Pipeline</h2>
<p><strong>Spec-Driven Development (SDD)</strong> is a formal engineering discipline that eliminates multi-turn entropy by reversing the fundamental order of operations in AI-assisted software construction:</p>
<blockquote><strong>The SDD Axiom:</strong> <em>Natural language is an unacceptable input for direct code synthesis. Intent must first be compiled into an immutable, machine-verifiable Specification Contract before a single line of implementation code is generated.</em></blockquote>
<p>In classical software engineering, formal methods (TLA+, Alloy, Design-by-Contract) were historically too expensive for day-to-day product velocity. In the era of AI code synthesis, however, the economics invert: <strong>generating code is nearly free, while verifying correctness and preventing silent drift is the primary bottleneck.</strong></p>
<p>SDD resolves this bottleneck by introducing a deterministic intermediate representation between human or agent intent and AST code emission:</p>

<div class="mermaid">
flowchart TD
    Intent["1. Operator / Product Intent"] --> SpecCompiler["2. Conductor Spec Compiler"]
    SpecCompiler --> Contract["3. Immutable Conductor Contract\n(Schemas, Invariants, State Transitions, Acceptance Gates)"]
    Contract --> Gate0{"4. Spec Completeness & Ambiguity Gate"}
    Gate0 -->|Ambiguous / Underspecified| SpecCompiler
    Gate0 -->|Locked & Hashed| Synthesis["5. Constrained Code Synthesis\n(Bounded to Contract Scope)"]
    Synthesis --> ASTCheck["6. AST-Level Invariant & Boundary Checker\n(Zero-Execution Structural Proof)"]
    ASTCheck -->|Violation Detected| Synthesis
    ASTCheck -->|AST Clean| Goldfish["7. Elephant-Goldfish Blind Verification\n(Zero-Context Reviewer: Sees ONLY Spec + Diff)"]
    Goldfish -->|Discrepancy / Drift Found| Synthesis
    Goldfish -->|Formal Consensus Reached| TestSuite["8. Deterministic Test & Reality Lock Gate"]
    TestSuite -->|All Gates Green| Merge["9. Atomic Promotion & Run Ledger Receipt"]
</div>

<p>Notice what changes in this pipeline:</p>
<ul>
  <li><strong>Zero open-ended "chatting" over code:</strong> The implementation agent never guesses what "handle errors gracefully" means. The Conductor Contract defines exact error classes, HTTP status mappings, retry policies, and rollback invariants.</li>
  <li><strong>Zero self-grading:</strong> The agent that writes the code never approves its own pull request. Approval requires <strong>Formal Consensus</strong> between the AST Invariant Checker, a zero-context Goldfish Reviewer, and deterministic test execution.</li>
</ul>

<h2>3. Conductor Contracts: Anatomy of an Executable Specification</h2>
<p>Within <strong>Benni Master OS</strong>, the <strong>Conductor</strong> subsystem governs Spec-Driven Development. A Conductor Contract is not a vague markdown wishlist—it is a structured, version-hashed specification artifact that locks four dimensions before synthesis begins:</p>
<ol>
  <li><strong>Boundary &amp; Interface Contracts:</strong> Exact input/output schemas, strict type definitions, error variants, and module seam boundaries.</li>
  <li><strong>State &amp; Side-Effect Invariants:</strong> Explicit declarations of what state may be mutated, what must remain idempotent, and what external I/O is permitted or forbidden.</li>
  <li><strong>Scope Lock (Allowlist / Denylist):</strong> The exact set of files and symbols the synthesis agent is authorized to touch. Any diff outside the declared scope is rejected automatically before review.</li>
  <li><strong>Acceptance &amp; Reality Lock Criteria:</strong> Machine-checkable assertions and deterministic test commands that prove implementation matches specification.</li>
</ol>
<p>Consider a concrete example: an engineering team needs to add an idempotent webhook ingestion handler for billing events. In vibe coding, a developer writes: <em>"Add a Stripe webhook endpoint that updates user subscriptions and logs failures."</em> Within 4 turns, the AI might forget signature verification, skip database transactions, or introduce a race condition on duplicate deliveries.</p>
<p>In Conductor SDD, the specification is compiled first as an immutable contract:</p>
<pre><code>contract_id: "spec-billing-webhook-v1"
scope_lock:
  allowed_files:
    - "src/billing/webhook_handler.py"
    - "src/billing/models.py"
    - "tests/billing/test_webhook_handler.py"
  forbidden_mutations:
    - "src/auth/**"
    - "migrations/**"

interface:
  entrypoint: "handle_billing_webhook(payload: bytes, sig_header: str, db: AsyncSession) -&gt; WebhookReceipt"
  errors:
    - "InvalidSignatureError -&gt; HTTP 401"
    - "MalformedPayloadError -&gt; HTTP 400"
    - "TransientStorageError -&gt; HTTP 503 (trigger retry)"

invariants:
  - id: "INV-01"
    rule: "Cryptographic HMAC signature MUST be verified before JSON deserialization."
  - id: "INV-02"
    rule: "Duplicate event_id MUST return 200 OK idempotently without mutating subscription state."
  - id: "INV-03"
    rule: "Subscription state update and event_id ledger insert MUST execute inside a single atomic DB transaction."
  - id: "INV-04"
    rule: "Zero raw secrets, tokens, or PII may appear in structured error logs."

acceptance_gates:
  - "pytest tests/billing/test_webhook_handler.py -v"
  - "ast_invariant_check --contract spec-billing-webhook-v1"</code></pre>
<p>When this contract is locked, the synthesis agent has zero room for architectural improvisation. Every invariant (<code>INV-01</code> through <code>INV-04</code>) becomes a binary verification target.</p>

<h2>4. Formal Workflow Comparison: Vibe Coding vs. Conductor SDD</h2>
<p>To quantify why SDD scales across enterprise repositories while multi-turn prompting collapses, compare the two paradigms across every stage of the software lifecycle:</p>
<table>
  <thead>
    <tr>
      <th>Engineering Dimension</th>
      <th>Prompt-and-Pray (Vibe Coding)</th>
      <th>Conductor Spec-Driven Development (SDD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Primary Source of Truth</strong></td>
      <td>Ephemeral chat history &amp; implicit assumptions</td>
      <td>Immutable, hashed Conductor Contract</td>
    </tr>
    <tr>
      <td><strong>Multi-Turn Drift Profile</strong></td>
      <td>Exponential entropy decay after 3–5 turns</td>
      <td>Bounded zero-drift; each turn resets against locked spec</td>
    </tr>
    <tr>
      <td><strong>Scope Control</strong></td>
      <td>Unbounded; model frequently edits unrelated files</td>
      <td>Strict <code>scope_lock</code> allowlist enforced at diff time</td>
    </tr>
    <tr>
      <td><strong>Code Review Mechanism</strong></td>
      <td>Self-review in same context (high confirmation bias)</td>
      <td><strong>Elephant-Goldfish</strong> blind zero-context consensus</td>
    </tr>
    <tr>
      <td><strong>Structural Verification</strong></td>
      <td>Runtime crash or manual human inspection</td>
      <td><strong>AST-Level Invariant Checking</strong> prior to execution</td>
    </tr>
    <tr>
      <td><strong>Error Handling</strong></td>
      <td>Ad-hoc <code>try/except</code> or swallowed exceptions</td>
      <td>Exhaustive typed error contracts mapped in spec</td>
    </tr>
    <tr>
      <td><strong>Auditability &amp; Compliance</strong></td>
      <td>Non-reproducible prompt logs</td>
      <td>Cryptographic Run Ledger receipts linking spec, AST, and tests</td>
    </tr>
    <tr>
      <td><strong>Production Cost Curve</strong></td>
      <td>Cheap Turn 1, catastrophic debugging cost by Turn 5+</td>
      <td>Front-loaded 10% spec effort, near-zero regression cost</td>
    </tr>
  </tbody>
</table>

<h2>5. The Elephant-Goldfish Model (EGM): Blind Zero-Context Verification</h2>
<p>Even with a rigorous specification, a subtle failure mode remains when a single AI agent writes and verifies code: <strong>shared cognitive bias</strong>.</p>
<p>If Agent A spends 40,000 tokens exploring a repository, reading legacy workarounds, drafting a plan, and writing an implementation, Agent A develops <em>tunnel vision</em>. When asked <em>"Does your code satisfy all invariants?"</em>, Agent A's attention is saturated with its own justifications. It will overlook a subtle missing <code>await</code>, an edge case in <code>INV-02</code>, or a silent type cast because it <em>intended</em> the code to work.</p>
<p>To defeat confirmation bias, <strong>Benni Master OS</strong> enforces the <strong>Elephant-Goldfish Model (EGM)</strong>—a two-role formal consensus architecture:</p>
<h3>Role 1: The Elephant (Systemic Context &amp; Synthesis)</h3>
<p>The <strong>Elephant</strong> holds the long-horizon architectural memory of the codebase: dependency graphs, legacy constraints, design history, and cross-module relationships. The Elephant authors the Conductor Contract and synthesizes the implementation diff.</p>
<h3>Role 2: The Goldfish (Zero-Context Blind Reviewer)</h3>
<p>The <strong>Goldfish</strong> is spawned in a <strong>completely isolated, zero-history context</strong>. It has never seen the Elephant's reasoning trace, scratchpad, or conversational struggles. The Goldfish receives <strong>exactly two inputs</strong>:</p>
<ol>
  <li>The <strong>Immutable Conductor Contract</strong> (the specification and invariants).</li>
  <li>The <strong>Resulting Git Diff / AST Artifact</strong> (the implementation).</li>
</ol>
<p>The Goldfish's mandate is adversarial and strictly objective: <strong>Prove that the diff satisfies every invariant in the contract, or reject it with exact line-level counterexamples.</strong></p>
<pre><code>+-------------------------------------------------------------------------+
|                    ELEPHANT-GOLDFISH CONSENSUS PROTOCOL                 |
|                                                                         |
|  [ELEPHANT AGENT]                                                       |
|   - Full codebase memory &amp; design history                               |
|   - Compiles Spec + Synthesizes Diff                                    |
|           |                                                             |
|           +---&gt; Produces: (1) Conductor Contract  (2) Code Diff         |
|                                  |                     |                |
|                                  v                     v                |
|                         [INFORMATION BARRIER: ZERO TRACE LEAKAGE]       |
|                                  |                     |                |
|                                  v                     v                |
|  [GOLDFISH AGENT (Zero-Context Subagent)]                               |
|   - Sees ONLY Contract + Diff (No Elephant reasoning or excuses)        |
|   - Audits every INV-xx rule adversarially                              |
|           |                                                             |
|           +---&gt; REJECT (Counterexample) ---&gt; Returned to Elephant       |
|           +---&gt; APPROVE (Formal Consensus) ---&gt; Proceeds to AST/Tests   |
+-------------------------------------------------------------------------+</code></pre>
<p>Why is this barrier so effective? Because <strong>a Goldfish cannot be gaslit by the Elephant's prior reasoning.</strong> If the Elephant accidentally wrote <code>if event_id:</code> instead of checking the database transaction lock, the Elephant's own context might "remember" wanting a transaction and gloss over the bug. The Goldfish, seeing only <code>INV-03</code> and the raw diff, immediately flags: <em>"INV-03 VIOLATION: <code>subscription_repo.update()</code> and <code>event_ledger.insert()</code> execute in separate implicit commits; no atomic transaction block wraps both calls."</em></p>

<h3>EGM Consensus Gates Matrix</h3>
<table>
  <thead>
    <tr>
      <th>Gate Stage</th>
      <th>Actor</th>
      <th>Inputs Visible</th>
      <th>Rejection Trigger</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Gate 1: Spec Lock</strong></td>
      <td>Elephant + Operator</td>
      <td>User Intent + Repo Architecture</td>
      <td>Ambiguous types, missing error paths, unbounded scope</td>
    </tr>
    <tr>
      <td><strong>Gate 2: AST Gate</strong></td>
      <td>Deterministic Parser</td>
      <td>Conductor Contract + Synthesized AST</td>
      <td>Forbidden imports, signature mismatch, complexity overflow</td>
    </tr>
    <tr>
      <td><strong>Gate 3: Goldfish Audit</strong></td>
      <td>Zero-Context Subagent</td>
      <td>Contract + Diff ONLY</td>
      <td>Any unproved invariant, silent fallback, or spec drift</td>
    </tr>
    <tr>
      <td><strong>Gate 4: Reality Lock</strong></td>
      <td>Test &amp; Telemetry Runner</td>
      <td>Full Build + Deterministic Test Suite</td>
      <td>Failing assertion, skipped test, or unverified mock</td>
    </tr>
  </tbody>
</table>

<h2>6. AST-Level Invariant Checking Before Code Execution</h2>
<p>Waiting for runtime tests to catch structural drift is too slow and incomplete—tests only exercise the paths they explicitly cover. SDD adds a deterministic <strong>Abstract Syntax Tree (AST) Verification Layer</strong> that inspects code structure <em>before</em> the code is ever executed.</p>
<p>By parsing generated Python, TypeScript, or Rust files into their native ASTs, the verifier proves structural properties in milliseconds with <strong>zero LLM token cost</strong>:</p>
<ul>
  <li><strong>Signature &amp; Type Fidelity:</strong> Verifies that exported functions match the exact parameter names, type annotations, and return types declared in the Conductor Contract.</li>
  <li><strong>Import &amp; Dependency Boundary Enforcement:</strong> Guarantees that domain logic modules do not import forbidden infrastructure layers (e.g., preventing a pure domain service from importing <code>requests</code>, <code>subprocess</code>, or <code>os.environ</code> directly).</li>
  <li><strong>Control-Flow &amp; Complexity Bounds:</strong> Flags deeply nested conditionals, bare <code>except:</code> clauses, swallowed errors, or unbounded recursion that violate production reliability standards.</li>
  <li><strong>Order-of-Operations Proofs:</strong> For security invariants like <code>INV-01</code> (<em>"Verify HMAC signature before JSON parsing"</em>), an AST visitor can statically verify that <code>verify_hmac(...)</code> dominates <code>json.loads(...)</code> on every control-flow path inside <code>handle_billing_webhook</code>.</li>
</ul>
<p>Consider how cleanly a lightweight Python AST invariant check catches a classic AI hallucination—an LLM inserting a bare <code>except Exception: pass</code> or calling <code>json.loads()</code> before signature verification:</p>
<pre><code>import ast
from typing import List

class WebhookInvariantVisitor(ast.NodeVisitor):
    '''Static AST verifier proving INV-01 and banning silent exception swallowing.'''

    def __init__(self) -&gt; None:
        self.hmac_line: int | None = None
        self.json_parse_line: int | None = None
        self.violations: List[str] = []

    def visit_Call(self, node: ast.Call) -&gt; None:
        func_name = ast.unparse(node.func)
        if "verify_hmac" in func_name and self.hmac_line is None:
            self.hmac_line = node.lineno
        if func_name in {"json.loads", "orjson.loads"} and self.json_parse_line is None:
            self.json_parse_line = node.lineno
        self.generic_visit(node)

    def visit_ExceptHandler(self, node: ast.ExceptHandler) -&gt; None:
        if node.type is None:
            self.violations.append(f"Line {node.lineno}: Bare 'except:' clause forbidden by contract.")
        if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
            self.violations.append(f"Line {node.lineno}: Silent exception swallowing ('pass') forbidden.")
        self.generic_visit(node)

    def verify(self, source_code: str) -&gt; List[str]:
        tree = ast.parse(source_code)
        self.visit(tree)
        if self.json_parse_line is not None:
            if self.hmac_line is None or self.hmac_line &gt; self.json_parse_line:
                self.violations.append(
                    "INV-01 VIOLATION: JSON deserialization occurs before cryptographic HMAC verification."
                )
        return self.violations</code></pre>
<p>This 30-line AST pass runs in under 2 milliseconds, cannot be persuaded by clever variable naming, and permanently eliminates an entire class of security and reliability regressions before a test runner even boots.</p>

<h2>7. Reality Lock: Separating Intent from Observed Evidence</h2>
<p>A pervasive failure mode in autonomous coding agents is <strong>optimistic reporting</strong>: an agent edits a file, runs a partial or mocked check, and declares <em>"All tests pass and production is ready."</em></p>
<p>Conductor SDD enforces <strong>Reality Lock</strong>—a strict epistemic protocol across the entire engineering lifecycle:</p>
<ul>
  <li><strong>Intent</strong> is what the user asked for.</li>
  <li><strong>Plan</strong> is the compiled Conductor Contract.</li>
  <li><strong>Dispatch</strong> is the bounded execution assigned to a worker or subagent.</li>
  <li><strong>Execution</strong> is the actual file mutation and AST generation.</li>
  <li><strong>Observed Evidence</strong> is the raw, unedited stdout/stderr and exit code from the post-edit test run, plus the SHA-256 digest of the verified artifact.</li>
</ul>
<p>Under Reality Lock, <strong>no agent is permitted to claim completion unless the observed evidence was captured <em>after</em> the final edit.</strong> If a single character changes in a file, all prior test receipts are invalidated, and the AST + Reality Lock gates must re-execute.</p>
<h3>Multi-File Refactoring &amp; Cross-Module Contract Propagation</h3>
<p>In enterprise repositories, the hardest failure mode is not a single-function syntax bug—it is <strong>cross-module signature drift</strong> during multi-file refactors. When an agent updates a core domain model in <code>models.py</code>, conventional multi-turn prompting frequently leaves stale call sites in <code>services.py</code>, <code>serializers.py</code>, or <code>workers.py</code>. Conductor SDD solves this by propagating the updated Conductor Contract across the dependency graph before synthesis begins: every downstream consumer in the <code>scope_lock</code> is bound to the exact new AST signature, and the Goldfish reviewer audits all modified edges simultaneously against the unified contract.</p>

<h2>8. Implementing SDD in Your Engineering Organization</h2>
<p>Adopting Spec-Driven Development does not require replacing your existing languages, frameworks, or CI/CD pipelines. It requires changing <em>where</em> engineering rigor is applied:</p>
<ol>
  <li><strong>Freeze the Contract First:</strong> For any feature touching more than two files or mutating persistent state, require a written Conductor Contract (interfaces, invariants, scope lock) before prompting any coding agent.</li>
  <li><strong>Isolate Your Reviewers:</strong> Never ask the same chat session that wrote a 400-line diff to audit it. Spin up a fresh, zero-context Goldfish agent with only the contract and the git diff.</li>
  <li><strong>Automate Structural Invariants with ASTs:</strong> Encode your team's recurring code-review comments (forbidden imports, transaction boundaries, logging rules, type strictness) into lightweight AST visitors in CI.</li>
  <li><strong>Enforce Reality Lock on Every Merge:</strong> Require cryptographic or immutable CI receipts showing that every acceptance gate passed on the exact commit SHA being merged.</li>
</ol>
<p>The era of treating AI coding assistants as conversational slot machines is over. Organizations that master <strong>Spec-Driven Development, Conductor Contracts, and Elephant-Goldfish Formal Consensus</strong> achieve both the speed of autonomous synthesis and the reliability of formal systems engineering.</p>
<p>Ready to architect zero-drift AI systems? Explore the <a href="https://benni-os.net/blog/academy.html">Benni OS Engineering Academy</a> or visit the <a href="https://benni-os.net/">Benni OS Platform</a>.</p>
"""

FAQS_EN = [
    ("Why does Prompt-and-Pray vibe coding fail after 3 to 5 turns?", "Probabilistic code generation accumulates context drift and attention dilution on every turn. Without a locked specification, each edit introduces implicit assumptions and silent invariant violations that compound exponentially."),
    ("What is Spec-Driven Development (SDD)?", "SDD is an engineering methodology where human or agent intent is compiled into an immutable, machine-verifiable Conductor Contract (schemas, invariants, scope locks, and acceptance gates) before any implementation code is synthesized."),
    ("How does Elephant-Goldfish blind verification prevent hallucinations?", "The Elephant holds full codebase context to author the spec and code, while the Goldfish is a zero-context subagent that receives only the contract and the git diff. Because it cannot see the author's reasoning trace, it eliminates shared confirmation bias."),
    ("What is AST-level invariant checking?", "It is a deterministic pre-execution pass that parses generated source code into an Abstract Syntax Tree (AST) to mathematically verify function signatures, import boundaries, control-flow ordering, and forbidden patterns in milliseconds.")
]

BODY_PT = r"""
<h2>1. O Colapso do "Prompt-and-Pray" e do Vibe Coding</h2>
<p>Toda equipe de engenharia que adota assistentes de código baseados em IA passa pela mesma fase enganosa de lua de mel. No Turno 1, um desenvolvedor escreve um prompt em linguagem natural e observa um módulo limpo e idiomático surgir em segundos. No Turno 2, um novo endpoint é conectado. No Turno 3, testes unitários são gerados. Tudo parece mágica.</p>
<p>Então chegam o Turno 4 e o Turno 5.</p>
<p>Em qualquer base de código não trivial — repositórios acima de 50.000 linhas, microsserviços distribuídos, fronteiras rígidas de schema ou máquinas de estado multi-tenant — o <strong>vibe coding probabilístico ("Prompt-and-Pray") colide com uma parede exponencial de entropia.</strong></p>
<p>Em vez de convergir para uma arquitetura estável, cada turno conversacional introduz uma degradação estrutural silenciosa:</p>
<ul>
  <li><strong>Deriva Composta de Contexto (Context Drift):</strong> Conforme o histórico cresce, restrições arquiteturais iniciais saem da janela efetiva de atenção do modelo (degradação <em>lost-in-the-middle</em>). O modelo esquece que o <code>UserRepository</code> exige <em>soft-delete</em> via <code>deleted_at IS NULL</code> ou que o barramento de eventos exige chaves de idempotência.</li>
  <li><strong>Violações Silenciosas de Invariantes:</strong> Para satisfazer o pedido imediato do Turno 5, o modelo altera discretamente a assinatura de um helper compartilhado, enfraquece uma união de tipos TypeScript para <code>any</code> ou contorna um middleware de validação — quebrando três módulos não carregados no contexto.</li>
  <li><strong>Cascatas de Alucinação em Múltiplos Turnos:</strong> Quando um teste falha no Turno 4, o desenvolvedor cola o stack trace. O LLM, otimizando para <em>plausibilidade local</em> em vez de <em>corretude global</em>, inventa uma flag de configuração inexistente ou mocka a asserção que falhou em vez de corrigir a causa raiz.</li>
  <li><strong>A Armadilha do Viés de Confirmação:</strong> Como o mesmo contexto de modelo que escreveu a implementação defeituosa é encarregado de revisá-la ou corrigi-la, ele herda suas próprias premissas falhas. O modelo racionaliza abstrações quebradas em vez de contestá-las.</li>
</ul>
<p>Matematicamente, se cada turno conversacional <code>t</code> possui uma pequena probabilidade <code>p_drift</code> de introduzir uma premissa não documentada ou quebrar uma invariante implícita, a probabilidade de a base de código permanecer arquiteturalmente íntegra após <code>k</code> turnos não verificados decai exponencialmente:</p>
<pre><code>P(Integra_k) = Produto_{t=1..k} (1 - p_drift_t) ≈ (1 - p_drift)^k</code></pre>
<p>Mesmo com uma taxa modesta de deriva de <code>p_drift = 0.15</code> por turno, no Turno 5 a probabilidade de zero regressão arquitetural cai abaixo de <strong>44%</strong>. No Turno 10, colapsa para <strong>19%</strong>. Em sistemas de produção, <strong>vibe coding não é velocidade — é dívida técnica de juros compostos gerada na velocidade de tokens.</strong></p>

<h2>2. Desenvolvimento Orientado a Especificações (SDD): Invertendo o Pipeline de Síntese</h2>
<p>O <strong>Desenvolvimento Orientado a Especificações (SDD)</strong> é uma disciplina formal de engenharia que elimina a entropia de múltiplos turnos ao inverter a ordem fundamental de operações na construção de software assistida por IA:</p>
<blockquote><strong>O Axioma do SDD:</strong> <em>Linguagem natural é uma entrada inaceitável para síntese direta de código. A intenção deve ser primeiro compilada em um Contrato de Especificação imutável e verificável por máquina antes que uma única linha de código de implementação seja gerada.</em></blockquote>
<p>Na engenharia de software clássica, métodos formais (TLA+, Alloy, Design-by-Contract) eram historicamente caros demais para a velocidade diária de produto. Na era da síntese de código por IA, contudo, a economia se inverte: <strong>gerar código é praticamente gratuito, enquanto verificar corretude e impedir deriva silenciosa é o verdadeiro gargalo.</strong></p>
<p>O SDD resolve esse gargalo introduzindo uma representação intermediária determinística entre a intenção humana (ou de agente) e a emissão de código em AST:</p>

<div class="mermaid">
flowchart TD
    Intent["1. Intenção do Operador / Produto"] --> SpecCompiler["2. Compilador de Especificação Conductor"]
    SpecCompiler --> Contract["3. Contrato Conductor Imutável\n(Schemas, Invariantes, Transições de Estado, Gates)"]
    Contract --> Gate0{"4. Gate de Completude e Ambiguidade"}
    Gate0 -->|Ambíguo / Subespecificado| SpecCompiler
    Gate0 -->|Travado e Hasheado| Synthesis["5. Síntese de Código Restrita\n(Limitada ao Escopo do Contrato)"]
    Synthesis --> ASTCheck["6. Verificador de Invariantes e Fronteiras em AST\n(Prova Estrutural Sem Execução)"]
    ASTCheck -->|Violação Detectada| Synthesis
    ASTCheck -->|AST Limpa| Goldfish["7. Verificação Cega Elephant-Goldfish\n(Revisor Zero-Contexto: Vê APENAS Spec + Diff)"]
    Goldfish -->|Divergência / Deriva| Synthesis
    Goldfish -->|Consenso Formal Atingido| TestSuite["8. Gate Determinístico de Testes e Reality Lock"]
    TestSuite -->|Todos os Gates Verdes| Merge["9. Promoção Atômica e Recibo no Run Ledger"]
</div>

<p>Observe o que muda neste pipeline:</p>
<ul>
  <li><strong>Zero "bate-papo" aberto sobre código:</strong> O agente de implementação nunca precisa adivinhar o que significa "tratar erros adequadamente". O Contrato Conductor define classes exatas de erro, mapeamentos HTTP, políticas de retry e invariantes de rollback.</li>
  <li><strong>Zero autoavaliação:</strong> O agente que escreve o código jamais aprova o próprio pull request. A aprovação exige <strong>Consenso Formal</strong> entre o Verificador de Invariantes em AST, um Revisor Goldfish sem contexto e a execução determinística de testes.</li>
</ul>

<h2>3. Contratos Conductor: Anatomia de uma Especificação Executável</h2>
<p>No ecossistema <strong>Benni Master OS</strong>, o subsistema <strong>Conductor</strong> governa o Desenvolvimento Orientado a Especificações. Um Contrato Conductor não é uma lista vaga de desejos em markdown — é um artefato de especificação estruturado e versionado por hash que trava quatro dimensões antes do início da síntese:</p>
<ol>
  <li><strong>Contratos de Fronteira e Interface:</strong> Schemas exatos de entrada/saída, definições estritas de tipos, variantes de erro e limites de módulos.</li>
  <li><strong>Invariantes de Estado e Efeitos Colaterais:</strong> Declarações explícitas de qual estado pode ser mutado, o que deve permanecer idempotente e qual I/O externo é permitido ou proibido.</li>
  <li><strong>Trava de Escopo (Scope Lock — Allowlist / Denylist):</strong> O conjunto exato de arquivos e símbolos que o agente sintetizador tem autorização para tocar. Qualquer diff fora do escopo declarado é rejeitado automaticamente antes da revisão.</li>
  <li><strong>Critérios de Aceite e Reality Lock:</strong> Asserções verificáveis por máquina e comandos determinísticos de teste que provam que a implementação corresponde à especificação.</li>
</ol>
<p>Considere um exemplo concreto: uma equipe de engenharia precisa adicionar um manipulador idempotente de ingestão de webhooks para eventos de faturamento. No vibe coding, o desenvolvedor escreve: <em>"Adicione um endpoint de webhook Stripe que atualize assinaturas de usuários e registre falhas."</em> Em 4 turnos, a IA pode esquecer a verificação de assinatura criptográfica, omitir transações de banco de dados ou introduzir uma condição de corrida em entregas duplicadas.</p>
<p>No Conductor SDD, a especificação é compilada primeiro como um contrato imutável:</p>
<pre><code>contract_id: "spec-billing-webhook-v1"
scope_lock:
  allowed_files:
    - "src/billing/webhook_handler.py"
    - "src/billing/models.py"
    - "tests/billing/test_webhook_handler.py"
  forbidden_mutations:
    - "src/auth/**"
    - "migrations/**"

interface:
  entrypoint: "handle_billing_webhook(payload: bytes, sig_header: str, db: AsyncSession) -&gt; WebhookReceipt"
  errors:
    - "InvalidSignatureError -&gt; HTTP 401"
    - "MalformedPayloadError -&gt; HTTP 400"
    - "TransientStorageError -&gt; HTTP 503 (acionar retry)"

invariants:
  - id: "INV-01"
    rule: "Assinatura criptográfica HMAC DEVE ser verificada antes da desserialização JSON."
  - id: "INV-02"
    rule: "event_id duplicado DEVE retornar 200 OK de forma idempotente sem mutar o estado da assinatura."
  - id: "INV-03"
    rule: "Atualização da assinatura e inserção no ledger de event_id DEVEM ocorrer dentro de uma única transação atômica."
  - id: "INV-04"
    rule: "Zero segredos brutos, tokens ou PII podem aparecer em logs estruturados de erro."

acceptance_gates:
  - "pytest tests/billing/test_webhook_handler.py -v"
  - "ast_invariant_check --contract spec-billing-webhook-v1"</code></pre>
<p>Quando esse contrato é travado, o agente sintetizador não possui margem para improvisação arquitetural. Cada invariante (<code>INV-01</code> a <code>INV-04</code>) torna-se um alvo binário de verificação.</p>

<h2>4. Comparação Formal de Fluxo: Vibe Coding vs. Conductor SDD</h2>
<p>Para quantificar por que o SDD escala em repositórios corporativos enquanto o prompting em múltiplos turnos entra em colapso, compare os dois paradigmas ao longo de todo o ciclo de vida do software:</p>
<table>
  <thead>
    <tr>
      <th>Dimensão de Engenharia</th>
      <th>Prompt-and-Pray (Vibe Coding)</th>
      <th>Conductor Spec-Driven Development (SDD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Fonte Primária da Verdade</strong></td>
      <td>Histórico efêmero de chat e premissas implícitas</td>
      <td>Contrato Conductor imutável com hash criptográfico</td>
    </tr>
    <tr>
      <td><strong>Perfil de Deriva (Multi-Turno)</strong></td>
      <td>Decaimento exponencial de entropia após 3–5 turnos</td>
      <td>Zero-deriva limitada; cada turno reinicia sobre a spec travada</td>
    </tr>
    <tr>
      <td><strong>Controle de Escopo</strong></td>
      <td>Irrestrito; o modelo edita arquivos não relacionados</td>
      <td><code>scope_lock</code> estrito validado automaticamente no diff</td>
    </tr>
    <tr>
      <td><strong>Mecanismo de Revisão de Código</strong></td>
      <td>Autorrevisão no mesmo contexto (alto viés de confirmação)</td>
      <td>Consenso cego <strong>Elephant-Goldfish</strong> sem contexto prévio</td>
    </tr>
    <tr>
      <td><strong>Verificação Estrutural</strong></td>
      <td>Falha em tempo de execução ou inspeção manual humana</td>
      <td><strong>Checagem de Invariantes em AST</strong> antes da execução</td>
    </tr>
    <tr>
      <td><strong>Tratamento de Erros</strong></td>
      <td><code>try/except</code> ad-hoc ou exceções engolidas em silêncio</td>
      <td>Contratos exaustivos de erro tipados na especificação</td>
    </tr>
    <tr>
      <td><strong>Auditabilidade e Conformidade</strong></td>
      <td>Logs de prompts não reproduzíveis</td>
      <td>Recibos criptográficos no Run Ledger ligando spec, AST e testes</td>
    </tr>
    <tr>
      <td><strong>Curva de Custo em Produção</strong></td>
      <td>Turno 1 barato, custo catastrófico de depuração no Turno 5+</td>
      <td>10% de esforço inicial na spec, custo de regressão próximo de zero</td>
    </tr>
  </tbody>
</table>

<h2>5. O Modelo Elephant-Goldfish (EGM): Verificação Cega Zero-Contexto</h2>
<p>Mesmo com uma especificação rigorosa, um modo de falha sutil permanece quando um único agente de IA escreve e verifica o código: <strong>viés cognitivo compartilhado</strong>.</p>
<p>Se o Agente A consome 40.000 tokens explorando um repositório, lendo soluções legadas, elaborando um plano e escrevendo uma implementação, o Agente A desenvolve <em>visão de túnel</em>. Quando questionado <em>"Seu código satisfaz todas as invariantes?"</em>, a atenção do Agente A está saturada com suas próprias justificativas. Ele deixará passar um <code>await</code> ausente, um caso de borda em <code>INV-02</code> ou um cast silencioso porque ele <em>tinha a intenção</em> de que o código funcionasse.</p>
<p>Para derrotar o viés de confirmação, o <strong>Benni Master OS</strong> aplica o <strong>Modelo Elephant-Goldfish (EGM)</strong> — uma arquitetura de consenso formal em dois papéis:</p>
<h3>Papel 1: O Elefante (Contexto Sistêmico e Síntese)</h3>
<p>O <strong>Elefante</strong> retém a memória arquitetural de longo horizonte da base de código: grafos de dependência, restrições legadas, histórico de design e relações entre módulos. O Elefante redige o Contrato Conductor e sintetiza o diff de implementação.</p>
<h3>Papel 2: O Goldfish (Revisor Cego Zero-Contexto)</h3>
<p>O <strong>Goldfish</strong> é instanciado em um <strong>contexto completamente isolado e sem histórico</strong>. Ele nunca viu o rastro de raciocínio do Elefante, seus rascunhos ou suas tentativas anteriores. O Goldfish recebe <strong>exatamente duas entradas</strong>:</p>
<ol>
  <li>O <strong>Contrato Conductor Imutável</strong> (a especificação e suas invariantes).</li>
  <li>O <strong>Git Diff / Artefato AST Resultante</strong> (a implementação).</li>
</ol>
<p>O mandato do Goldfish é adversarial e estritamente objetivo: <strong>Provar que o diff satisfaz todas as invariantes do contrato ou rejeitá-lo com contraexemplos exatos por linha.</strong></p>
<pre><code>+-------------------------------------------------------------------------+
|                  PROTOCOLO DE CONSENSO ELEPHANT-GOLDFISH                |
|                                                                         |
|  [AGENTE ELEFANTE]                                                      |
|   - Memória completa do codebase e histórico de design                  |
|   - Compila Spec + Sintetiza Diff                                       |
|           |                                                             |
|           +---&gt; Produz: (1) Contrato Conductor  (2) Code Diff           |
|                                  |                     |                |
|                                  v                     v                |
|                     [BARREIRA DE INFORMAÇÃO: ZERO VAZAMENTO]            |
|                                  |                     |                |
|                                  v                     v                |
|  [AGENTE GOLDFISH (Subagente Zero-Contexto)]                            |
|   - Vê APENAS Contrato + Diff (Sem raciocínio ou desculpas do Elefante) |
|   - Audita cada regra INV-xx de forma adversarial                       |
|           |                                                             |
|           +---&gt; REJEITA (Contraexemplo) ---&gt; Retorna ao Elefante        |
|           +---&gt; APROVA (Consenso Formal) ---&gt; Segue para AST e Testes   |
+-------------------------------------------------------------------------+</code></pre>
<p>Por que essa barreira é tão eficaz? Porque <strong>um Goldfish não pode ser convencido pelo raciocínio prévio do Elefante.</strong> Se o Elefante escreveu acidentalmente <code>if event_id:</code> em vez de verificar o bloqueio transacional do banco, o próprio contexto do Elefante pode "lembrar" que queria uma transação e ignorar o bug. O Goldfish, vendo apenas <code>INV-03</code> e o diff bruto, aponta imediatamente: <em>"VIOLAÇÃO INV-03: <code>subscription_repo.update()</code> e <code>event_ledger.insert()</code> executam em commits implícitos separados; nenhum bloco transacional atômico envolve ambas as chamadas."</em></p>

<h3>Matriz de Gates de Consenso EGM</h3>
<table>
  <thead>
    <tr>
      <th>Estágio do Gate</th>
      <th>Ator</th>
      <th>Entradas Visíveis</th>
      <th>Gatilho de Rejeição</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Gate 1: Trava de Spec</strong></td>
      <td>Elefante + Operador</td>
      <td>Intenção do Usuário + Arquitetura</td>
      <td>Tipos ambíguos, fluxos de erro ausentes, escopo aberto</td>
    </tr>
    <tr>
      <td><strong>Gate 2: Gate de AST</strong></td>
      <td>Parser Determinístico</td>
      <td>Contrato Conductor + AST Sintetizada</td>
      <td>Imports proibidos, assinatura divergente, alta complexidade</td>
    </tr>
    <tr>
      <td><strong>Gate 3: Auditoria Goldfish</strong></td>
      <td>Subagente Zero-Contexto</td>
      <td>APENAS Contrato + Diff</td>
      <td>Qualquer invariante não provada, fallback silencioso ou deriva</td>
    </tr>
    <tr>
      <td><strong>Gate 4: Reality Lock</strong></td>
      <td>Runner de Testes</td>
      <td>Build Completo + Suíte Determinística</td>
      <td>Asserção falhando, teste pulado ou mock não verificado</td>
    </tr>
  </tbody>
</table>

<h2>6. Checagem de Invariantes em AST Antes da Execução de Código</h2>
<p>Esperar que testes em tempo de execução capturem deriva estrutural é lento e incompleto — testes exercitam apenas os caminhos que cobrem explicitamente. O SDD adiciona uma <strong>Camada Determinística de Verificação via Árvore de Sintaxe Abstrata (AST)</strong> que inspeciona a estrutura do código <em>antes</em> que ele seja executado.</p>
<p>Ao analisar arquivos Python, TypeScript ou Rust gerados em suas ASTs nativas, o verificador prova propriedades estruturais em milissegundos com <strong>custo zero de tokens de LLM</strong>:</p>
<ul>
  <li><strong>Fidelidade de Assinatura e Tipos:</strong> Verifica se funções exportadas correspondem exatamente aos nomes de parâmetros, anotações de tipo e tipos de retorno declarados no Contrato Conductor.</li>
  <li><strong>Aplicação de Fronteiras de Importação:</strong> Garante que módulos de domínio não importem camadas de infraestrutura proibidas (por exemplo, impedindo que um serviço de domínio puro importe <code>requests</code>, <code>subprocess</code> ou <code>os.environ</code> diretamente).</li>
  <li><strong>Limites de Fluxo de Controle e Complexidade:</strong> Sinaliza condicionais profundamente aninhadas, cláusulas <code>except:</code> nuas, erros engolidos ou recursão irrestrita que violem padrões de confiabilidade em produção.</li>
  <li><strong>Provas de Ordem de Operações:</strong> Para invariantes de segurança como <code>INV-01</code> (<em>"Verificar assinatura HMAC antes do parse JSON"</em>), um visitante de AST comprova estaticamente que <code>verify_hmac(...)</code> domina <code>json.loads(...)</code> em todos os caminhos de controle dentro de <code>handle_billing_webhook</code>.</li>
</ul>
<p>Veja como um verificador leve em AST Python captura com precisão uma alucinação clássica de IA — um LLM inserindo um <code>except Exception: pass</code> silencioso ou chamando <code>json.loads()</code> antes da verificação da assinatura:</p>
<pre><code>import ast
from typing import List

class WebhookInvariantVisitor(ast.NodeVisitor):
    '''Verificador estático em AST provando INV-01 e banindo supressão silenciosa de exceções.'''

    def __init__(self) -&gt; None:
        self.hmac_line: int | None = None
        self.json_parse_line: int | None = None
        self.violations: List[str] = []

    def visit_Call(self, node: ast.Call) -&gt; None:
        func_name = ast.unparse(node.func)
        if "verify_hmac" in func_name and self.hmac_line is None:
            self.hmac_line = node.lineno
        if func_name in {"json.loads", "orjson.loads"} and self.json_parse_line is None:
            self.json_parse_line = node.lineno
        self.generic_visit(node)

    def visit_ExceptHandler(self, node: ast.ExceptHandler) -&gt; None:
        if node.type is None:
            self.violations.append(f"Linha {node.lineno}: Cláusula 'except:' nua proibida pelo contrato.")
        if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
            self.violations.append(f"Linha {node.lineno}: Supressão silenciosa ('pass') proibida.")
        self.generic_visit(node)

    def verify(self, source_code: str) -&gt; List[str]:
        tree = ast.parse(source_code)
        self.visit(tree)
        if self.json_parse_line is not None:
            if self.hmac_line is None or self.hmac_line &gt; self.json_parse_line:
                self.violations.append(
                    "VIOLAÇÃO INV-01: Desserialização JSON ocorre antes da verificação criptográfica HMAC."
                )
        return self.violations</code></pre>
<p>Essa passagem de 30 linhas em AST executa em menos de 2 milissegundos, não pode ser persuadida por nomes criativos de variáveis e elimina permanentemente uma classe inteira de regressões de segurança e confiabilidade antes mesmo de o executor de testes iniciar.</p>

<h2>7. Reality Lock: Separando Intenção de Evidência Observada</h2>
<p>Um modo de falha generalizado em agentes autônomos de código é o <strong>relato otimista</strong>: um agente edita um arquivo, executa uma checagem parcial ou mockada e declara <em>"Todos os testes passaram e a produção está pronta."</em></p>
<p>O Conductor SDD impõe o <strong>Reality Lock</strong> — um protocolo epistêmico rigoroso em todo o ciclo de engenharia:</p>
<ul>
  <li><strong>Intenção</strong> é o que o usuário solicitou.</li>
  <li><strong>Plano</strong> é o Contrato Conductor compilado.</li>
  <li><strong>Dispatch</strong> é a execução limitada atribuída a um worker ou subagente.</li>
  <li><strong>Execução</strong> é a mutação real de arquivos e geração de AST.</li>
  <li><strong>Evidência Observada</strong> é o stdout/stderr bruto e o código de saída da execução de testes pós-edição, somados ao digest SHA-256 do artefato verificado.</li>
</ul>
<p>Sob o Reality Lock, <strong>nenhum agente tem permissão para declarar conclusão a menos que a evidência observada tenha sido capturada <em>após</em> a edição final.</strong> Se um único caractere mudar em um arquivo, todos os recibos de teste anteriores são invalidados, e os gates de AST e Reality Lock devem ser reexecutados.</p>

<h2>8. Implementando SDD na Sua Organização de Engenharia</h2>
<p>Adotar o Desenvolvimento Orientado a Especificações não exige substituir suas linguagens, frameworks ou pipelines de CI/CD atuais. Exige mudar <em>onde</em> o rigor de engenharia é aplicado:</p>
<ol>
  <li><strong>Congele o Contrato Primeiro:</strong> Para qualquer funcionalidade que toque mais de dois arquivos ou altere estado persistente, exija um Contrato Conductor escrito (interfaces, invariantes, trava de escopo) antes de acionar qualquer agente de código.</li>
  <li><strong>Isole Seus Revisores:</strong> Nunca peça para a mesma sessão de chat que escreveu um diff de 400 linhas auditá-lo. Instancie um agente Goldfish novo e sem contexto apenas com o contrato e o git diff.</li>
  <li><strong>Automatize Invariantes Estruturais com ASTs:</strong> Codifique os comentários recorrentes de code review da sua equipe (imports proibidos, fronteiras transacionais, regras de log, tipagem estrita) em visitantes leves de AST no CI.</li>
  <li><strong>Exija Reality Lock em Cada Merge:</strong> Exija recibos criptográficos ou imutáveis de CI comprovando que todos os gates de aceite passaram exatamente no commit SHA sendo integrado.</li>
</ol>
<p>A era de tratar assistentes de código de IA como máquinas caça-níqueis conversacionais acabou. Organizações que dominam o <strong>Desenvolvimento Orientado a Especificações, Contratos Conductor e Consenso Formal Elephant-Goldfish</strong> conquistam tanto a velocidade da síntese autônoma quanto a confiabilidade da engenharia de sistemas formais.</p>
<p>Pronto para arquitetar sistemas de IA com deriva zero? Explore a <a href="https://benni-os.net/blog/academy.html">Academia de Engenharia Benni OS</a> ou acesse a <a href="https://benni-os.net/">Plataforma Benni OS</a>.</p>
"""

FAQS_PT = [
    ("Por que o vibe coding 'Prompt-and-Pray' falha após 3 a 5 turnos?", "A geração probabilística de código acumula deriva de contexto e diluição de atenção a cada turno. Sem uma especificação travada, cada edição introduz premissas implícitas e violações silenciosas de invariantes que se multiplicam exponencialmente."),
    ("O que é Desenvolvimento Orientado a Especificações (SDD)?", "SDD é uma metodologia de engenharia onde a intenção humana ou de agente é compilada em um Contrato Conductor imutável e verificável por máquina (schemas, invariantes, travas de escopo e gates de aceite) antes que qualquer código de implementação seja sintetizado."),
    ("Como a verificação cega Elephant-Goldfish previne alucinações?", "O Elefante retém o contexto completo do repositório para redigir a especificação e o código, enquanto o Goldfish é um subagente sem contexto que recebe apenas o contrato e o git diff. Por não ver o raciocínio do autor, ele elimina o viés de confirmação compartilhado."),
    ("O que é checagem de invariantes em nível de AST?", "É uma passagem determinística pré-execução que analisa o código-fonte gerado em uma Árvore de Sintaxe Abstrata (AST) para provar matematicamente assinaturas de funções, fronteiras de importação, ordem de operações e padrões proibidos em milissegundos.")
]


def count_words(text: str) -> int:
    clean = re.sub(r"<[^>]+>", " ", text)
    return len(re.findall(r"\b\w+\b", clean))


def publish_to_devto_with_retry(title: str, body_markdown: str, tags: list[str], canonical_url: str) -> dict:
    """Publishes an article to DEV.to with 12s initial stagger and 15s retry on HTTP 429 (up to 3 retries)."""
    print("-> Waiting 12 seconds before calling DEV.to API (rate-limit stagger)...")
    time.sleep(12)

    url = "https://dev.to/api/articles"
    payload = {
        "article": {
            "title": title,
            "published": True,
            "body_markdown": body_markdown,
            "tags": tags[:4],
            "canonical_url": canonical_url
        }
    }
    data = json.dumps(payload).encode("utf-8")

    max_retries = 3
    for attempt in range(max_retries + 1):
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "api-key": DEV_TO_API_KEY,
                "Content-Type": "application/json",
                "User-Agent": "BenniDailyPublisher/1.0"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                print(f"[DEVTO SUCCESS] ID: {res_data.get('id')} | URL: {res_data.get('url')}")
                return res_data
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            if e.code == 429 and attempt < max_retries:
                print(f"[DEVTO 429] Rate limited (attempt {attempt + 1}/{max_retries}). Sleeping 15s...")
                time.sleep(15)
                continue
            print(f"[DEVTO ERROR] HTTP {e.code}: {err_body}")
            raise
    raise RuntimeError("Exceeded max retries for DEV.to API")


def main():
    wc_devto = count_words(DEVTO_MD)
    wc_en = count_words(BODY_EN)
    wc_pt = count_words(BODY_PT)
    print(f"Word counts -> DEVTO_MD: {wc_devto} | BODY_EN: {wc_en} | BODY_PT: {wc_pt}")

    # 1. Generate English HTML
    path_en = os.path.join(PROJECT_DIR, "blog", "en", f"{META['slug_en']}.html")
    html_en = get_html_template(
        "en",
        META["title_en"],
        META["summary_en"],
        META["slug_en"],
        META["slug_pt"],
        META["hero_image"],
        META["category"],
        META["reading_time"],
        BODY_EN,
        FAQS_EN,
        "Eliminate AI Code Drift with Conductor SDD",
        "Adopt Spec-Driven Development, Elephant-Goldfish blind verification, and AST invariant gates across your engineering teams.",
        "Explore Benni OS Academy",
        "https://benni-os.net/blog/academy.html"
    )
    os.makedirs(os.path.dirname(path_en), exist_ok=True)
    with open(path_en, "w", encoding="utf-8") as f:
        f.write(html_en)
    print(f"[HTML EN OK] {path_en}")

    # 2. Generate Portuguese HTML
    path_pt = os.path.join(PROJECT_DIR, "blog", f"{META['slug_pt']}.html")
    html_pt = get_html_template(
        "pt",
        META["title_pt"],
        META["summary_pt"],
        META["slug_en"],
        META["slug_pt"],
        META["hero_image"],
        META["category"],
        META["reading_time_pt"],
        BODY_PT,
        FAQS_PT,
        "Elimine a Deriva de Código com Conductor SDD",
        "Implante Desenvolvimento Orientado a Especificações, verificação cega Elephant-Goldfish e gates em AST na sua engenharia.",
        "Acessar Benni OS Academy",
        "https://benni-os.net/blog/academy.html"
    )
    os.makedirs(os.path.dirname(path_pt), exist_ok=True)
    with open(path_pt, "w", encoding="utf-8") as f:
        f.write(html_pt)
    print(f"[HTML PT OK] {path_pt}")

    # 3. Publish EN article to DEV.to
    canonical_url = f"https://benni-os.net/blog/en/{META['slug_en']}.html"
    res = publish_to_devto_with_retry(META["title_en"], DEVTO_MD, META["tags"], canonical_url)
    print(f"FINAL_RESULT|DEVTO_ID={res.get('id')}|DEVTO_URL={res.get('url')}|HTML_EN={path_en}|HTML_PT={path_pt}")


if __name__ == "__main__":
    main()
