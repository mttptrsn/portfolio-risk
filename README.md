# Portfolio Risk Analytics

Professional-grade portfolio risk analysis with:
- Log returns
- Covariance & correlation
- Shrinkage covariance (Ledoit–Wolf)
- Risk contributions & marginal risk
- PCA, eigenvalues, explained variance
- Normal vs stressed regime analysis

## Architecture

- Python: data ingestion, cleaning, risk computation
- Next.js (apps/web): interactive visualization
- Hosting: Vercel
- Storage: Vercel Blob (JSON payloads)

## Repo Structure

apps/web # Next.js frontend (Vercel)
src/prisk # Python risk engine
notebooks # Research & validation
scripts # Cron / automation entrypoints
data/ # Local-only (gitignored)

## Workflow

1. Python updates market data
2. Risk payload JSON is generated locally
3. Payload is published to Vercel Blob
4. Next.js app fetches and renders results
