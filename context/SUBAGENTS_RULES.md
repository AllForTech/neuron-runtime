# AGENT ORCHESTRATION RULES

You must operate as a coordinated engineering system, not a single-threaded implementation agent.

For large systems, complex features, infrastructure-heavy tasks, or broad codebase analysis, you must decompose work into specialized execution units or subagents.

Subagents should be used for:
- architecture analysis,
- codebase exploration,
- dependency tracing,
- implementation planning,
- UI systems,
- backend systems,
- infrastructure analysis,
- debugging,
- performance analysis,
- testing strategy,
- and documentation generation.

---

# SUBAGENT RESPONSIBILITY MODEL

Each subagent must have:
- a clearly scoped responsibility,
- isolated reasoning context,
- explicit objectives,
- and deterministic outputs.
- read `@context/DESIGN_RULES.md`

Subagents must avoid:
- overlapping responsibilities,
- uncontrolled modifications,
- and conflicting architectural decisions.

---

# CODEBASE EXPLORATION RULES

Before implementing in large or existing systems, you must first deploy exploration-oriented subagents to:

- inspect architecture,
- identify module boundaries,
- trace dependencies,
- understand naming conventions,
- inspect execution flow,
- identify shared abstractions,
- and detect architectural patterns.

You must NEVER modify large systems without first understanding:
- system structure,
- dependency relationships,
- and architectural conventions.

---

# IMPLEMENTATION ORCHESTRATION

Implementation work must be decomposed into:
- planning,
- architecture validation,
- implementation,
- verification,
- and documentation stages.

Complex implementations should use specialized subagents for:
- frontend systems,
- backend systems,
- database changes,
- infrastructure,
- observability,
- and testing.

Subagents must search and use the necessary skills and must use context7 mcp for up-to-date documentations
---

# EXECUTION SAFETY RULES

Before executing changes, you must:
1. evaluate architectural impact,
2. inspect dependency relationships,
3. identify affected systems,
4. verify compatibility,
5. and validate execution boundaries.

You must avoid:
- blind global modifications,
- uncontrolled refactors,
- architecture-breaking changes,
- and unverified dependency mutations.

---

# PARALLEL REASONING

When solving complex problems, you should use parallel reasoning paths where appropriate.

Examples:
- one subagent analyzes architecture,
- one analyzes performance implications,
- one analyzes security implications,
- one validates developer experience,
- and one evaluates scalability impact.

Final decisions must synthesize all reasoning outputs coherently.

---

# CONTEXT MANAGEMENT

You must preserve context discipline.

Subagents should:
- receive scoped context,
- avoid unnecessary global assumptions,
- and return structured outputs.

Large codebases must be analyzed incrementally, not loaded mentally as a single undifferentiated system.

---

# VERIFICATION RULES

After subagent execution:
- outputs must be validated,
- architectural consistency must be checked,
- duplicated logic must be detected,
- and integration safety must be verified.

No implementation should be accepted solely because it compiles.

---

# ORCHESTRATION PHILOSOPHY

You must behave like:
- a coordinated engineering organization,
- not an isolated autocomplete engine.

The objective is:
- scalable reasoning,
- architectural consistency,
- implementation safety,
- and production-grade system evolution.