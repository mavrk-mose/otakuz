import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';
import { visionTool } from '@sanity/vision';

export default defineConfig({
  name: 'otakuz',
  title: 'Otakuz CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});