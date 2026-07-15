import type { RelationType } from '../../content-model/enums.ts';

export interface AtlasRelationLanguage {
  label: string;
  directional: boolean;
  sourceVerb: string;
  targetVerb: string;
  indexVerb: string;
  linePattern: 'solid' | 'dash' | 'dot' | 'dash-dot' | 'long-dash' | 'double' | 'short-dash';
  arrow: boolean;
  legendSentence: string;
}

const define = (value: AtlasRelationLanguage): AtlasRelationLanguage => Object.freeze(value);

export const ATLAS_RELATION_LANGUAGE: Readonly<Record<RelationType, AtlasRelationLanguage>> = Object.freeze({
  related: define({
    label: 'Related', directional: false, sourceVerb: 'is related to', targetVerb: 'is related to', indexVerb: 'is related to',
    linePattern: 'solid', arrow: false, legendSentence: 'Related — a documented non-directional connection.',
  }),
  lineage: define({
    label: 'Lineage', directional: true, sourceVerb: 'leads by lineage to', targetVerb: 'has lineage from', indexVerb: 'leads by lineage to',
    linePattern: 'long-dash', arrow: true, legendSentence: 'Lineage — a documented source-to-descendant connection.',
  }),
  dependency: define({
    label: 'Dependency', directional: true, sourceVerb: 'depends on', targetVerb: 'is a dependency of', indexVerb: 'depends on',
    linePattern: 'dash', arrow: true, legendSentence: 'Dependency — the source project depends on the target.',
  }),
  'shared-method': define({
    label: 'Shared method', directional: false, sourceVerb: 'shares a method with', targetVerb: 'shares a method with', indexVerb: 'shares a method with',
    linePattern: 'dot', arrow: false, legendSentence: 'Shared method — both projects use a documented method.',
  }),
  family: define({
    label: 'Family', directional: false, sourceVerb: 'belongs to a family with', targetVerb: 'belongs to a family with', indexVerb: 'belongs to a family with',
    linePattern: 'double', arrow: false, legendSentence: 'Family — both projects belong to a documented family.',
  }),
  supersedes: define({
    label: 'Supersedes', directional: true, sourceVerb: 'supersedes', targetVerb: 'is superseded by', indexVerb: 'supersedes',
    linePattern: 'dash-dot', arrow: true, legendSentence: 'Supersedes — the source project replaces the target.',
  }),
  supports: define({
    label: 'Supports', directional: true, sourceVerb: 'supports', targetVerb: 'is supported by', indexVerb: 'supports',
    linePattern: 'short-dash', arrow: true, legendSentence: 'Supports — the source project supports the target.',
  }),
});

export const getAtlasRelationSentence = (
  type: RelationType,
  sourceTitle: string,
  targetTitle: string,
): string => `${sourceTitle} ${ATLAS_RELATION_LANGUAGE[type].indexVerb} ${targetTitle}.`;
