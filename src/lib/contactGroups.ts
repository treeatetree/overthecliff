// Predefined relationship groups for contacts
export const RELATIONSHIP_GROUPS = [
  { value: 'family', label: '家人', icon: '👨‍👩‍👧‍👦' },
  { value: 'friend', label: '朋友', icon: '🤝' },
  { value: 'colleague', label: '同事', icon: '💼' },
  { value: 'classmate', label: '同学', icon: '🎓' },
  { value: 'relative', label: '亲戚', icon: '👪' },
  { value: 'business', label: '商务', icon: '🤵' },
  { value: 'other', label: '其他', icon: '📋' },
] as const;

export type RelationshipGroup = typeof RELATIONSHIP_GROUPS[number]['value'];

export const getGroupLabel = (value: string | null): string => {
  if (!value) return '未分组';
  const group = RELATIONSHIP_GROUPS.find(g => g.value === value);
  return group?.label || value;
};

export const getGroupIcon = (value: string | null): string => {
  if (!value) return '📌';
  const group = RELATIONSHIP_GROUPS.find(g => g.value === value);
  return group?.icon || '📋';
};
