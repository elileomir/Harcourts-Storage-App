# Ultimate AI Development Instructions
## Preventing Technical Debt & Building Quality Software

> **Version:** 1.0 | **Last Updated:** November 2025
> **Purpose:** Comprehensive guidelines for AI assistants to generate high-quality, maintainable, secure code while avoiding technical debt

---

## 🎯 CORE PRINCIPLES

### The Technical Debt Problem with AI
- AI-generated code accounts for 30-41% of all code in 2025
- Studies show 8x increase in code duplication when using AI tools
- 45% of AI-generated code introduces security vulnerabilities
- Google DORA 2024: 25% increase in AI usage = 7.2% decrease in delivery stability
- AI creates syntactically correct code that lacks contextual awareness of business logic

### Fundamental Rules
1. **Never prioritize speed over maintainability**
2. **Every piece of code must have a clear purpose and owner**
3. **Technical debt is a strategic risk, not an operational nuisance**
4. **AI is an assistant, not a replacement for engineering judgment**

---

## 📋 BEFORE WRITING CODE

### Context Gathering Checklist
```yaml
REQUIRED_CONTEXT:
  - Project architecture and patterns already in use
  - Existing code conventions and naming standards
  - Dependencies and their versions
  - Target environment and runtime constraints
  - Business logic requirements
  - Security and compliance requirements
  - Testing expectations
  
IF_CONTEXT_MISSING:
  action: "ASK_USER for clarification"
  reason: "Missing context is the #1 cause of poor AI code quality"
```

### Understand the Codebase First
- **Read before writing** - Analyze relevant existing files before proposing changes
- **Follow existing patterns** - Match the style, conventions, and abstractions already in use
- **Respect architecture** - Understand where new code fits in the broader system
- **Check dependencies** - Know what libraries are already available

---

## 🏗️ CODE STRUCTURE & ARCHITECTURE

### Modular Design Principles
```yaml
MODULARITY_RULES:
  single_responsibility: "Each module/function does ONE thing well"
  encapsulation: "Hide internal details, expose clean interfaces"
  loose_coupling: "Minimize dependencies between modules"
  high_cohesion: "Related functionality stays together"
  
MAX_COMPLEXITY:
  function_lines: 50
  file_lines: 300
  cyclomatic_complexity: 10
  nesting_depth: 3
```

### DRY (Don't Repeat Yourself)
- **Before creating new code:** Search for existing utilities that solve the problem
- **Never copy-paste code blocks** - Extract to reusable functions
- **Consolidate similar logic** - Create shared abstractions
- **Refactor into reusable modules** - Move repeated patterns to shared locations

### Code Organization
```
STRUCTURE_PATTERN:
  - Group by feature/domain, not by type
  - Keep related files close together
  - Use clear, descriptive folder names
  - Maintain consistent file naming conventions
  - Document module boundaries and responsibilities
```

---

## ✍️ CODE QUALITY STANDARDS

### Naming Conventions
```yaml
NAMING_RULES:
  variables: "Descriptive, reveals intent (not single letters except loops)"
  functions: "Verb + noun, describes action (getUserById, calculateTotal)"
  classes: "Noun, describes entity (UserService, PaymentProcessor)"
  constants: "SCREAMING_SNAKE_CASE"
  files: "Match primary export name, use consistent casing"
  
AVOID:
  - Abbreviations unless universally understood
  - Generic names (data, info, temp, handler)
  - Hungarian notation
  - Numbers in names (data2, newData)
```

### Comments and Documentation
```yaml
DOCUMENTATION_REQUIREMENTS:
  functions:
    - Purpose and what it returns
    - Parameter descriptions with types
    - Throws/exceptions documented
    - Usage examples for complex functions
    
  files:
    - Module purpose at top
    - Public API documentation
    - Dependencies and requirements
    
  inline_comments:
    - Explain WHY, not WHAT (code shows what)
    - Mark workarounds with TODO and reason
    - Reference ticket numbers for business logic
    
WHEN_TO_COMMENT:
  - Complex algorithms
  - Non-obvious business logic
  - Workarounds and their reasons
  - Security-sensitive code
  - Performance optimizations
```

### Error Handling
```yaml
ERROR_HANDLING_RULES:
  - Never silently swallow errors
  - Provide meaningful error messages
  - Include context (what failed, with what inputs)
  - Use appropriate error types/codes
  - Log errors with sufficient detail for debugging
  - Don't expose internal details to users
  - Fail fast and explicitly
  
PATTERN:
  try:
    operation()
  catch:
    log_with_context()
    handle_or_rethrow()
  finally:
    cleanup_resources()
```

---

## 🔒 SECURITY REQUIREMENTS

### Input Validation
```yaml
ALWAYS_VALIDATE:
  - User inputs (format, length, type)
  - API parameters
  - File uploads (type, size, content)
  - URL parameters
  - Headers and cookies
  
VALIDATION_APPROACH:
  - Whitelist acceptable inputs
  - Sanitize before use
  - Reject rather than fix invalid input
  - Use parameterized queries (never string concatenation)
```

### Secrets and Authentication
```yaml
SECRETS_RULES:
  - NEVER hardcode credentials, API keys, or secrets
  - Use environment variables or secret managers
  - Use constant-time comparison for sensitive values
  - Rotate credentials regularly
  - Log authentication failures (but not credentials)
  
AUTHENTICATION:
  - Use industry-standard libraries (never roll your own)
  - Implement proper session management
  - Enforce strong password policies
  - Use MFA where appropriate
```

### Output Encoding
```yaml
ENCODING_RULES:
  html: "Escape HTML entities"
  sql: "Use parameterized queries"
  shell: "Avoid shell=True, escape arguments"
  json: "Use proper serialization"
  xml: "Disable external entities"
```

### Supply Chain Security
```yaml
DEPENDENCY_RULES:
  - Verify packages exist before suggesting
  - Pin specific versions (not ranges)
  - Prefer well-maintained, widely-used packages
  - Check for known vulnerabilities
  - Generate SBOM when appropriate
  - Verify checksums/signatures for critical dependencies
  
AVOID:
  - Packages with low download counts
  - Abandoned projects (no updates in 2+ years)
  - Packages from unknown sources
```

---

## 🧪 TESTING REQUIREMENTS

### Test-Driven Development (TDD) with AI
```yaml
TDD_WORKFLOW:
  1. WRITE_TEST_FIRST:
     - Define expected behavior
     - Include edge cases
     - Test should fail initially
     
  2. IMPLEMENT:
     - Write minimum code to pass test
     - Don't add untested features
     
  3. REFACTOR:
     - Improve code structure
     - Tests provide safety net
     - Verify tests still pass
     
  4. REPEAT:
     - Add next test
     - Continue cycle
```

### Test Coverage Requirements
```yaml
TEST_TYPES_REQUIRED:
  unit_tests:
    - All public functions
    - All business logic
    - Edge cases and boundaries
    
  integration_tests:
    - API endpoints
    - Database operations
    - External service interactions
    
  security_tests:
    - Input validation
    - Authentication/authorization
    - Injection prevention
    
COVERAGE_TARGETS:
  critical_paths: 90%+
  business_logic: 80%+
  utilities: 70%+
```

### What to Test
```yaml
ALWAYS_TEST:
  - Happy path (expected behavior)
  - Edge cases (empty, null, max values)
  - Error conditions (invalid input, failures)
  - Boundary conditions
  - Concurrent access (where applicable)
  
TEST_QUALITIES:
  - Fast execution
  - Independent (no test dependencies)
  - Repeatable (same result every time)
  - Self-validating (pass/fail clearly)
  - Timely (written with code)
```

---

## 📝 PROMPT INTERACTION GUIDELINES

### How Users Should Prompt
```yaml
EFFECTIVE_PROMPTS_INCLUDE:
  - Programming language and version
  - Framework and libraries to use
  - Specific requirements and constraints
  - Performance expectations
  - Error handling expectations
  - Test requirements
  - Example inputs/outputs
  
EXAMPLE_GOOD_PROMPT: |
  "Write a Python 3.11+ function that validates email addresses.
  Requirements:
  - Use regex, no external libraries
  - Return tuple (is_valid: bool, error_message: str | None)
  - Handle edge cases: empty string, very long inputs
  - Include docstring and type hints
  - Write unit tests with pytest"
```

### AI Response Protocol
```yaml
BEFORE_GENERATING_CODE:
  - Confirm understanding of requirements
  - Identify ambiguities and ask for clarification
  - Consider if existing code could be reused
  - Plan the approach before writing
  
WHEN_GENERATING_CODE:
  - Follow existing project conventions
  - Include all necessary imports
  - Add appropriate error handling
  - Include inline documentation
  - Generate tests alongside implementation
  
AFTER_GENERATING_CODE:
  - Explain key design decisions
  - Note any assumptions made
  - Identify potential improvements
  - Suggest related tests
  - Highlight security considerations
```

---

## 🔄 CODE REVIEW CHECKLIST

### AI-Generated Code Review Focus Areas
```yaml
REVIEW_LAYERS:
  1_functional:
    - Does it meet requirements?
    - Are edge cases handled?
    - Does error handling make sense?
    
  2_structural:
    - Is it modular and reusable?
    - Does it follow DRY?
    - Is complexity manageable?
    
  3_security:
    - Is input validated?
    - Are there injection risks?
    - Is authentication proper?
    
  4_performance:
    - Are there obvious bottlenecks?
    - Is resource usage reasonable?
    - Are queries optimized?
    
  5_maintainability:
    - Is it readable?
    - Is it documented?
    - Will future devs understand it?
```

### Common AI Code Pitfalls to Check
```yaml
WATCH_FOR:
  - Hallucinated package names (verify they exist)
  - Deprecated APIs or methods
  - Inconsistent patterns with existing code
  - Missing error handling
  - Hardcoded values that should be configurable
  - Over-engineering simple solutions
  - Under-engineering security
  - Missing or inadequate tests
```

---

## 🚫 THINGS TO NEVER DO

### Absolute Prohibitions
```yaml
NEVER:
  - Hardcode secrets, credentials, or API keys
  - Use eval() or exec() with user input
  - Disable security features or type checking
  - Skip input validation
  - Swallow errors silently
  - Commit code without tests
  - Use deprecated/vulnerable dependencies
  - Generate synthetic data claiming it's real
  - Make up package names that don't exist
  - Ignore existing project patterns
  - Write monolithic functions (>100 lines)
  - Use magic numbers without constants
```

---

## 🔧 LANGUAGE-SPECIFIC GUIDELINES

### Python
```yaml
PYTHON_RULES:
  - Use type hints for all functions
  - Prefer pathlib over os.path
  - Use subprocess with shell=False
  - Never use eval/exec on user input
  - Use context managers for resources
  - Follow PEP 8 style guide
  - Use dataclasses or Pydantic for data structures
```

### JavaScript/TypeScript
```yaml
JS_TS_RULES:
  - Prefer TypeScript with strict mode
  - Use const by default, let when needed
  - Avoid any type - be explicit
  - Use async/await over callbacks
  - Implement proper error boundaries
  - Use optional chaining and nullish coalescing
  - Validate runtime types at boundaries
```

### Java
```yaml
JAVA_RULES:
  - Use standard crypto libraries (not custom)
  - Prefer records for data classes
  - Use try-with-resources
  - Follow Google Java Style Guide
  - Use Optional instead of null returns
  - Prefer immutable collections
```

### General
```yaml
ALL_LANGUAGES:
  - Use language-specific secure coding guidelines
  - Follow OWASP Top 10 principles
  - Use established frameworks over custom solutions
  - Leverage static analysis tools
  - Keep dependencies up to date
```

---

## 📊 METRICS & QUALITY GATES

### Code Quality Metrics to Track
```yaml
MONITOR:
  complexity:
    cyclomatic: "<10 per function"
    cognitive: "<15 per function"
    
  maintainability:
    tech_debt_ratio: "<5%"
    code_duplication: "<3%"
    
  security:
    vulnerabilities: "0 critical/high"
    code_smells: "Address within sprint"
    
  testing:
    coverage: ">80% critical paths"
    mutation_score: ">60%"
```

### Quality Gates (Must Pass Before Merge)
```yaml
REQUIRED_CHECKS:
  - All tests pass
  - No security vulnerabilities (high/critical)
  - Code coverage meets threshold
  - No linting errors
  - Documentation complete
  - Peer review approved
```

---

## 🔄 CONTINUOUS IMPROVEMENT

### Technical Debt Management
```yaml
DEBT_MANAGEMENT:
  prevention:
    - Review AI output before committing
    - Run static analysis continuously
    - Maintain test coverage
    
  detection:
    - Regular code audits
    - Track debt metrics
    - Monitor complexity trends
    
  resolution:
    - Allocate time each sprint for debt reduction
    - Prioritize by business impact
    - Refactor incrementally, not all at once
```

### When to Refactor
```yaml
REFACTOR_TRIGGERS:
  - Adding feature requires touching many files
  - Bug fixes keep recurring in same area
  - New team members struggle to understand
  - Tests are hard to write
  - Performance degrades
  - Security audit flags issues
```

---

## 🤖 AI-SPECIFIC WORKFLOW

### Using AI Effectively
```yaml
RECOMMENDED_WORKFLOW:
  1. Define requirements clearly first
  2. Break complex tasks into small steps
  3. Provide relevant context (files, examples)
  4. Review and understand generated code
  5. Run tests and static analysis
  6. Refactor to match project standards
  7. Document AI-assisted changes

AVOID:
  - Accepting code without understanding it
  - Using AI for security-critical code without extra review
  - Blindly accepting suggested dependencies
  - Rushing AI output to production
```

### Retry Strategy (Learned from Airbnb)
```yaml
IF_AI_OUTPUT_FAILS:
  1. Provide specific error messages back to AI
  2. Break problem into smaller steps
  3. Give more context about requirements
  4. Try different approaches (max 3 iterations)
  5. If still failing, flag for human intervention
```

---

## ⚙️ CONFIGURATION TEMPLATE

### Project Rules File Structure
```yaml
# Place in .ai/rules.md, .cursorrules, or CLAUDE.md

PROJECT_CONTEXT:
  name: "[Project Name]"
  language: "[Primary Language]"
  framework: "[Main Framework]"
  architecture: "[e.g., Microservices, Monolith, etc.]"
  
CODING_STANDARDS:
  style_guide: "[Link or name]"
  formatting: "[Tool, e.g., Prettier, Black]"
  linting: "[Tool configuration]"
  
CRITICAL_RULES:
  - [Project-specific requirement 1]
  - [Project-specific requirement 2]
  
FILE_PATTERNS:
  tests: "[Pattern, e.g., **/*.test.ts]"
  config: "[Pattern]"
  
RESPONSE_FORMAT:
  include_tests: true
  include_documentation: true
  explain_decisions: true
```

---

## 📚 REFERENCES

This guide synthesizes best practices from:
- OpenSSF Security-Focused Guide for AI Code Assistant Instructions
- GitClear AI Copilot Code Quality Research 2024
- Google DORA State of DevOps 2024
- Airbnb LLM Migration Case Study
- MIT Sloan Review: Hidden Costs of Coding with Generative AI
- Qodo State of AI Code Quality 2025
- OWASP Top 10 and ASVS Guidelines

---

## 📋 QUICK REFERENCE

### Before Every Code Generation
1. ✅ Understand the existing codebase
2. ✅ Have clear requirements
3. ✅ Know the project conventions
4. ✅ Consider security implications
5. ✅ Plan for testing

### After Every Code Generation
1. ✅ Review and understand the code
2. ✅ Verify no hallucinated packages
3. ✅ Run tests and static analysis
4. ✅ Check for security issues
5. ✅ Ensure documentation is complete

---

**Remember:** The goal is not just working code, but maintainable, secure, well-tested code that future developers (including your future self) will thank you for.
