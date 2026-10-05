-- Rebrand the website's database content: Nexora → Starstreak.
--
-- Run once in the Supabase SQL editor (project rzqsswyvcldnnlvjyhrt).
-- Order matters, and replace() is case-sensitive:
--   1. "Starstreak" (capital S — in old content this always meant the company,
--      e.g. "Starstreak Ltd") → "Hephix". Email addresses are lower-case
--      (support@starstreak.org) so they are left alone.
--   2. NEXORA / Nexora → STARSTREAK / Starstreak (the product).
--   3. "Flash Communities" → "Flashes" (the feature's new name).
-- Only rows that mention Nexora are touched. The FAQ *category* value
-- 'Flash Communities' is deliberately left as is (the ops editor filters by it).

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.rebrand(s text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT
    replace(replace(replace(replace(replace(replace(replace(replace(
      replace(s, 'Starstreak', 'Hephix'),
      'NEXORA', 'STARSTREAK'),
      'Nexora', 'Starstreak'),
      'Flash Communities', 'Flashes'),
      'Flash communities', 'Flashes'),
      'flash communities', 'Flashes'),
      'Flash Community', 'Flash'),
      'Flash community', 'Flash'),
      'flash community', 'Flash')
$$;

-- Legal pages + guidelines
UPDATE platform_content
SET content = pg_temp.rebrand(content), updated_at = now()
WHERE key IN ('privacy', 'terms', 'guidelines')
  AND content ILIKE '%nexora%';

-- FAQs (all rows, visible or hidden)
UPDATE faqs
SET question = pg_temp.rebrand(question),
    answer   = pg_temp.rebrand(answer),
    updated_at = now()
WHERE question ILIKE '%nexora%' OR answer ILIKE '%nexora%';

-- Roadmap
UPDATE roadmap_items
SET title = pg_temp.rebrand(title),
    description = pg_temp.rebrand(description),
    updated_at = now()
WHERE title ILIKE '%nexora%' OR description ILIKE '%nexora%';

-- Blog posts (slug too, so the URL matches the new title)
UPDATE blog_posts
SET title       = pg_temp.rebrand(title),
    excerpt     = pg_temp.rebrand(excerpt),
    content     = pg_temp.rebrand(content),
    author_name = pg_temp.rebrand(author_name),
    slug        = replace(slug, 'nexora', 'starstreak'),
    updated_at  = now()
WHERE title ILIKE '%nexora%' OR excerpt ILIKE '%nexora%'
   OR content ILIKE '%nexora%' OR author_name ILIKE '%nexora%' OR slug ILIKE '%nexora%';

-- Sanity check: should return 0 rows
SELECT 'platform_content' AS tbl, key::text AS id FROM platform_content WHERE content ILIKE '%nexora%'
UNION ALL SELECT 'faqs', id::text FROM faqs WHERE question ILIKE '%nexora%' OR answer ILIKE '%nexora%'
UNION ALL SELECT 'roadmap_items', id::text FROM roadmap_items WHERE title ILIKE '%nexora%' OR description ILIKE '%nexora%'
UNION ALL SELECT 'blog_posts', id::text FROM blog_posts WHERE title ILIKE '%nexora%' OR content ILIKE '%nexora%' OR slug ILIKE '%nexora%';

COMMIT;
