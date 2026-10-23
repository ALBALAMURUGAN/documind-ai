export type SampleSpec = {
  name: string;
  folder: string;
  kind: 'pdf' | 'txt';
  notes: string;
  text: string;
};

export const SAMPLE_DOCS: SampleSpec[] = [
  {
    name: 'Helios Master Services Agreement.pdf',
    folder: 'Legal',
    kind: 'pdf',
    notes: 'Gold-standard MSA used in the atelier demo vault.',
    text: `HELIOS ANALYTICA INC. MASTER SERVICES AGREEMENT

This Master Services Agreement (the "Agreement") is entered into as of March 12, 2026 (the "Effective Date") by and between Helios Analytica Inc., a Delaware corporation ("Helios"), and Meridian Vault Holdings LLC ("Client").

ARTICLE 1. SCOPE OF SERVICES
Helios shall provide document intelligence, retrieval-augmented generation, and citation-grade question answering as described in each Statement of Work. Services include PDF ingestion, optical character recognition, named-entity recognition, embedding generation, and a private retrieval index hosted in the Client region.

Section 1.2 Service Levels
Helios will maintain 99.9% monthly uptime for the production API, excluding scheduled maintenance windows of no more than four hours per calendar quarter, noticed at least ten business days in advance.

ARTICLE 2. FEES AND PAYMENT
Client shall pay an annual platform fee of $420,000 plus usage of $0.18 per thousand tokens of retrieval context. Invoices are issued quarterly and payable within thirty (30) days. Late amounts accrue interest at 1.5% per month.

Section 2.3 Taxes
Fees are exclusive of applicable taxes. Client is responsible for VAT, GST, and similar assessments, other than taxes on Helios net income.

ARTICLE 3. CONFIDENTIALITY
Each party shall protect the other's Confidential Information with at least the same degree of care it uses for its own, and no less than reasonable care. Confidential Information includes document corpora, embeddings, prompts, and evaluation sets. Obligations survive for five (5) years after termination, and indefinitely for trade secrets.

ARTICLE 4. DATA PROCESSING
Helios acts as a processor of Client documents. Customer data is encrypted at rest with AES-256 and in transit with TLS 1.3. Helios will not use Client documents to train foundation models unless Client executes a separate Opt-In Training Addendum. Residuals in personnel memory are permitted provided they do not include Personal Data.

Section 4.4 Subprocessors
Helios may engage subprocessors listed at trust.heliosanalytica.com, including a European GPU region operated by Aurora Compute GmbH. Helios remains liable for subprocessor performance.

ARTICLE 5. INTELLECTUAL PROPERTY
Client retains all right, title, and interest in uploaded documents and derived annotations. Helios retains the platform, models weights it independently developed, and generic improvements to retrieval quality. Upon request Helios will export the Client index in an open parquet + JSON schema within fifteen days.

ARTICLE 6. INDEMNITY AND LIABILITY
Helios shall indemnify Client against third-party claims that the platform infringes a patent or copyright, provided Client gives prompt notice. Helios total aggregate liability under this Agreement shall not exceed the fees paid in the twelve (12) months preceding the claim. Neither party is liable for indirect, incidental, or consequential damages.

ARTICLE 7. TERM AND TERMINATION
The initial term is thirty-six (36) months and renews annually unless either party provides ninety (90) days written notice. Either party may terminate for material breach uncured after thirty days written notice.

ARTICLE 8. GOVERNING LAW
This Agreement is governed by the laws of the State of New York, excluding conflict of law rules. Disputes shall be resolved by confidential arbitration in Manhattan under JAMS Comprehensive Rules.

IN WITNESS WHEREOF the parties have executed this Agreement as of the Effective Date.
Helios Analytica Inc. — Authorized Signatory
Meridian Vault Holdings LLC — Authorized Signatory`,
  },
  {
    name: 'Q3 Research Brief — Citation Fidelity.txt',
    folder: 'Research',
    kind: 'txt',
    notes: 'Internal evaluation of grounded answering.',
    text: `DOCUMIND RESEARCH BRIEF
Quarter 3, 2026 — Citation Fidelity in Grounded Document QA
Authors: Dr. Marcus Chen, Amara Shah, Julian Okonkwo
Contact: research@documind.ai

ABSTRACT
We evaluate whether retrieval-augmented generation over private corpora can produce answers that a counsel or scientist can verify without leaving the product. Across 1,240 questions on 86 documents, DocuMind answers cited the correct page in 93.4% of cases and the correct passage span in 88.1%. Hallucinated citations fell from 6.2% in the baseline dense-only retriever to 1.1% with hybrid BM25 + MiniLM + rerank.

1. MOTIVATION
Knowledge workers do not need another fluent chatbot. They need a colleague who can point to the clause. A wrong page number destroys trust faster than a missing answer. This brief measures citation fidelity as a first-class metric, not an afterthought.

2. METHOD
Each document is parsed with pdfplumber, segmented into passages of 80–140 tokens aligned to headings, and stored in PostgreSQL with pgvector. A hybrid retriever blends BM25 lexical scores with cosine similarity over 384-dimensional MiniLM embeddings. A cross-encoder reranks the top 24 candidates. The generator is instructed to quote, not paraphrase, whenever a figure, date, or defined term is used.

3. RESULTS
Legal contracts: 95.1% page accuracy, 91.0% span accuracy.
Scientific papers: 92.8% page, 87.4% span.
Financial filings: 91.6% page, 85.9% span.
The largest residual errors occur on multi-column PDFs with footnotes that the geometry parser assigned to the wrong reading order.

4. ABLATIONS
Removing BM25 dropped page accuracy by 7.4 points on contracts rich in defined terms. Removing the reranker increased hallucinated citations to 3.8%. Forcing extractive quotes reduced fluency slightly but cut numerical hallucinations by 61%.

5. SAFETY
The system refuses to answer when the top passage score is below 0.18. Refusals are preferred to invented clauses. All processing remains in-region. Embeddings are not shared across tenants.

6. NEXT
We will add table-aware parsers and a visual citation overlay that paints the exact bounding box on the original PDF page. A human-in-the-loop review queue will capture residual errors for weekly evaluation.

CONCLUSION
Citation is the product. When every sentence can be opened to its page, document AI becomes admissible in the rooms that matter.`,
  },
  {
    name: 'Aurora Compute — SOC2 Control Narrative.md',
    folder: 'Compliance',
    kind: 'txt',
    notes: 'Excerpted control narrative for the trust center.',
    text: `AURORA COMPUTE GmbH
SOC 2 Type II — Control Narrative (excerpt)
Review period: 1 January 2026 to 30 September 2026
Prepared for Helios Analytica subprocessors diligence.

CC6.1 LOGICAL ACCESS
Production Kubernetes is reachable only through a bastion with hardware-backed FIDO2. Privileged roles require dual control. Service accounts are bound to namespaces and cannot assume cluster-admin. Quarterly access reviews are chaired by the CISO.

CC6.6 ENCRYPTION
Object storage uses AES-256 with customer-managed keys in AWS KMS (eu-central-1). Database volumes for PostgreSQL 16 are encrypted. TLS 1.3 is enforced on every ingress. Certificate rotation is automated at 45 days.

CC7.2 MONITORING
Falco and eBPF sensors stream to a SIEM with 400 days retention. Anomalous GPU job exfiltration patterns trigger paging within five minutes. Document corpora never leave the tenant VPC.

A1.2 AVAILABILITY
The retrieval API target is 99.9% monthly. Observed availability in the review period was 99.97%. Recovery time objective is 4 hours; recovery point objective is 15 minutes via continuous WAL shipping to a second AZ.

P1.1 PRIVACY
Personal data in uploaded documents is classified by a NER pipeline. DSR deletion requests propagate to object storage, Postgres rows, and the vector index within 72 hours. Subprocessors are listed publicly.

CHANGE MANAGEMENT
Infrastructure is declared in Terraform. Production deploys require two reviewers and a passing evaluation suite that includes citation-regression tests on a frozen 200-question set.

EXCEPTIONS
One Sev-2 incident on 14 May 2026 involved a stuck pgvector rebuild lasting 41 minutes. No customer data was exposed. A runbook now pre-warms a standby index.`,
  },
  {
    name: 'Product Spec — Passage Highlighter v2.txt',
    folder: 'Product',
    kind: 'txt',
    notes: 'Design spec for the citation overlay.',
    text: `DOCUMIND PRODUCT SPECIFICATION
Passage Highlighter v2
Owner: Elena Voss    Status: Approved for build    Date: 2 October 2026

PROBLEM
Readers who receive an answer still have to hunt through the PDF. The current snippet card quotes text but does not paint the original page. Trust is highest when the clause glows in situ.

GOALS
1. Highlight the exact passage on the rendered page within 120ms of clicking a citation chip.
2. Support multi-span answers that jump between pages without losing scroll position of the chat.
3. Allow keyword search to light every occurrence in the active document, gold for the focused hit, violet for siblings.

NON-GOALS
We will not OCR in the browser for v2. Scanned pages without a text layer show a dashed frame and a "Send to Python OCR" affordance.

INTERACTION
Hovering a citation chip previews the snippet. Clicking opens the reader at that page and pulses the highlight twice. Keyboard: J/K for next/previous hit, Enter to pin.

ENGINEERING NOTES
The Node gateway stores passage bounding boxes returned by the Python parser. Postgres table passage_boxes (passage_id, page, x, y, w, h). The React reader consumes a JSON overlay. For demo and local-first mode, text-range highlighting inside the extracted passage is sufficient.

SUCCESS METRICS
Time-to-verify (question asked → original clause seen) should fall from 42s to under 8s in moderated tests with ten counsel. Citation click-through should exceed 70% of answers.

RISKS
Multi-column layouts may mis-box. Mitigation: show the surrounding paragraph as well as the tight box, and let users report a miss which fine-tunes the geometry model weekly.`,
  },
];

export const FOLDER_HUES: Record<string, string> = {
  Legal: '#d4af37',
  Research: '#a78bfa',
  Compliance: '#c4b5fd',
  Product: '#f4e4b0',
  Inbox: '#7c3aed',
};
