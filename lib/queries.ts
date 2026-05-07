import sql from './db'

// ── helpers ───────────────────────────────────────────────────────────────

function startOfDay(daysAgo: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().split('T')[0] // 'YYYY-MM-DD'
}

// ── KPI cards ─────────────────────────────────────────────────────────────

export async function getKpis() {
  const rows = await sql`
    SELECT
      COUNT(*)::int                                                   AS total_count,
      COUNT(*) FILTER (WHERE status = 'active')::int                  AS active_count,
      COUNT(*) FILTER (WHERE status = 'sold')::int                    AS sold_count,
      COUNT(*) FILTER (WHERE status = 'deleted')::int                 AS deleted_count,
      ROUND(
        COUNT(*) FILTER (WHERE status = 'sold')::numeric
        / NULLIF(COUNT(*), 0) * 100,
        1
      )::float8                                                       AS sold_rate_pct,
      ROUND(AVG(price) FILTER (WHERE status = 'sold'), 2)::float8     AS avg_sold_price,
      ROUND(AVG(price) FILTER (WHERE status = 'active'), 2)::float8   AS avg_active_price,
      COUNT(*) FILTER (WHERE DATE(first_seen_at) = CURRENT_DATE)::int AS added_today
    FROM articles_clean
  `
  return rows[0]
}

// ── 30-day trend (zero-filled) ────────────────────────────────────────────

export async function getTrend(days = 30) {
  const start = startOfDay(days - 1)
  return sql`
    WITH date_series AS (
      SELECT generate_series(
        ${start}::date,
        CURRENT_DATE,
        '1 day'::interval
      )::date AS date
    ),
    daily_added AS (
      SELECT DATE(first_seen_at) AS date, COUNT(*)::int AS added
      FROM   articles_clean
      WHERE  first_seen_at >= ${start}::date
      GROUP  BY 1
    ),
    daily_sold AS (
      SELECT DATE(sold_at) AS date, COUNT(*)::int AS sold
      FROM   articles_clean
      WHERE  status = 'sold'
        AND  sold_at IS NOT NULL
        AND  sold_at >= ${start}::date
      GROUP  BY 1
    )
    SELECT
      ds.date::text                       AS date,
      COALESCE(da.added, 0)               AS added,
      COALESCE(dso.sold,  0)              AS sold
    FROM  date_series ds
    LEFT  JOIN daily_added da  ON da.date  = ds.date
    LEFT  JOIN daily_sold  dso ON dso.date = ds.date
    ORDER BY 1
  `
}

// ── Top categories ────────────────────────────────────────────────────────

export async function getCategories() {
  // Plain GROUP BY + ORDER BY + LIMIT lets PostgreSQL terminate early via index.
  // Window-function approaches require a full-table scan before ranking.
  return sql`
    SELECT
      SPLIT_PART(category, '/', 1)                                    AS gender,
      COALESCE(
        NULLIF(SPLIT_PART(category, '/', 2), ''),
        SPLIT_PART(category, '/', 1)
      )                                                               AS subcategory,
      COUNT(*)::int                                                   AS total,
      COUNT(*) FILTER (WHERE status = 'sold')::int                    AS sold,
      ROUND(
        COUNT(*) FILTER (WHERE status = 'sold')::numeric
        / NULLIF(COUNT(*), 0) * 100, 1
      )::float8                                                       AS sold_pct,
      ROUND(AVG(price), 2)::float8                                    AS avg_price
    FROM   articles_clean
    WHERE  category IS NOT NULL AND TRIM(category) != ''
    GROUP  BY 1, 2
    ORDER  BY total DESC
    LIMIT  20
  `
}

// ── Brand velocity ────────────────────────────────────────────────────────

export async function getBrands() {
  return sql`
    SELECT
      brand,
      COUNT(*)::int                                                   AS total,
      COUNT(*) FILTER (WHERE status = 'sold')::int                    AS sold,
      ROUND(
        COUNT(*) FILTER (WHERE status = 'sold')::numeric
        / NULLIF(COUNT(*), 0) * 100, 1
      )::float8                                                       AS sold_pct,
      ROUND(
        AVG(EXTRACT(EPOCH FROM (sold_at - vinted_created_at)) / 3600.0)
        FILTER (
          WHERE status = 'sold'
            AND vinted_created_at IS NOT NULL
            AND sold_at > vinted_created_at
        ),
        1
      )::float8                                                       AS median_hours_to_sell,
      ROUND(
        AVG(price) FILTER (WHERE status = 'sold'),
        2
      )::float8                                                       AS median_sold_price
    FROM   articles_clean
    WHERE  brand IS NOT NULL AND TRIM(brand) != ''
    GROUP  BY brand
    HAVING COUNT(*) >= 5
    ORDER  BY sold DESC, total DESC
    LIMIT  20
  `
}

// ── Sales heatmap (7 days × 24 hours) ────────────────────────────────────

export async function getHeatmap(days = 30) {
  const cutoff = startOfDay(days)
  return sql`
    SELECT
      ((EXTRACT(DOW FROM sold_at)::int + 6) % 7)  AS weekday,
      EXTRACT(HOUR FROM sold_at)::int              AS hour,
      COUNT(*)::int                                AS sales_count
    FROM   articles_clean
    WHERE  status  = 'sold'
      AND  sold_at IS NOT NULL
      AND  sold_at >= ${cutoff}::date
    GROUP  BY 1, 2
    ORDER  BY 1, 2
  `
}

// ── Recent sold ───────────────────────────────────────────────────────────

export async function getRecentSold(limit = 40) {
  return sql`
    SELECT
      vinted_id,
      title,
      brand,
      price::float8   AS price,
      currency,
      category,
      sold_at,
      'https://www.vinted.it/items/' || vinted_id AS url,
      image_url
    FROM   articles_clean
    WHERE  status  = 'sold'
      AND  sold_at IS NOT NULL
    ORDER  BY sold_at DESC
    LIMIT  ${limit}
  `
}
