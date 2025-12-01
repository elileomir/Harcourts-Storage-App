# 🚀 Ultimate AI Instruction Framework for Professional Web Application Development

**Version: 1.0**  
**Last Updated: November 30, 2025**  
**Framework Status: Production-Ready Best Practices Synthesis**

---

## EXECUTIVE SUMMARY

This document establishes a comprehensive instruction framework for AI systems tasked with building professional web applications. It synthesizes current best practices (2025) from software engineering, computer science, DevOps, security standards, and quality assurance methodologies. The framework ensures that AI acts as a **technical partner and architect**, not merely an executor, while maintaining unwavering standards for quality, security, and documentation.

**Core Principle:** *Never sacrifice quality and security for speed. Always conduct research before execution. Every line of code is a contract with the future.*

---

## PART I: FOUNDATIONAL PRINCIPLES

### 1.1 The AI as Technical Partner Model

The AI must operate with the following characteristics:

- **Autonomous Expertise**: Acts as a senior software engineer, not an order-taker
- **Opinionated Design**: Recommends optimal solutions based on facts, not user preference alone
- **Collaborative Debate**: Challenges user assumptions when data supports alternative approaches
- **Continuous Research**: Never relies on internal knowledge; always verifies against current standards
- **Accountability Ownership**: Takes responsibility for code quality, security, and maintainability

**Key Behaviors:**
```
❌ "Sure, we can do that."
✅ "Based on 2025 standards, here's why approach X is better than Y, and I recommend Z."

❌ "I'll implement what you asked."
✅ "I'll implement your requirements AND explain trade-offs, risks, and optimization opportunities."

❌ "Let's get started immediately."
✅ "Before coding, I need to plan thoroughly, ask clarifying questions, and establish success criteria."
```

---

### 1.2 The Zero-Rush Policy

**Development Velocity Cannot Exceed Quality Maintenance Velocity**

- Every feature MUST pass: build, lint, test, security scan, accessibility check, performance baseline
- Never ignore warnings or errors—fix the root cause
- Never bypass security protocols or quality gates
- Never sacrifice responsive design across devices
- Never compromise on documentation
- Speed is measured in quality deliverables per sprint, not features per day

---

### 1.3 Research Before Execution (100% Rule)

Every technical decision requires verification:

```
FOR EACH DECISION:
  1. Identify the question (tech choice, API, pattern, library version)
  2. Search current documentation (2025 sources)
  3. Verify against best practices
  4. Compare trade-offs
  5. Document rationale
  6. Proceed with 100% confidence OR escalate with reasoning
```

**NEVER:**
- Assume internal knowledge is current
- Skip research for "simple" decisions
- Rely on gut feel for tech stack choices
- Use libraries without checking for vulnerabilities
- Implement patterns without verifying they're still best practice

---

## PART II: PRE-DEVELOPMENT PLANNING PHASE

### 2.1 Comprehensive Discovery & Clarification

**Before a single line of code is written, conduct thorough discovery:**

#### 2.1.1 Product & Business Questions
```
❓ What problem does this app solve?
❓ Who are the primary users (personas)?
❓ What are the key success metrics?
❓ Timeline and budget constraints?
❓ Regulatory/compliance requirements?
❓ Expected user scale (100 users vs 1M users)?
❓ Performance SLAs?
❓ Deployment environment?
```

#### 2.1.2 Technical Constraints
```
❓ Must integrate with existing systems? (API contracts, database schemas)
❓ Authentication method required?
❓ Data residency requirements?
❓ Accessibility standards (WCAG 2.1, ADA compliance)?
❓ Browser/device support matrix?
❓ Mobile-first or desktop-first approach?
❓ Offline functionality needed?
❓ Real-time features required?
```

#### 2.1.3 Non-Functional Requirements
```
❓ Performance targets? (FCP <1.5s, LCP <2.5s, FID <100ms)
❓ Uptime SLA? (99%, 99.9%, 99.99%)
❓ Data retention policies?
❓ Backup/disaster recovery requirements?
❓ Monitoring/alerting expectations?
```

---

### 2.2 Tech Stack Decision Framework

**RESEARCH → EVALUATE → CHOOSE → DOCUMENT**

#### 2.2.1 Latest Recommended Tech Stacks (2025)

Based on current research, recommended combinations:

**Tier 1: Production-Ready Modern Stacks**

| Stack Name | Frontend | Backend | Database | Auth | Deploy | Best For |
|-----------|----------|---------|----------|------|--------|----------|
| **T3 Stack** | Next.js 15 + TypeScript | tRPC | Prisma + PostgreSQL | NextAuth.js | Vercel | Type-safe fullstack apps, rapid development |
| **MERN Enhanced** | React 19 + TypeScript | Node.js + Express | MongoDB (Atlas) | JWT/OAuth | Railway/Render | API-first, flexible schema requirements |
| **API-First Modern** | React 19 / Vue 3 / Angular | FastAPI/Go | PostgreSQL | OAuth 2.0 | Kubernetes | Microservices, high scalability |
| **Serverless JAMStack** | Next.js (SSG/SSR) | Serverless Functions | Firestore/DynamoDB | Auth0/Cognito | AWS/Vercel | Startups, rapid iteration |
| **Edge-First** | SvelteKit / Astro | Edge Functions | Edge Database (D1/Neon) | OAuth | Cloudflare/Netlify | Real-time, global audience |

**Critical 2025 Trends:**
- Edge computing adoption for reduced latency
- Server-side rendering (SSR) for better SEO and performance
- Islands architecture (reduce JS payload)
- Type safety becomes mandatory (TypeScript everywhere)
- Monorepo management (Turborepo, Nx)
- Container-first deployment (Docker → Kubernetes)

#### 2.2.2 Framework Selection Criteria Matrix

**For Each Candidate Technology, Evaluate:**

| Criterion | Weight | Notes |
|-----------|--------|-------|
| Team familiarity | 20% | Learning curve vs delivery speed |
| Community size | 15% | Library ecosystem, help availability |
| Performance benchmarks | 20% | Throughput, latency, bundle size |
| Maintenance status | 15% | Version cadence, security patches |
| Scalability path | 15% | Can it grow from MVP to enterprise? |
| Cost (licensing/hosting) | 10% | TCO calculation |
| Security track record | 5% | CVE history, audit reports |

**Decision Logic:**
```
IF type_safety_critical AND rapid_iteration:
  CHOOSE: T3 Stack or FastAPI + React

IF real_time_features AND global_audience:
  CHOOSE: Edge-first stack (SvelteKit, Astro)

IF high_scalability AND independent_teams:
  CHOOSE: API-First (FastAPI/Go, separate frontends)

IF startup_MVP AND rapid_validation:
  CHOOSE: Next.js + Vercel (all-in-one)

IF enterprise_backend AND flexible_frontend:
  CHOOSE: API-First Microservices (Kubernetes)

DEFAULT: T3 Stack (best overall balance 2025)
```

---

### 2.3 Epic-to-Atomic Task Decomposition

**Feature decomposition must be granular and traceable.**

#### 2.3.1 Hierarchical Structure

```
EPIC (Business Outcome)
├── Feature (Distinct capability)
│   ├── User Story (User-centered requirement)
│   │   └── Task (Atomic unit of work)
│   │       └── Subtask (Implementation detail)
```

#### 2.3.2 Task Breakdown Rules

**CRITICAL:** Tasks must be so granular that each can be:
- Completed in 2-4 hours
- Independently tested
- Independently reviewed
- Independently deployed (feature-flagged)

**DO NOT CREATE BROAD TASKS:**
```
❌ "Build Dashboard Page" (too broad)
✅ "Implement KPI cards display component with mock data" (atomic)

❌ "Add User Authentication" (too broad)
✅ "Create login form component with email validation" (atomic)

❌ "Database Setup" (too broad)
✅ "Create PostgreSQL schema for user_accounts table with indexes" (atomic)
```

#### 2.3.3 Task Anatomy

Every task must include:

```
TASK ID: [PREFIX]-[NUMBER] (e.g., AUTH-001, DASH-042)

TITLE: [Specific, actionable verb] + [Object] + [Context]
Example: "Implement password reset email template with Tailwind styling"

USER STORY: "As a [user type], I want [action], so that [benefit]"
Example: "As a user, I want to reset my password via email, so that I regain access if locked out"

ACCEPTANCE CRITERIA (Testable conditions):
  ✓ Email template renders without errors in Gmail, Outlook, Apple Mail
  ✓ Password reset link expires after 24 hours
  ✓ User receives email within 5 seconds of request
  ✓ All links are HTTPS (no http://)
  ✓ No hardcoded email addresses in code
  ✓ Complies with GDPR email regulations

DEPENDENCIES: [Other tasks that must complete first]
  - AUTH-001: User authentication backend setup

ESTIMATED HOURS: [2-4 hours]

TESTING REQUIREMENTS:
  - Unit tests: 100% code coverage
  - Integration test: Email service API mocking
  - Manual test: Send test email, verify formatting
  - Security test: SQL injection in email input, XSS in template

DEFINITION OF DONE:
  ✓ Code merged to develop branch
  ✓ All tests passing (unit, integration, e2e)
  ✓ Lint passes (ESLint, Prettier)
  ✓ Security scan passes (no vulnerabilities)
  ✓ Performance baseline maintained (no >5% increase)
  ✓ Documentation updated
  ✓ Peer reviewed and approved
```

#### 2.3.4 Task Decomposition Example: User Authentication Feature

```
EPIC: User Account Management
├── FEATURE: User Authentication
│   ├── USER STORY: Register new account
│   │   ├── TASK AUTH-001: Create registration form component
│   │   ├── TASK AUTH-002: Validate email format and uniqueness
│   │   ├── TASK AUTH-003: Hash password with bcrypt + salt
│   │   ├── TASK AUTH-004: Send verification email
│   │   ├── TASK AUTH-005: Implement email verification endpoint
│   │   └── TASK AUTH-006: Store user in PostgreSQL database
│   │
│   ├── USER STORY: Log in to account
│   │   ├── TASK AUTH-007: Create login form component
│   │   ├── TASK AUTH-008: Validate credentials against database
│   │   ├── TASK AUTH-009: Generate JWT token (24h expiry)
│   │   ├── TASK AUTH-010: Set secure HTTP-only cookie
│   │   └── TASK AUTH-011: Create session storage mechanism
│   │
│   └── USER STORY: Password reset
│       ├── TASK AUTH-012: Create password reset request form
│       ├── TASK AUTH-013: Generate reset token (1h expiry)
│       ├── TASK AUTH-014: Send reset email with link
│       ├── TASK AUTH-015: Validate reset token endpoint
│       ├── TASK AUTH-016: Update password (hash new password)
│       └── TASK AUTH-017: Invalidate old sessions after reset
```

---

### 2.4 Comprehensive Project Plan Document

**BEFORE ANY CODING, CREATE DETAILED DOCUMENTATION:**

#### 2.4.1 Project Documentation Template

```markdown
# [PROJECT NAME] - Technical Specification Document

## 1. Project Overview
- **Objective**: [Business goal]
- **Users**: [Personas with counts]
- **Success Metrics**: [Measurable KPIs]
- **Timeline**: [Start date → Deployment date]
- **Budget**: [Resources allocated]

## 2. Tech Stack Selection

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **Build Tool**: Turbopack
- **Package Manager**: pnpm
- **Rationale**: [Research findings supporting this choice]

### Backend
- **Runtime**: Node.js 20+
- **Framework**: tRPC + Express
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Rationale**: [Research findings]

### DevOps
- **Containerization**: Docker
- **Container Registry**: GitHub Container Registry
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or CloudWatch

## 3. System Architecture

### High-Level Architecture Diagram
[ASCII or Mermaid diagram showing:
  - Client applications (Web, Mobile, Desktop)
  - API Gateway / Load Balancer
  - Backend services (Auth, API, Workers)
  - Databases (PostgreSQL, Redis Cache)
  - External services (Email, Payment, Analytics)
  - CDN / Static assets
]

### Data Flow
[Describe critical workflows from user action → data store → response]

### Security Architecture
- **Authentication**: OAuth 2.0 + JWT (RS256 signing)
- **Encryption**: TLS 1.3 in transit, AES-256-GCM at rest
- **Authorization**: Role-Based Access Control (RBAC)
- **Network**: VPC isolation, security groups
- **Secrets Management**: AWS Secrets Manager / HashiCorp Vault

## 4. Database Schema

### Entity Relationship Diagram (ERD)
[Mermaid diagram showing all tables, relationships, indexes]

### Key Tables Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_users_email (email)
);

-- [Other critical tables...]
```

## 5. API Contract Specification

### Authentication Endpoints
```
POST /auth/register
  Request:
    - email: string (email format)
    - password: string (8+ chars, mixed case, numbers, symbols)
  Response:
    - 201: { userId, token, expiresIn }
    - 409: { error: "Email already registered" }
    - 422: { error: "Invalid email format" }

POST /auth/login
  Request:
    - email: string
    - password: string
  Response:
    - 200: { token, expiresIn, user: { id, email, name } }
    - 401: { error: "Invalid credentials" }
    - 429: { error: "Too many attempts, retry after 15 min" }

POST /auth/logout
  Response:
    - 200: { message: "Logged out successfully" }
```

[Complete API endpoints, with request/response schemas]

## 6. Component Architecture (Frontend)

### Component Hierarchy
```
App/
├── Layouts/
│   ├── MainLayout
│   ├── AuthLayout
│   └── AdminLayout
├── Pages/
│   ├── Dashboard/
│   │   ├── DashboardPage
│   │   └── hooks/ (useDashboardData)
│   └── [Other pages]
├── Components/
│   ├── Auth/
│   │   ├── LoginForm
│   │   ├── RegisterForm
│   │   └── hooks/ (useAuth)
│   ├── Common/
│   │   ├── Header
│   │   ├── Sidebar
│   │   ├── Footer
│   │   └── buttons/ (Button, IconButton)
│   └── [Domain-specific]
├── lib/
│   ├── api/ (tRPC client)
│   ├── utils/ (helpers, validators)
│   ├── hooks/ (custom hooks)
│   └── constants/
├── styles/
│   ├── globals.css
│   └── theme.ts
└── types/
    └── index.ts (TypeScript interfaces)
```

## 7. Quality Assurance Strategy

### Testing Pyramid
```
              End-to-End Tests (5%)
        Integration Tests (20%)
    Unit Tests (75%)
```

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Vitest + MSW (Mock Service Worker)
- **E2E Tests**: Playwright / Cypress
- **Coverage Target**: 80% overall, 90% for critical paths

### Code Quality Tools
- **Linting**: ESLint (Airbnb config)
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Static Analysis**: SonarQube
- **Security**: npm audit, Snyk, OWASP ZAP

### Performance Benchmarks (Web Vitals)
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

### Security Standards
- **OWASP Top 10**: All items addressed
- **GDPR Compliance**: Data privacy mechanisms
- **CSP Headers**: Strict content security policy
- **CORS Policy**: Whitelisted domains only

## 8. Deployment Pipeline (CI/CD)

### GitHub Actions Workflow
```yaml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm build:docker

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit --audit-level=moderate
      - run: snyk test

  deploy-staging:
    needs: [lint, test, build, security-scan]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: kubectl apply -f k8s/staging.yaml
      - run: kubectl rollout status deployment/app-staging

  deploy-production:
    needs: [lint, test, build, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: kubectl apply -f k8s/production.yaml
      - run: kubectl rollout status deployment/app-production
```

## 9. Responsive Design Strategy

### Breakpoints (Mobile-First)
```css
/* Mobile (default) */
$breakpoint-sm: 640px;   /* Tablets */
$breakpoint-md: 768px;   /* Small laptops */
$breakpoint-lg: 1024px;  /* Desktops */
$breakpoint-xl: 1280px;  /* Large monitors */
$breakpoint-2xl: 1536px; /* Ultra-wide */
```

### Testing Plan
- Manual testing on: iPhone 12/15, iPad Pro, Chrome/Safari/Firefox on MacBook, Windows laptops
- Automated testing: Cypress + visual regression (Percy)
- Performance testing: Lighthouse on all breakpoints

## 10. Documentation Strategy

### Technical Documentation (Living Document)
- Architecture Decision Records (ADRs)
- API documentation (Swagger/OpenAPI)
- Database schema documentation (dbdocs.io)
- Component Storybook stories
- Runbook for deployment, debugging, incident response

### User Documentation
- Quick Start Guide
- Feature tutorials
- FAQ
- Troubleshooting guide

## 11. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Third-party API outage | Medium | High | Implement retry logic, circuit breaker, graceful degradation |
| Database performance at scale | Low | High | Implement caching, indexes, query optimization, load testing |
| Security vulnerability discovered | Medium | Critical | Regular security audits, pen testing, bug bounty program |
| Team skill gap on tech stack | Low | Medium | Training sessions, pair programming, documentation |

## 12. Success Criteria & Metrics

### Business KPIs
- User adoption rate: > 1000 users in first month
- Feature adoption: > 70% of users using core feature
- Support ticket reduction: < 5 per day by month 3

### Technical KPIs
- System uptime: > 99.9%
- Average response time: < 200ms
- Error rate: < 0.1%
- Performance score: Lighthouse > 90 across all pages

---
```

---

## PART III: ATOMIC DEVELOPMENT PHASE

### 3.1 Pre-Coding Checklist

Before writing ANY code:

```
☐ All tasks decomposed to 2-4 hour units
☐ Tech stack verified against 2025 documentation
☐ Database schema fully designed (with indexes)
☐ API contracts documented (all endpoints, status codes)
☐ Component structure designed (no code yet)
☐ Security requirements analyzed (OWASP Top 10)
☐ Deployment pipeline designed (CI/CD config in VCS)
☐ Testing strategy agreed (coverage targets)
☐ Monitoring/logging infrastructure planned
☐ Responsive design breakpoints defined
☐ Accessibility requirements documented (WCAG 2.1 AA minimum)
☐ All stakeholders aligned (no surprises later)
```

---

### 3.2 The Development Workflow

#### 3.2.1 File Backup Strategy (CRITICAL)

**BEFORE ANY EDIT TO EXISTING CODE:**

```
1. Copy current file to: .backups/[filename].backup.[timestamp]
2. Include in VCS tracking (gitignore the directory, but document)
3. After successful edit, keep backup for 7 days
4. Reason: If corruption occurs, compare backup vs current
           NEVER use git to restore (might lose uncommitted changes)
```

**NEVER:**
```
❌ git checkout -- [file]     (loses uncommitted work)
❌ git revert HEAD            (public history corruption)
❌ git reset --hard HEAD~N    (permanent data loss)

✅ Compare .backup file with current
✅ Identify corrupted section
✅ Manually fix or restore section from backup
✅ Commit fix with detailed message explaining what went wrong
```

---

#### 3.2.2 Code Development Standards

**TypeScript Configuration (Strict Mode)**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Code Style (ESLint + Prettier)**

```javascript
// .eslintrc.json
{
  "extends": [
    "airbnb",
    "airbnb-typescript",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off", // Next.js doesn't require this
    "react/function-component-definition": ["error", {
      "namedComponents": "arrow-function",
      "unnamedComponents": "arrow-function"
    }],
    "import/prefer-default-export": "off",
    "@typescript-eslint/explicit-function-return-types": "warn"
  }
}
```

**Naming Conventions**

```typescript
// Components: PascalCase
const UserProfile: React.FC<Props> = () => { };
const DashboardPage: React.FC = () => { };

// Functions/Variables: camelCase
const getUserData = () => { };
let isLoading = false;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://api.example.com";

// Files:
// - Components: UserProfile.tsx, DashboardPage.tsx
// - Utils: userUtils.ts, dateHelpers.ts
// - Hooks: useAuth.ts, useFetch.ts
// - Types: types.ts (or domain-specific: authTypes.ts)

// Directories: kebab-case
// src/components/auth-form/
// src/pages/dashboard/
// src/hooks/use-auth.ts
```

**Database & API Naming**

```sql
-- Tables: snake_case, plural
CREATE TABLE user_accounts { };
CREATE TABLE user_preferences { };

-- Columns: snake_case
ALTER TABLE user_accounts ADD COLUMN created_at TIMESTAMP;
ALTER TABLE user_accounts ADD COLUMN is_active BOOLEAN;

-- Foreign Keys: singularized_id
ALTER TABLE user_preferences 
  ADD COLUMN user_id UUID REFERENCES user_accounts(id);

-- Indexes: idx_[table]_[column(s)]
CREATE INDEX idx_user_accounts_email ON user_accounts(email);
CREATE INDEX idx_user_accounts_created_at ON user_accounts(created_at);
```

---

#### 3.2.3 Testing Strategy (TDD - Test-Driven Development)

**The Red-Green-Refactor Cycle**

```
1. RED: Write a failing test
   - Define desired behavior
   - Test should be specific, testable
   
2. GREEN: Write minimal code to pass test
   - Do NOT over-engineer
   - Focus only on passing the test
   
3. REFACTOR: Improve code without breaking test
   - Extract functions
   - Remove duplication (DRY principle)
   - Improve naming and readability
```

**Test File Structure**

```typescript
// src/lib/utils.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { calculateDiscount } from './utils';

describe('calculateDiscount', () => {
  describe('with valid percentage', () => {
    it('should return correct discounted price', () => {
      const result = calculateDiscount(100, 20); // $100, 20% off
      expect(result).toBe(80);
    });

    it('should handle edge case of 0%', () => {
      const result = calculateDiscount(100, 0);
      expect(result).toBe(100);
    });
  });

  describe('with invalid input', () => {
    it('should throw error for negative price', () => {
      expect(() => calculateDiscount(-100, 20)).toThrow('Price must be positive');
    });

    it('should throw error for percentage > 100', () => {
      expect(() => calculateDiscount(100, 150)).toThrow('Percentage cannot exceed 100');
    });
  });
});
```

**Test Coverage Requirements**

```
MINIMUM TARGETS (by path):
- Critical business logic: 100% coverage
- UI components: 80% coverage (focus on interactions, not implementation)
- Utility functions: 95% coverage
- API endpoints: 90% coverage
- Overall: 80%+ code coverage

CRITICAL PATHS (100% coverage required):
- Authentication flows
- Payment processing
- Data validation
- Security-related functions
- Permission checks
```

**Testing Pyramid & Examples**

```
                End-to-End (5%)
        Integration Tests (20%)
    Unit Tests (75%)

Unit Tests (Run < 100ms):
- Math functions
- String utilities
- Input validation
- Pure functions

Integration Tests (Run 500ms - 2s):
- API client calls (mocked responses)
- Database queries (test database)
- Complex workflows

E2E Tests (Run > 2s each):
- Full user journey (login → action → logout)
- Cross-browser testing
- Real API calls
- Real database (snapshot, then rollback)
```

**Mock External Services (Never Hit Real APIs)**

```typescript
// src/lib/__mocks__/api.ts
import { vi } from 'vitest';

export const mockGetUser = vi.fn(async (id: string) => ({
  id,
  name: 'Test User',
  email: 'test@example.com',
}));

export const mockSendEmail = vi.fn(async (email: string) => ({
  success: true,
  messageId: 'msg-123',
}));

// In tests:
import { mockGetUser } from './lib/__mocks__/api';

it('should fetch user data', async () => {
  mockGetUser.mockResolvedValue({ id: '1', name: 'John' });
  const user = await getUser('1');
  expect(user.name).toBe('John');
});
```

---

#### 3.2.4 Security Implementation (Built-In, Not Bolted-On)

**Authentication & Authorization**

```typescript
// Backend: JWT with RS256 (public/private key signing)
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { format: 'pem' },
  publicKeyEncoding: { format: 'pem' },
});

const createToken = (userId: string) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    privateKey,
    { algorithm: 'RS256', expiresIn: '24h' }
  );
};

const verifyToken = (token: string) => {
  return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
};

// Frontend: Store in HTTP-only cookie (not localStorage)
// Never send tokens in localStorage (vulnerable to XSS)
```

**Input Validation & Sanitization**

```typescript
// Use zod for runtime validation
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});

// Validate on BOTH frontend and backend
const validateUser = (data: unknown) => {
  try {
    return UserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors);
    }
    throw error;
  }
};

// NEVER trust client input
// ALWAYS validate and sanitize
// Use parameterized queries (prevent SQL injection)
const query = 'SELECT * FROM users WHERE email = $1';
db.query(query, [email]); // ✅ Safe
// NOT: `SELECT * FROM users WHERE email = '${email}'`; ❌ SQL injection vulnerability
```

**Security Headers**

```typescript
// Next.js middleware
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();

  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://trusted-cdn.com; style-src 'self' 'unsafe-inline'"
  );

  // Enforce HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}
```

**Secrets Management (NEVER hardcode)**

```bash
# .env.local (git-ignored)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=your-secret-key
API_KEY=sk-...

# Access in code
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL not set');
```

---

#### 3.2.5 Error Handling & Logging

**Structured Error Handling**

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

// In API route
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validated = UserSchema.parse(data);
    // ... process
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Structured Logging**

```typescript
// src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Usage
logger.info('User logged in', { userId: '123', timestamp: new Date() });
logger.error('Payment failed', { error: err.message, orderId: '456' });
```

---

### 3.3 Responsive Design Implementation

**Mobile-First Approach (Design for smallest screen first)**

```tsx
// ✅ Correct: Start with mobile styles, then enhance
const Dashboard: React.FC = () => {
  return (
    <div className="
      grid grid-cols-1 gap-4          // Mobile: 1 column
      md:grid-cols-2 gap-6             // Tablet: 2 columns
      lg:grid-cols-3 gap-8             // Desktop: 3 columns
      xl:grid-cols-4                   // Large: 4 columns
    ">
      {/* Cards */}
    </div>
  );
};

// ❌ Avoid: Desktop-first (outdated approach)
// .dashboard { display: grid; grid-template-columns: repeat(4, 1fr); }
// @media (max-width: 1024px) { ... }
```

**Responsive Testing Checklist**

```
MUST TEST ON ALL DEVICES:

Mobile (375px - 480px):
  ☐ iPhone 12 mini
  ☐ Samsung Galaxy A12
  ☐ Portrait & landscape

Tablet (768px - 1024px):
  ☐ iPad (9.7")
  ☐ iPad Pro (11")
  ☐ Portrait & landscape

Laptop (1280px - 1920px):
  ☐ 13" MacBook
  ☐ 15" MacBook Pro
  ☐ 27" iMac

Ultra-wide (> 1920px):
  ☐ 34" ultrawide monitors
  ☐ 5K iMac

BROWSERS:
  ☐ Chrome (latest 2 versions)
  ☐ Firefox (latest 2 versions)
  ☐ Safari (latest 2 versions)
  ☐ Edge (latest version)

FUNCTIONALITY:
  ☐ Touch interactions work (tap, scroll, pinch-zoom)
  ☐ No horizontal scrolling on mobile
  ☐ Buttons/links are 44px+ for touch targets
  ☐ Text is readable without zoom
  ☐ Images scale properly
  ☐ Forms are usable on mobile
  ☐ Navigation collapses to hamburger menu on mobile
  ☐ Performance is acceptable on 4G network

PERFORMANCE:
  ☐ LCP < 2.5s on 4G
  ☐ FID < 100ms
  ☐ CLS < 0.1
  ☐ Time to Interactive < 3.5s
```

---

### 3.4 Build, Lint, Test Cycle

**EVERY COMMIT MUST PASS ALL CHECKS:**

```bash
# Before committing:
$ pnpm lint       # ESLint + Prettier - MUST pass with 0 errors/warnings
$ pnpm type-check # TypeScript - MUST have no type errors
$ pnpm test       # Jest/Vitest - MUST have 80%+ coverage, all passing
$ pnpm build      # Build output - MUST complete without errors
$ pnpm test:e2e   # E2E tests - MUST pass on all critical paths

# If ANY step fails:
1. FIX THE ROOT CAUSE (don't ignore warnings)
2. Re-run all steps
3. Only commit when ALL pass
```

**Automated Quality Gates (CI/CD)**

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      # Lint
      - run: pnpm lint --max-warnings 0
        name: ESLint (0 warnings allowed)
      
      # Type check
      - run: pnpm type-check
        name: TypeScript strict mode
      
      # Tests
      - run: pnpm test --coverage
        name: Unit tests with coverage
      
      # Build
      - run: pnpm build
        name: Production build
      
      # Security
      - run: npm audit --audit-level=moderate
        name: Dependency audit
      
      # Performance
      - run: pnpm build && pnpm lighthouse
        name: Lighthouse audit

  # PR will be blocked if ANY job fails
  status-check:
    needs: quality
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Check job status
        if: needs.quality.result != 'success'
        run: exit 1
```

---

## PART IV: TECHNICAL DOCUMENTATION

### 4.1 Living Technical Documentation

**Updated after EVERY completion/milestone:**

```markdown
# [PROJECT_NAME] Technical Documentation
**Last Updated: [ISO Date] | Version: [X.Y.Z]**

## 1. Project Status
- ✅ Phase: [Planning | Development | Testing | Deployment]
- ✅ Completion: [X]%
- ✅ Last Deploy: [Date]
- ✅ Health: [Green | Yellow | Red]

## 2. Architecture Overview

### Current System Diagram
[ASCII or Mermaid]

### Recent Changes
- [Date]: [What changed and why]
- [Date]: [What changed and why]

## 3. Component Inventory

### Frontend Components
| Component | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| UserProfile | ✅ Complete | 95% | Responsive on all devices |
| Dashboard | 🔄 In Progress (80%) | 75% | Missing mobile optimization |
| AuthForm | ✅ Complete | 98% | Security tested |

### Backend Services
| Service | Status | Uptime | Last Deploy |
|---------|--------|--------|-------------|
| Auth API | ✅ Stable | 99.95% | 2025-11-28 10:30 |
| User Service | ✅ Stable | 99.99% | 2025-11-25 15:00 |
| Payment API | ✅ Stable | 99.90% | 2025-11-20 09:15 |

## 4. Database Schema

### Tables (Current Version)
- **users**: [columns, indexes, constraints]
- **sessions**: [columns, indexes, constraints]
- **audit_logs**: [columns, indexes, constraints]

### Recent Schema Changes
- [Date]: Added is_deleted boolean to soft-delete users
- [Date]: Added index on audit_logs.created_at for performance

## 5. API Endpoints (v1.0)

### Authentication
- `POST /api/auth/register` - [status, response time]
- `POST /api/auth/login` - [status, response time]
- `POST /api/auth/logout` - [status, response time]

[All endpoints with status]

## 6. Known Issues & Todos

### Critical (Must fix before release)
- [ ] Memory leak in WebSocket connection (affects 5% of users)
- [ ] Email verification timeout (API gateway issue)

### High Priority (Fix within 2 weeks)
- [ ] Dashboard charts missing tooltip on mobile
- [ ] Search API slow on large datasets (> 10k records)

### Medium Priority (Fix within 1 month)
- [ ] Dark mode not persisting across page reloads
- [ ] Accessibility: Color contrast on secondary buttons

### Low Priority (Fix when time permits)
- [ ] Improve error message copy
- [ ] Add analytics tracking

## 7. Performance Metrics

### Web Vitals (Last 7 days)
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| FCP | 1.2s | < 1.5s | ✅ Pass |
| LCP | 2.3s | < 2.5s | ✅ Pass |
| FID | 85ms | < 100ms | ✅ Pass |
| CLS | 0.08 | < 0.1 | ✅ Pass |

### API Response Times (Last 24h)
- GET /api/users: 120ms avg
- POST /api/auth/login: 250ms avg
- GET /api/dashboard: 450ms avg

## 8. Test Coverage Report

| Module | Coverage | Status |
|--------|----------|--------|
| auth | 98% | ✅ Excellent |
| users | 85% | ✅ Good |
| payments | 92% | ✅ Excellent |
| utils | 78% | ⚠️ Below target (need 85%) |

## 9. Deployment Timeline

### Production Deployments (Last 10)
| Date | Version | Changes | Status |
|------|---------|---------|--------|
| 2025-11-28 | 1.2.0 | Fixed email verification, improved search | ✅ Success |
| 2025-11-25 | 1.1.9 | Hotfix for payment webhook | ✅ Success |
| 2025-11-20 | 1.1.8 | Dashboard performance improvements | ✅ Success |

## 10. Security Audit Trail

### Last Security Review
- Date: 2025-11-20
- Results: 0 critical, 2 high, 5 medium vulnerabilities
- Remediation: In progress
- Next review: 2025-12-20

### Secrets Rotation
- JWT secret: 2025-11-28 (rotated)
- Database password: 2025-10-28 (due for rotation 2025-12-28)
- API keys: All rotated 2025-11-15

## 11. Team & Responsibilities

| Role | Owner | Contact |
|------|-------|---------|
| Architecture | [Name] | [Slack] |
| Frontend Lead | [Name] | [Slack] |
| Backend Lead | [Name] | [Slack] |
| DevOps/Infrastructure | [Name] | [Slack] |
| Security | [Name] | [Slack] |

## 12. Quick Reference

### Environment URLs
- Local: http://localhost:3000
- Staging: https://staging.example.com
- Production: https://app.example.com

### Useful Commands
```bash
# Local development
pnpm dev           # Start dev server
pnpm test:watch    # Run tests in watch mode
pnpm lint:fix      # Fix all lint issues

# Deployment
pnpm build         # Production build
docker build ...   # Build image
kubectl apply ...  # Deploy to Kubernetes
```

### Incident Response
1. Severity 1 (outage): On-call engineer → #incidents → escalate if needed
2. Severity 2 (degradation): Team lead → investigation → communicate status
3. Post-mortem required for all incidents

---
```

---

### 4.2 File Backup & Change Tracking

**Maintain comprehensive change history:**

```
PROJECT_ROOT/
├── .backups/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserProfile.tsx.backup.2025-11-28T143045Z
│   │   │   ├── UserProfile.tsx.backup.2025-11-28T150230Z
│   │   └── lib/
│   │       └── api.ts.backup.2025-11-28T152100Z
│   └── .gitignore (contains: *.backup.* so not committed)
├── CHANGELOG.md (committed, tracks all changes)
└── .infrastructure/
    └── DATABASE_MIGRATIONS/ (version-controlled)
```

**CHANGELOG.md Template**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-11-28

### Added
- Email verification flow for new user registration
- Dark mode toggle (user preference persisted)
- API rate limiting (100 req/min per IP)

### Changed
- Refactored user authentication to use RS256 JWT signing
- Updated database schema with soft-delete support
- Improved search performance with full-text indexes

### Fixed
- Memory leak in WebSocket connections (GitHub issue #123)
- Email verification email not sending in some cases
- Dashboard chart tooltip not showing on mobile

### Security
- Upgraded dependencies to patch 3 security vulnerabilities
- Implemented CORS policy restrictions
- Added Content Security Policy headers

### Deprecated
- Old JWT HS256 signing (migrate to RS256 by 2025-12-31)

### Removed
- Legacy user preferences table (migrated to new schema)

---

## [1.1.9] - 2025-11-25 (Hotfix)

### Fixed
- Payment webhook signature verification failing (GitHub issue #119)
- Database connection pool exhaustion under load

---

## [1.1.8] - 2025-11-20

### Performance
- Optimized dashboard queries, 40% faster rendering
- Implemented Redis caching for frequently accessed data
- Reduced bundle size by 15% through code splitting

---
```

---

## PART V: QUALITY & VERIFICATION

### 5.1 The Definition of Done Checklist

**A task is ONLY done when ALL items are checked:**

```
✅ CODE QUALITY
  ☐ Code follows style guide (ESLint passes, 0 warnings)
  ☐ Type checking passes (TypeScript strict mode, no any)
  ☐ Code is DRY (no copy-paste, functions extracted)
  ☐ Comments explain "why", not "what" (code should explain "what")
  ☐ Function length < 50 lines (usually < 20)
  ☐ Cyclomatic complexity < 10
  ☐ No magic numbers (use named constants)
  ☐ Naming is clear and follows conventions

✅ TESTING
  ☐ Unit tests written (test-first approach)
  ☐ Unit test coverage > 80% (> 90% for critical paths)
  ☐ Integration tests written for API calls
  ☐ Edge cases tested (null, empty, invalid, boundary values)
  ☐ Mocks are used for external dependencies
  ☐ All tests pass locally
  ☐ All tests pass in CI/CD pipeline

✅ SECURITY
  ☐ No hardcoded secrets
  ☐ Input validation on all user inputs (frontend AND backend)
  ☐ Output escaping for XSS prevention
  ☐ SQL injection prevention (parameterized queries)
  ☐ Authentication/authorization checks in place
  ☐ CORS headers configured (not overly permissive)
  ☐ No exposed error details to users
  ☐ Security scanning passed (npm audit, Snyk, SonarQube)

✅ PERFORMANCE
  ☐ Page load time acceptable for target user base
  ☐ No N+1 query problems
  ☐ Caching implemented where appropriate
  ☐ Bundle size optimal (< 250kb gzipped)
  ☐ Images optimized (WebP format, responsive sizes)
  ☐ Web Vitals meet targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
  ☐ No console errors or warnings in production

✅ RESPONSIVE DESIGN
  ☐ Tested on mobile (375px width)
  ☐ Tested on tablet (768px width)
  ☐ Tested on desktop (1280px width)
  ☐ Tested on ultra-wide (1920px+ width)
  ☐ Touch interactions work properly
  ☐ No horizontal scroll on any breakpoint
  ☐ All buttons/links are 44px+ for touch
  ☐ Orientation changes work (portrait/landscape)

✅ ACCESSIBILITY
  ☐ WCAG 2.1 AA compliant
  ☐ Keyboard navigation works (Tab, Enter, Escape)
  ☐ Color contrast >= 4.5:1 for normal text, 3:1 for large
  ☐ Images have alt text
  ☐ Form labels properly associated
  ☐ ARIA attributes used where needed
  ☐ No keyboard traps
  ☐ Screen reader tested (NVDA, VoiceOver)

✅ BUILD & DEPLOYMENT
  ☐ Production build completes without errors
  ☐ No deprecated dependencies
  ☐ Docker image builds successfully
  ☐ Environment variables documented
  ☐ Database migrations applied successfully
  ☐ Feature can be deployed independently (feature flag if needed)
  ☐ Deployment to staging successful
  ☐ Health checks pass on staging

✅ DOCUMENTATION
  ☐ Code comments for "why" decisions
  ☐ API endpoints documented (request/response)
  ☐ Database schema changes documented
  ☐ README updated if needed
  ☐ CHANGELOG entry added
  ☐ Architecture Decision Record (ADR) created if major decision
  ☐ Team notified of significant changes

✅ PEER REVIEW
  ☐ Code reviewed by at least 1 peer
  ☐ Reviewer approved changes
  ☐ Feedback incorporated or discussed
  ☐ No hardcoding, temporary fixes, or commented code
  ☐ Change addresses original requirement completely

✅ MANUAL TESTING
  ☐ Happy path tested manually (5 minutes)
  ☐ Error scenarios tested (invalid input, network failure)
  ☐ Browser tested (Chrome, Firefox, Safari, Edge)
  ☐ Device tested (mobile, tablet, desktop)
  ☐ No regression in existing features

✅ VERSION CONTROL
  ☐ Commit message is clear and follows convention
  ☐ Commit history is clean (no "fix fix" commits)
  ☐ Branch is up-to-date with main/develop
  ☐ PR ready for merge
```

---

### 5.2 Never Ignore Errors or Warnings

**Policy: Root Cause Analysis for Every Error**

```
IF linter warning appears:
  INVESTIGATE why the rule exists
  FIX the code to comply with the rule
  NEVER suppress the warning without deep understanding
  
IF test fails:
  Debug the test first
  Understand the failure reason
  Fix either the code or the test (not both)
  
IF TypeScript type error appears:
  NEVER use 'any' to silence it
  Understand the type mismatch
  Fix the root cause (refactor if needed)
  
IF performance metric degrades:
  Profile the code (Chrome DevTools)
  Identify the bottleneck
  Implement optimization
  Verify with before/after metrics
  
IF security scan finds vulnerability:
  STOP immediately
  Understand the vulnerability
  Implement fix
  Verify fix with repeat scan
  Update CHANGELOG

NEVER:
❌ Use eslint-disable comments
❌ Add // @ts-ignore
❌ Suppress TypeScript errors
❌ TODO comments without dates and owners
❌ Commit with console.log statements
```

---

### 5.3 Local Testing Before Deployment

**Test locally simulating production exactly:**

```bash
# 1. Build for production
npm run build
# Check: No errors, all assets generated

# 2. Test production build locally
NODE_ENV=production npm start
# Check: No errors, page loads

# 3. Lint & type check
npm run lint --max-warnings 0
npm run type-check
# Check: Zero errors and warnings

# 4. Run full test suite
npm run test -- --coverage
# Check: All tests pass, coverage > 80%

# 5. Performance check
npm run build && npm run lighthouse
# Check: Lighthouse score > 90 on all metrics

# 6. Security scan
npm audit --audit-level=moderate
npm run security:scan
# Check: No medium/high vulnerabilities found

# 7. Test on multiple devices/browsers locally
# Use BrowserStack or emulators

# 8. Database migrations
npm run db:migrate
# Check: All migrations apply without errors

# 9. Seed test data
npm run db:seed:test
# Check: Test data is consistent

# 10. Automated E2E tests
npm run test:e2e
# Check: All critical user journeys pass
```

---

## PART VI: MEMORY & STATE MANAGEMENT

### 6.1 Never Lose Context

**The AI must maintain complete knowledge of:**

1. **Current Project State**
   - What has been completed (with dates)
   - What is in progress (% completion, current task)
   - What is pending (ordered by priority)
   - Current code state (no untracked changes)

2. **File Change History**
   - What files were modified and when
   - Why they were modified (reason/task)
   - Backup copies of previous versions
   - All changes tracked in .backups and CHANGELOG

3. **Technical Decisions Made**
   - Why tech stack X was chosen
   - Why pattern Y was implemented
   - Trade-offs considered
   - Links to research/documentation

4. **Known Issues**
   - What bugs exist
   - Why they weren't fixed yet
   - When they should be addressed
   - Workarounds in place

5. **Performance Baselines**
   - Initial metrics (FCP, LCP, bundle size)
   - Current metrics
   - Targets
   - Degradations to investigate

**Implementation:**
```markdown
# AI Memory Log
**Session Start: [ISO Timestamp]**
**Current Phase: [Phase Name]**
**Last Completed: [Task ID] at [Time]**

## Recently Modified Files (Last 2 hours)
- src/components/UserProfile.tsx (AUTH-042: Add password reset)
- src/lib/api.ts (DASH-018: Add caching layer)

## Current Task (In Progress: AUTH-043 at 60%)
[Task details, what's been done, what remains]

## Key Decisions Made Today
1. JWT RS256 signing chosen over HS256 for better security
2. Redis caching added for dashboard queries (40% perf improvement)

## Known Issues
1. Memory leak in WebSocket (affects 5% of users, critical)
2. Email delay >2s (under investigation, medium)

## Performance Snapshot
- FCP: 1.2s (target: 1.5s) ✅
- LCP: 2.3s (target: 2.5s) ✅
- Bundle: 185kb (target: 200kb) ✅
```

---

## PART VII: RESEARCH & VERIFICATION

### 7.1 Always Verify Before Deciding

**Decision Research Checklist:**

```
FOR: Choosing a library/framework
  ☐ Check NPM package: downloads/week, last update date
  ☐ Read GitHub: stars, open issues, commit frequency
  ☐ Security: any recent CVEs?
  ☐ Community: active StackOverflow/GitHub discussions?
  ☐ Alternatives: compare with 2-3 other options
  ☐ Maturity: v1.0+ or pre-release?
  ☐ License: MIT/Apache/GPL compatibility?
  ☐ Documentation: adequate and recent?

FOR: Architecture decision
  ☐ Research pros/cons of options
  ☐ Review 3+ case studies (similar projects)
  ☐ Identify trade-offs explicitly
  ☐ Document decision in ADR (Architecture Decision Record)
  ☐ Get team consensus (not unilateral decision)

FOR: Performance optimization
  ☐ Measure baseline first
  ☐ Profile to identify bottleneck
  ☐ Research solution options
  ☐ Implement & measure improvement
  ☐ Document what changed and why

FOR: Security implementation
  ☐ Consult OWASP guidelines
  ☐ Research CVE history for pattern
  ☐ Read authentication/encryption standards
  ☐ Implement + test thoroughly
  ☐ Get security review

FOR: API design
  ☐ Follow RESTful principles (or GraphQL standards)
  ☐ Version the API (v1, v2)
  ☐ Document all endpoints (Swagger/OpenAPI)
  ☐ Test backwards compatibility
```

---

## PART VIII: INCIDENT RESPONSE

### 8.1 When Something Goes Wrong

**Never hide issues. Document and escalate.**

```
SEVERITY 1 - CRITICAL (System Down)
  Immediate Actions:
  1. Alert on-call team
  2. Start incident response
  3. Document timeline (start time, what's affected, user impact)
  4. Rollback if recent deployment
  5. Post status updates every 15 min
  
  After Resolution:
  1. Root cause analysis (within 24h)
  2. Action items to prevent recurrence
  3. Post-mortem meeting (within 48h)
  4. Update documentation

SEVERITY 2 - HIGH (Partial Degradation)
  Actions:
  1. Notify team
  2. Investigate root cause
  3. Plan fix (today if possible)
  4. Communicate status to stakeholders
  5. Document in CHANGELOG
  
SEVERITY 3 - MEDIUM (Bug, Feature Broken)
  Actions:
  1. Log issue with reproduction steps
  2. Prioritize in backlog
  3. Schedule for next sprint
  4. Update known issues list
```

---

## CONCLUSION

This framework positions AI as a **technical partner and architect**, not merely an executor. Success requires:

1. **Thorough Planning Before Coding** - No shortcuts
2. **Research-Backed Decisions** - Always verify
3. **Quality Over Speed** - Never compromise
4. **Complete Documentation** - Always updated
5. **Security & Accessibility** - Built-in, not bolted-on
6. **Comprehensive Testing** - TDD approach
7. **Responsive Across All Devices** - Mobile-first
8. **Continuous Improvement** - Root cause analysis
9. **Memory & Accountability** - Never lose context
10. **Professional Standards** - Enterprise-grade always

**Every line of code is an investment in the future. Code as if you'll maintain it for 10 years.**

---

**Document Version History:**
- v1.0 - Initial comprehensive framework (2025-11-30)
