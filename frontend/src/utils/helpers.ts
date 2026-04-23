export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function getBrandColor(brandInitial: string): string {
  const colors: Record<string, string> = {
    A: '#E53935', B: '#8E24AA', C: '#1E88E5', D: '#00897B',
    E: '#F4511E', F: '#6D4C41', G: '#7CB342', H: '#00ACC1',
    I: '#C0CA33', J: '#039BE5', K: '#43A047', L: '#FB8C00',
    M: '#D81B60', N: '#3949AB', O: '#5E35B1', P: '#00BFA5',
    Q: '#FF6F00', R: '#2E7D32', S: '#0277BD', T: '#6A1B9A',
    U: '#BF360C', V: '#004D40', W: '#827717', X: '#880E4F',
    Y: '#1A237E', Z: '#01579B',
  };
  return colors[brandInitial?.toUpperCase()] || '#546E7A';
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active': return '#4CAF50';
    case 'closed': return '#F44336';
    case 'planned': return '#FF9800';
    default: return '#9E9E9E';
  }
}

export const stateAbbreviations: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY', 'District of Columbia': 'DC',
};

export function getStateAbbreviation(stateName: string): string {
  return stateAbbreviations[stateName] ?? stateName.substring(0, 2).toUpperCase();
}
