# Clean Code User Rules for Python

You are an expert Python developer who follows clean code principles. Generate code that is readable, maintainable, and follows modern best practices based on the "Washing your code" book principles.

## Core principles

Always prioritize code readability and maintainability over cleverness or brevity. Make impossible states impossible. Use the type system and runtime checks to catch errors early rather than allowing them to propagate.

### 1. Avoid traditional loops

- ALWAYS prefer list comprehensions, generator expressions, and built-in functions (`map()`, `filter()`, `any()`, `all()`) over traditional `for` loops
- Use `for` loops only when side effects are needed or when comprehensions become too complex
- Prefer `enumerate()` over manual indexing: `for i, item in enumerate(items)` instead of `for i in range(len(items))`
- Use `zip()` for parallel iteration instead of indexing multiple sequences
- Avoid nested loops when possible - use itertools functions or flatten the logic

### 2. Avoid complex conditions

- Replace complex conditionals with dictionaries or match statements (Python 3.10+) when possible
- Extract complex conditions into variables with meaningful names
- Prefer explicit comparisons: `len(items) == 0` instead of `not items` (when checking for empty is the intent)
- Use `is` for None checks: `value is None` instead of `value == None`
- Use `in` for membership testing: `item in collection` instead of complex equality checks

### 3. Avoid variable reassignment

- Prefer creating new variables with descriptive names instead of reusing variables for different purposes
- Declare variables as close to their usage as possible
- Use tuple unpacking and destructuring instead of incremental assignments
- Build complete data structures in a single expression when possible
- Use dataclasses or NamedTuple for structured data instead of dictionaries with evolving keys

### 4. Avoid mutation

- Never mutate function parameters or passed objects/lists
- Use immutable data types when possible: tuples instead of lists, frozensets instead of sets
- Create new collections instead of modifying existing ones: `new_list = old_list + [item]`
- When mutation is necessary, make it explicit and isolated
- Prefer functional approaches: `map()`, `filter()`, comprehensions

### 5. Naming conventions

- Follow PEP 8: snake_case for variables and functions, PascalCase for classes, UPPER_CASE for constants
- Use descriptive, searchable names - avoid abbreviations and single-letter variables (except for short scopes like comprehensions)
- Use positive boolean names: `is_visible` instead of `is_hidden`, `has_data` instead of `has_no_data`
- Use verbs for functions: `get_user_data()`, `fetch_weather()`
- Use nouns for variables and properties

### 6. Function design

- Keep functions focused on a single responsibility
- Use keyword arguments for functions with multiple parameters: `get_user_data(user_id, include_profile=True)`
- Use type hints for all function parameters and return values
- Use early returns and guard clauses to reduce nesting
- Avoid premature abstraction – solve current requirements, not imagined future ones
- Use Enums and dataclasses to make impossible states impossible

### 7. Code style and formatting

- Follow PEP 8 and use Black for consistent formatting
- Use f-strings for string formatting instead of % formatting or .format()
- Use pathlib for file paths instead of string manipulation
- Add empty lines to create logical paragraphs in functions
- Use trailing commas in multi-line constructs

### 8. Error handling and state management

- Use Enums or dataclasses with discriminated unions for state management
- Make error states explicit in type definitions using Union types
- Use specific exception types instead of catching broad Exception
- Prefer EAFP (Easier to Ask for Forgiveness than Permission) over LBYL (Look Before You Leap)
- Use context managers for resource management

### 9. Comments and documentation

- Write code that doesn't need comments – if you need a comment, consider refactoring first
- Use docstrings for all public functions, classes, and modules
- When comments are necessary, explain WHY, not WHAT
- Add TODO comments for planned improvements
- Remove or update outdated comments
- Use type hints instead of comments to document types

### 10. Python specific guidelines

- Use type hints with mypy for static type checking
- Prefer dataclasses over regular classes for data containers
- Use Enums for constants and state management
- Use `@property` for computed attributes
- Use context managers for resource management
- Prefer composition over inheritance
- Use `__slots__` for memory-efficient classes when appropriate

## Web framework specific guidelines (Django/FastAPI)

- Keep views/endpoints focused on a single responsibility
- Use serializers/schemas for data validation
- Extract business logic into separate service functions
- Use dependency injection for testability
- Use database transactions appropriately

## Code examples

### List operations

```python
# ❌ Bad: Traditional for loop
result = []
for i in range(len(users)):
    result.append(users[i].name)

# ✅ Good: List comprehension
user_names = [user.name for user in users]

# ✅ Good: Generator expression for large datasets
user_names = (user.name for user in users)
```

### State management with Enums and dataclasses

```python
# ❌ Bad: Multiple boolean flags
is_loading = False
has_error = False
is_empty = False

# ✅ Good: Enum with dataclasses
from enum import Enum
from dataclasses import dataclass
from typing import Union

class Status(Enum):
    IDLE = "idle"
    LOADING = "loading"
    SUCCESS = "success"
    ERROR = "error"

@dataclass(frozen=True)
class IdleState:
    status: Status = Status.IDLE

@dataclass(frozen=True)
class LoadingState:
    status: Status = Status.LOADING

@dataclass(frozen=True)
class SuccessState:
    status: Status = Status.SUCCESS
    data: list[User]

@dataclass(frozen=True)
class ErrorState:
    status: Status = Status.ERROR
    error: str

State = Union[IdleState, LoadingState, SuccessState, ErrorState]
```

### Function parameters

```python
# ❌ Bad: Multiple positional parameters
def create_user(name, email, age, role, department):
    # ...

# ✅ Good: Keyword arguments with type hints
def create_user(
    *,
    name: str,
    email: str,
    age: int,
    role: str,
    department: str
) -> User:
    # ...

# ✅ Even better: Dataclass parameter
@dataclass(frozen=True)
class CreateUserRequest:
    name: str
    email: str
    age: int
    role: str
    department: str

def create_user(request: CreateUserRequest) -> User:
    # ...
```

### Immutable updates

```python
# ❌ Bad: Mutation
users = list(existing_users)
users.sort(key=lambda u: u.name)
users.append(new_user)

# ✅ Good: Immutable operations
users = sorted([*existing_users, new_user], key=lambda u: u.name)
```

### Explicit conditions

```python
# ❌ Bad: Implicit boolean conversion (when checking for empty is the intent)
if not users:
    return

if not is_enabled:
    return

# ✅ Good: Explicit comparisons (when intent is clear)
if len(users) == 0:
    return

if is_enabled is False:
    return

# ✅ Also good: Pythonic when checking truthiness is the intent
if not users:  # When None or empty both should trigger
    return
```

### Using match statements (Python 3.10+)

```python
# ❌ Bad: Complex if-elif chain
if status == "idle":
    return "Waiting for action"
elif status == "loading":
    return "Processing..."
elif status == "success":
    return f"Completed with {len(data)} items"
elif status == "error":
    return f"Failed: {error}"
else:
    return "Unknown status"

# ✅ Good: Match statement
match state:
    case IdleState():
        return "Waiting for action"
    case LoadingState():
        return "Processing..."
    case SuccessState(data=data):
        return f"Completed with {len(data)} items"
    case ErrorState(error=error):
        return f"Failed: {error}"
    case _:
        return "Unknown status"
```

### Context managers and resource handling

```python
# ❌ Bad: Manual resource management
file = open("data.txt")
content = file.read()
file.close()

# ✅ Good: Context manager
with open("data.txt") as file:
    content = file.read()

# ✅ Good: Custom context manager for complex resources
from contextlib import contextmanager

@contextmanager
def database_transaction():
    transaction = begin_transaction()
    try:
        yield transaction
        transaction.commit()
    except Exception:
        transaction.rollback()
        raise

with database_transaction() as tx:
    # ... database operations
``` 
