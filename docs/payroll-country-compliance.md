# Country-specific payroll rules

Aerotech selects payroll deductions using the employer's saved country, not the browser locale or pricing currency.

## Nigeria (NG) — 2026 rules implemented as a preview
- PAYE brackets under Nigeria Tax Act 2025, effective 1 January 2026: NGN 0–800,000 at 0%; next 2,200,000 at 15%; next 9,000,000 at 18%; next 13,000,000 at 21%; next 25,000,000 at 23%; excess at 25%. Annual taxable income is calculated after supported relief and pension deductions.
- Employee pension 8% and employer pension 10% of basic salary plus housing and transport, for applicable workers.
- NHF calculation is 2.5% of basic pay when enabled for an eligible worker.
- Annual rent relief is 20% of documented annual rent paid, capped at NGN 500,000.
- Approved disciplinary sanctions are included; pending or rejected sanctions are not.
- Automatic calculation creates an immutable monthly payroll snapshot in `awaiting_hr` status. No funds are disbursed automatically.
- Four approval stages are HR, Finance, Management and CEO. Payment wallet is Coming Soon.

Important: this is **not yet a fully compliant production payroll system**. Employee eligibility, withholding details, benefits in kind, other allowed deductions and current regional/state rules require validation. The employer must review figures before CEO approval. The current simple worker data model does not capture every tax allowance, exemption and jurisdiction.

## Other countries
The engine has a jurisdiction registry and refuses to calculate payroll in an unverified country. As of this implementation Nigeria is the only configured calculation jurisdiction. United States, United Kingdom, Ghana, Kenya and all other territories are **not yet production-supported**. Each country must have versioned legal rules covering withholding, social contributions, minimum wages, statutory leave, and employer obligations, with reliable sources and effective dates. Do not represent a country as supported solely because Aerotech can display its currency.

## Sources consulted, 24 October 2026
- Nigeria Tax Act 2025 https://www.nipc.gov.ng/wp-content/uploads/2025/07/Nigeria-Tax-Act-2025.pdf
- Nigeria Joint Revenue Board 2026 Personal Income Tax Guidelines https://www.jrb.gov.ng/assets/2026-pit-guidelines-TJG3n9-T.pdf
- Pension Reform Act 2014 https://www.pencom.gov.ng/wp-content/uploads/2018/01/PRA_2014.pdf
- National Housing Fund information https://www.fmbn.gov.ng/documents/FMBN_SERVICOM_CHARTER.pdf
- OECD Taxing Wages 2026 https://www.oecd.org/content/dam/oecd/en/publications/reports/2026/04/taxing-wages-2026_d1f39986/3a5169ef-en.pdf
