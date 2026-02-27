# Alternatives Framework

This reference describes the structured approach for presenting alternatives and evaluating them during the "Discuss & Vibe" dialogue.

## Number of Alternatives

Present **2 or 3 alternatives**. You can present more if the decision complexity warrants it, but avoid overwhelming the user.

## Flexibility of Format

The structure below is a guideline, not a rigid constraint. Adapt the level of detail to the complexity of the feature. For a major architectural choice, use the full framework. For a minor UI tweak, a lighter, more conversational comparison is preferred.

## Evaluation Criteria

Evaluate each alternative against these dimensions:

| Criterion              | What to Assess                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Simplicity**         | How easy to understand, maintain, and debug                                            |
| **Architecture Fit**   | Alignment with the project's established architecture and defined technical boundaries |
| **Performance**        | Runtime efficiency, scalability implications                                           |
| **Complexity**         | Implementation effort, cognitive load, moving parts                                    |
| **Future Flexibility** | How easy to extend, modify, or pivot later                                             |
| **Risk**               | Potential for bugs, security issues, technical debt                                    |
| **Industry Standard**  | How professionals typically solve this problem                                         |

## The Socratic Phase

Before moving to alternatives, you MUST pause and ask **Socratic Questions**. The goal is to strip away assumptions and find the "First Principle."

**Critical rule**: Every question must be **self-contained** — include enough context that the user can answer without recalling implementation details. Ground questions in user actions and visible behavior.

### Questioning Patterns:

1. **Clarification**: "When you say [X], do you mean [concrete scenario A] or [concrete scenario B]?"
2. **Assumption Testing**: "Right now [describe current behavior]. Are we sure we need to change that, or is there a simpler way to get what we want?"
3. **Reason/Evidence**: "What's the actual problem the user is hitting? Is it [specific friction point]?"
4. **Implications**: "If we add this, the user would also need to [concrete consequence]. Is that acceptable?"
5. **Project Alignment**: "This feels like it's moving toward [complex feature]. Does it still fit within the scope of our current project goals?"

---

## Presentation Format

When presenting alternatives, lead with what the user experiences, then support with technical reasoning using simple, jargon-free language.

```
**Option A: [Short Descriptive Name]**

_What the user experiences_: [Describe in terms of concrete actions: "When the User clicks X, they instantly see Y"]

_How it works_: [Brief explanation using the "Actor/System/Outcome" framing. If you use a technical term, explain it inline like you are speaking to a non-technical founder]

_Pros_:
- [Benefit 1 — "The user doesn't have to wait for a loading screen"]
- [Benefit 2]

_Cons_:
- [Drawback 1 — "If their internet drops, their work is lost"]
- [Drawback 2]

_Architecture Check_: [Does this fit our principles? Any concerns?]

_Best When_: [Context where this option makes the most sense]
```

## Making Recommendations

After presenting alternatives, always state your recommendation with reasoning:

```
**Recommendation**: Option [X]

[Reasoning that ties back to the evaluation criteria and project principles]
```
