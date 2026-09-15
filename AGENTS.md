# Agent guidelines

## Prose

Use the **Write** skill for all manuscript prose: drafting, rewriting, editing, and expanding narrative text. Load it before changing any non-code passage; do not improvise voice or style without it.

## Audience and examples

The book is written in a conversational style, not as a step-by-step tutorial. Readers are not expected to copy and run the code as-is.

Examples illustrate patterns and refactoring moves; the goal is discussion, not drop-in snippets. Many examples are intentionally incomplete. They are meant to demonstrate an idea or pattern, not to compile or run in isolation. Include enough code to make the point clear; omit the rest so it does not distract from the main argument.

Surrounding HTML comments often supply test harnesses, mocks, or other context that the fenced block omits for brevity. Read that context before treating an example as broken or standalone.

When reviewing or auditing manuscript code, do not expect every example to be self-contained, wired up, or production-ready.

## Legacy vs refactored examples

Many chapters show a “before” and “after” side by side. The before block may deliberately use legacy or suboptimal patterns because that is what the passage is about, and they are taken from actual production code.

Do not flag deprecated APIs, outdated library usage, or other legacy patterns in **before** (original, commented, or intentionally messy) examples unless the text presents that code as the recommended approach.

Apply modernity and best-practice checks to **refactored** or **recommended** code — the version the prose argues readers should prefer.

## Input shape and defensive code

The book argues for normalizing data early and using types so callers pass well-shaped values. Avoid verbose defensive code that handles every malformed input (`undefined` where an array is expected, `[null]` instead of `[]`, and similar) unless the example is specifically about that edge case.

## Refactoring scope

Refactoring here is a broad activity. A refactor may change behavior when the original behavior is a bug or does not make sense. Prefer clarity and sensible defaults over preserving obsolete or accidental semantics.

## Lodash

Examples can use Lodash without importing it by calling methods on `_` (`_.maxBy`).
