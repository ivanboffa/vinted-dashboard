import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!.trim(), {
  ssl: { rejectUnauthorized: false },
  prepare: false,      // required for Supabase transaction-mode pooler (port 6543)
  max: 1,              // 1 connection per serverless function instance
  idle_timeout: 20,
  connect_timeout: 10,
})

export default sql
