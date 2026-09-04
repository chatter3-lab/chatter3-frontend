// Chatter3 Moat Strategy Assessment
// Based on Gokul Rajaram's 8-Moats Framework for Software Defensibility

export const MOATS = {
  data: {
    name: 'Data',
    description: 'Proprietary data assets that compound over time',
    currentScore: 0.4,
    targetScore: 0.8,
    improvements: [
      'Track learning patterns and conversation quality metrics',
      'Build vocabulary difficulty models based on user performance',
      'Create pronunciation scoring data from audio analysis',
      'Develop conversation flow quality metrics',
      'Store cultural context and topic preference data'
    ]
  },
  workflow: {
    name: 'Workflow',
    description: 'Deep embedding in daily routines',
    currentScore: 0.3,
    targetScore: 0.6,
    improvements: [
      'Daily streaks create habit formation',
      'FP/RP reward system integrated into learning',
      'Profile-based learning path personalization',
      'Achievement system drives engagement',
      'Notifications for streak maintenance'
    ]
  },
  regulatory: {
    name: 'Regulatory',
    description: 'Licenses, compliance, certifications',
    currentScore: 0.1,
    targetScore: 0.3,
    improvements: [
      'GDPR compliance (already implemented)',
      'COPPA compliance for under-13 users',
      'Education certifications (future)',
      'Privacy Shield certification (future)'
    ]
  },
  distribution: {
    name: 'Distribution',
    description: 'Proprietary, exclusive sales channels',
    currentScore: 0.2,
    targetScore: 0.5,
    improvements: [
      'SEO-optimized landing pages (8 languages)',
      'Blog content marketing strategy',
      'Referral system with rewards',
      'Huawei AppGallery distribution',
      'Language-specific communities'
    ]
  },
  ecosystem: {
    name: 'Ecosystem',
    description: 'Third-party developers building on platform',
    currentScore: 0.0,
    targetScore: 0.2,
    improvements: [
      'API for language schools (future)',
      'Integration with language learning tools',
      'Content creator partnerships',
      'Teacher/instructor dashboard (future)'
    ]
  },
  network: {
    name: 'Network',
    description: 'Marketplace density and reputational history',
    currentScore: 0.4,
    targetScore: 0.7,
    improvements: [
      'Growing user base increases matching quality',
      'Rating system builds trust',
      'Achievement system encourages quality participation',
      'Friend system builds social connections',
      'Streak system indicates reliable partners'
    ]
  },
  physicalInfrastructure: {
    name: 'Physical Infrastructure',
    description: 'Physical assets that are hard to displace',
    currentScore: 0.0,
    targetScore: 0.0,
    improvements: [
      'Not applicable for pure software product',
      'Consider partnerships with language schools (future)'
    ]
  },
  scale: {
    name: 'Scale',
    description: 'Cost advantages from operational size',
    currentScore: 0.1,
    targetScore: 0.3,
    improvements: [
      'Infrastructure cost optimization',
      'AI-powered matching reduces manual work',
      'Automated content moderation',
      'Shared language learning resources'
    ]
  }
};

export function calculateTotalMoatScore() {
  return Object.values(MOATS).reduce((sum, moat) => sum + moat.currentScore, 0);
}

export function getMoatStatus() {
  const total = calculateTotalMoatScore();
  if (total >= 4) return 'highly_defensible';
  if (total >= 2) return 'moderately_defensible';
  return 'vulnerable';
}

export function identifyPriorityImprovements() {
  return Object.entries(MOATS)
    .filter(([_, moat]) => moat.currentScore < moat.targetScore)
    .sort((a, b) => (b[1].targetScore - b[1].currentScore) - (a[1].targetScore - a[1].currentScore))
    .slice(0, 3);
}