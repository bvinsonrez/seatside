import type { ContentPack, SportId } from '../types';
import { hockey } from './hockey';
import { basketball } from './basketball';

export const packs: Record<SportId, ContentPack> = { hockey, basketball };
