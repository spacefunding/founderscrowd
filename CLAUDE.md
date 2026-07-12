# SpaceFunding — Capital Markets Platform

## Project Overview
US-regulated capital markets platform supporting:
- **Reg CF** — up to $5M, general public
- **Reg A+** — up to $75M, general public
- **Reg D 506(c)** — unlimited, verified accredited investors only
- **Reg D 506(b)** — unlimited, sophisticated investors (NOT shown in public search)

Works with a licensed FINRA broker-dealer partner. All offerings require BD approval before going live.

## Tech Stack
- **Framework**: Next.js 15 App Router, TypeScript strict
- **Database**: PostgreSQL via Prisma 7 ORM
- **Auth**: NextAuth v5 (beta), JWT strategy
- **Styling**: Tailwind CSS, brand color #5271ff
- **Validation**: Zod v4 (use `.issues` not `.errors`)

## Critical Compliance Rules

1. **Reg CF investment limits** must be recalculated server-side on every investment using `calculateRegCFLimit(annualIncomeCents, netWorthCents)` in `src/lib/utils.ts`
2. **Reg D 506(c)** requires `accreditationStatus === 'VERIFIED'` — never self-cert alone
3. **Reg D 506(b)** must NOT appear in public search results (excluded from `/api/offerings` GET)
4. **All monetary values** stored as integer cents (BigInt in Prisma schema) — never floats
5. **All PII** must be encrypted (SSN, DOB, EIN) — fields named `*Encrypted`
6. **No secrets** in `NEXT_PUBLIC_` environment variables

## Architecture Notes

### Database
- Prisma 7 config: `prisma.config.ts` (datasource URL there, not in schema.prisma)
- 25 models, 13 enums
- Monetary fields: BigInt in schema

### API Response Shape
```typescript
{ data: T, error: null } | { data: null, error: { code: string, message: string } }
```
Use `apiSuccess()` and `apiError()` from `src/lib/api.ts`

### Auth Roles
- `INVESTOR` — can browse and invest in offerings
- `ISSUER` — can create and manage their own offerings
- `BD_PARTNER` — compliance/approval role, FINRA broker-dealer
- `ADMIN` — platform administration

### Mock Integrations
Set `MOCK_INTEGRATIONS=true` and `MOCK_KYC=true` in `.env.local` to bypass real KYC/AML vendors (Persona, Sardine).

## Demo Accounts (password: Demo2026!)
| Role | Email |
|------|-------|
| Admin | admin@spacefunding.us |
| BD/Compliance | bd@spacefunding.us |
| Issuer | issuer@demo.com |
| Investor (KYC approved) | investor@demo.com |
| Investor (self-cert) | alice@investor.com |
| Investor (unverified) | bob@invest.com |

## Development Setup
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL
npx prisma migrate dev
npx prisma db seed
npm run dev
```
