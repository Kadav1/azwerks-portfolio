import { PROJECT_CATEGORIES } from '../../content-model/enums.ts';
import { getAuthoredMarkPolicy } from './authored-mark-policy.ts';
import { PROJECT_WORLD_REGISTRY } from './world-registry.ts';
import { REQUIRED_INVARIANT_SECTIONS, getProjectWorldSectionPolicy } from './world-section-policy.ts';

export const validateProjectWorldRegistry = (): string[] => {
  const failures: string[] = [];
  const keys = Object.keys(PROJECT_WORLD_REGISTRY);
  if (keys.length !== PROJECT_CATEGORIES.length || keys.some((key, index) => key !== PROJECT_CATEGORIES[index])) {
    failures.push('PROJECT_WORLD_MAPPING_INVALID');
  }
  for (const category of PROJECT_CATEGORIES) {
    const definition = PROJECT_WORLD_REGISTRY[category];
    const policy = getProjectWorldSectionPolicy(category);
    if (definition.id !== category || definition.worldProfile !== category) failures.push(`PROJECT_WORLD_MAPPING_INVALID ${category}`);
    if (getAuthoredMarkPolicy(category).level !== definition.authoredMarkLevel) failures.push(`PROJECT_WORLD_MARK_LEVEL_INVALID ${category}`);
    for (const section of REQUIRED_INVARIANT_SECTIONS) {
      if (!policy.order.includes(section)) failures.push(`PROJECT_WORLD_INVARIANT_MISSING ${category} ${section}`);
    }
    if (new Set(policy.order).size !== policy.order.length) failures.push(`PROJECT_WORLD_SECTION_DUPLICATE ${category}`);
  }
  return failures;
};
