import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Demo2026!', 12)

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@spacefunding.us' },
    update: {},
    create: {
      email: 'admin@spacefunding.us',
      passwordHash: password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // BD Partner
  const bd = await prisma.user.upsert({
    where: { email: 'bd@spacefunding.us' },
    update: {},
    create: {
      email: 'bd@spacefunding.us',
      passwordHash: password,
      firstName: 'Compliance',
      lastName: 'Officer',
      role: 'BD_PARTNER',
      status: 'ACTIVE',
    },
  })
  await prisma.bDPartnerProfile.upsert({
    where: { userId: bd.id },
    update: {},
    create: { userId: bd.id, firmName: 'SpaceFunding BD LLC', crdNumber: '12345', finraId: 'BD-001' },
  })

  // Issuers
  const issuer1 = await prisma.user.upsert({
    where: { email: 'issuer@demo.com' },
    update: {},
    create: {
      email: 'issuer@demo.com',
      passwordHash: password,
      firstName: 'Alex',
      lastName: 'Chen',
      role: 'ISSUER',
      status: 'ACTIVE',
    },
  })
  const issuer1Profile = await prisma.issuerProfile.upsert({
    where: { userId: issuer1.id },
    update: {},
    create: { userId: issuer1.id, companyName: 'NovaTech AI', website: 'https://novatech.ai', industry: 'AI/ML', founded: 2021 },
  })

  const issuer2 = await prisma.user.upsert({
    where: { email: 'sarah@greenleaf.io' },
    update: {},
    create: {
      email: 'sarah@greenleaf.io',
      passwordHash: password,
      firstName: 'Sarah',
      lastName: 'Green',
      role: 'ISSUER',
      status: 'ACTIVE',
    },
  })
  const issuer2Profile = await prisma.issuerProfile.upsert({
    where: { userId: issuer2.id },
    update: {},
    create: { userId: issuer2.id, companyName: 'GreenLeaf Energy', website: 'https://greenleaf.io', industry: 'CleanTech', founded: 2020 },
  })

  const issuer3 = await prisma.user.upsert({
    where: { email: 'marcus@nexgen.co' },
    update: {},
    create: {
      email: 'marcus@nexgen.co',
      passwordHash: password,
      firstName: 'Marcus',
      lastName: 'Johnson',
      role: 'ISSUER',
      status: 'ACTIVE',
    },
  })
  const issuer3Profile = await prisma.issuerProfile.upsert({
    where: { userId: issuer3.id },
    update: {},
    create: { userId: issuer3.id, companyName: 'NexGen Health', website: 'https://nexgen.co', industry: 'HealthTech', founded: 2022 },
  })

  // Investors
  const investor1 = await prisma.user.upsert({
    where: { email: 'investor@demo.com' },
    update: {},
    create: {
      email: 'investor@demo.com',
      passwordHash: password,
      firstName: 'Jordan',
      lastName: 'Rivera',
      role: 'INVESTOR',
      status: 'ACTIVE',
    },
  })
  await prisma.investorProfile.upsert({
    where: { userId: investor1.id },
    update: {},
    create: {
      userId: investor1.id,
      kycStatus: 'APPROVED',
      accreditationStatus: 'VERIFIED',
      amlRiskLevel: 'LOW',
      onboardingCompleted: true,
      annualIncomeCents: 25000000,
      netWorthCents: 150000000,
    },
  })

  const investor2 = await prisma.user.upsert({
    where: { email: 'alice@investor.com' },
    update: {},
    create: {
      email: 'alice@investor.com',
      passwordHash: password,
      firstName: 'Alice',
      lastName: 'Wang',
      role: 'INVESTOR',
      status: 'ACTIVE',
    },
  })
  await prisma.investorProfile.upsert({
    where: { userId: investor2.id },
    update: {},
    create: {
      userId: investor2.id,
      kycStatus: 'APPROVED',
      accreditationStatus: 'SELF_CERTIFIED',
      amlRiskLevel: 'LOW',
      onboardingCompleted: true,
      annualIncomeCents: 8000000,
      netWorthCents: 5000000,
    },
  })

  const investor3 = await prisma.user.upsert({
    where: { email: 'bob@invest.com' },
    update: {},
    create: {
      email: 'bob@invest.com',
      passwordHash: password,
      firstName: 'Bob',
      lastName: 'Martinez',
      role: 'INVESTOR',
      status: 'ACTIVE',
    },
  })
  await prisma.investorProfile.upsert({
    where: { userId: investor3.id },
    update: {},
    create: { userId: investor3.id, kycStatus: 'NOT_STARTED', onboardingCompleted: false },
  })

  // Offerings
  const closeDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

  await prisma.offering.upsert({
    where: { slug: 'novatech-ai-series-a' },
    update: {},
    create: {
      slug: 'novatech-ai-series-a',
      issuerId: issuer1Profile.id,
      title: 'NovaTech AI — Series A',
      type: 'REG_CF',
      status: 'LIVE',
      securityType: 'EQUITY',
      shortDescription: 'AI-powered compliance automation for financial services. Reducing compliance costs by 70% for mid-market banks.',
      longDescription: 'NovaTech AI is building the operating system for financial compliance. Our platform uses LLMs and computer vision to automate AML transaction monitoring, KYC document verification, and regulatory reporting.\n\nWe serve 12 mid-market banks and credit unions today with $2.4M ARR growing 40% MoM. This Reg CF raise funds 18 months of runway to reach $10M ARR and Series B readiness.',
      minimumInvestmentCents: 50000,
      maximumRaiseCents: 500000000,
      minimumRaiseCents: 100000000,
      totalRaisedCents: 187500000,
      totalInvestors: 423,
      pricePerUnitCents: 1000,
      valuationCapCents: 1200000000,
      closeDate,
    },
  })

  await prisma.offering.upsert({
    where: { slug: 'greenleaf-energy-growth' },
    update: {},
    create: {
      slug: 'greenleaf-energy-growth',
      issuerId: issuer2Profile.id,
      title: 'GreenLeaf Energy — Growth Round',
      type: 'REG_A_PLUS',
      status: 'LIVE',
      securityType: 'EQUITY',
      shortDescription: 'Residential solar + battery storage, delivered as a subscription. 8,000 homes installed across California and Texas.',
      longDescription: 'GreenLeaf Energy makes clean energy accessible through our Solar-as-a-Service model. Homeowners get solar + Powerwall installed for $0 down and pay a monthly subscription less than their current electricity bill.\n\nWith 8,000 active subscribers generating $14M ARR, we are raising under Reg A+ to fund expansion into 12 additional states and deploy our proprietary energy management AI.',
      minimumInvestmentCents: 100000,
      maximumRaiseCents: 7500000000,
      minimumRaiseCents: 1000000000,
      totalRaisedCents: 2100000000,
      totalInvestors: 1847,
      pricePerUnitCents: 1000,
      closeDate,
    },
  })

  await prisma.offering.upsert({
    where: { slug: 'nexgen-health-506c' },
    update: {},
    create: {
      slug: 'nexgen-health-506c',
      issuerId: issuer3Profile.id,
      title: 'NexGen Health — Reg D 506(c)',
      type: 'REG_D_506C',
      status: 'LIVE',
      securityType: 'CONVERTIBLE_NOTE',
      shortDescription: 'Remote patient monitoring platform with FDA-cleared wearables. $5M ARR, Series B targeting Q3 2026.',
      longDescription: 'NexGen Health\'s RPM platform pairs FDA-cleared wearables with an AI care coordination layer that reduces hospital readmissions by 34%. We have 45 health system contracts and $5M ARR.\n\nThis convertible note round (20% discount, $40M cap) bridges to our Series B led by a top-tier healthcare VC.',
      minimumInvestmentCents: 2500000,
      maximumRaiseCents: 500000000000,
      minimumRaiseCents: 100000000,
      totalRaisedCents: 87500000,
      totalInvestors: 12,
      pricePerUnitCents: 100,
      valuationCapCents: 4000000000,
      discountRate: 0.20,
      closeDate,
    },
  })

  console.log('✅ Seed complete. Login with any demo account using password: Demo2026!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
