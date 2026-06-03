export const UserRole = {
  ADMIN: 'admin',
  INVENTOR: 'inventor',
  ICT: 'ict',
  INDUSTRY: 'industry',
  INVESTOR: 'investor'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
