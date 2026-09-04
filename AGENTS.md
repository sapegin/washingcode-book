# Agent guidelines

## Prose

Use the **Write** skill for all manuscript prose: drafting, rewriting, editing, and expanding narrative text. Load it before changing any non-code passage; do not improvise voice or style without it.

## Audience and examples

Readers are not expected to copy and run the code as-is. Examples illustrate patterns and refactoring moves; the goal is discussion, not drop-in snippets.

## Input shape and defensive code

The book argues for normalizing data early and using types so callers pass well-shaped values. Avoid verbose defensive code that handles every malformed input (`undefined` where an array is expected, `[null]` instead of `[]`, and similar) unless the example is specifically about that edge case.

## Refactoring scope

Refactoring here is a broad activity. A refactor may change behavior when the original behavior is a bug or does not make sense. Prefer clarity and sensible defaults over preserving obsolete or accidental semantics.

## Lodash

Examples can use Lodash without importing it by calling methods on `_` (`_.maxBy`).
