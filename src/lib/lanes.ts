export type Lane = 'pulse' | 'business_impact' | 'tool_radar' | 'builder_lab';

export interface LaneConfig {
  id: Lane;
  label: string;
  shortDescription: string;
  question: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export const LANES: Record<Lane, LaneConfig> = {
  pulse: {
    id: 'pulse',
    label: 'Pulse',
    shortDescription: 'Broad AI developments, launches, funding, regulation, and major company moves.',
    question: 'What happened in AI?',
    color: 'hsl(var(--lane-pulse))',
    bgClass: 'bg-lane-pulse/10',
    textClass: 'text-lane-pulse',
  },
  business_impact: {
    id: 'business_impact',
    label: 'Business Impact',
    shortDescription: 'Enterprise AI, ROI, adoption, productivity, automation, and measurable value creation.',
    question: 'What matters for business and ROI?',
    color: 'hsl(var(--lane-business))',
    bgClass: 'bg-lane-business/10',
    textClass: 'text-lane-business',
  },
  tool_radar: {
    id: 'tool_radar',
    label: 'Tool Radar',
    shortDescription: 'New AI tools, apps, assistants, workflow tools, and products you can try now.',
    question: 'What AI tools can I use?',
    color: 'hsl(var(--lane-tools))',
    bgClass: 'bg-lane-tools/10',
    textClass: 'text-lane-tools',
  },
  builder_lab: {
    id: 'builder_lab',
    label: 'Builder Lab',
    shortDescription: 'APIs, SDKs, frameworks, agent tooling, open source, and developer workflows.',
    question: 'What can I build with and how?',
    color: 'hsl(var(--lane-builder))',
    bgClass: 'bg-lane-builder/10',
    textClass: 'text-lane-builder',
  },
};

export const LANE_ORDER: Lane[] = ['pulse', 'business_impact', 'tool_radar', 'builder_lab'];

export function getLaneBadgeClasses(lane: string): string {
  switch (lane) {
    case 'pulse': return 'bg-lane-pulse/10 text-lane-pulse border-lane-pulse/20';
    case 'business_impact': return 'bg-lane-business/10 text-lane-business border-lane-business/20';
    case 'tool_radar': return 'bg-lane-tools/10 text-lane-tools border-lane-tools/20';
    case 'builder_lab': return 'bg-lane-builder/10 text-lane-builder border-lane-builder/20';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getLaneLabel(lane: string): string {
  const config = LANES[lane as Lane];
  return config?.label ?? lane;
}
