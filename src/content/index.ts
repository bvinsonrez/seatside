import type { ContentPack, SportId } from '../types';
import { hockey } from './hockey';

export const packs: Partial<Record<SportId, ContentPack>> & { hockey: ContentPack } = { hockey };
