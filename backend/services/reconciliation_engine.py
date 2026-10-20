"""Deterministic reconciliation contract for the seeded UDYAM AI demo.

The repository's verified demo snapshot does not include bank transaction,
invoice, supplier-invoice, or GST reconciliation ledgers. Until those source
records are connected, return an empty result rather than manufacturing
matches, counterparties, GSTINs, or tax discrepancies.
"""

from typing import Any, Dict


def run_reconciliation(dataset: Dict[str, Any]) -> Dict[str, Any]:
    """Return an honest empty reconciliation result when source ledgers are absent."""
    has_reconciliation_sources = any(
        dataset.get(key)
        for key in (
            "bank_transactions",
            "invoices",
            "supplier_invoices",
            "gst_records",
            "reconciliation_records",
        )
    )

    if not has_reconciliation_sources:
        return {
            "matches": [],
            "summary": {
                "total_records_processed": 0,
                "matched_records": 0,
                "review_required_records": 0,
                "total_discrepancy_amount": 0.0,
                "overall_reconciliation_health_pct": 0.0,
            },
            "data_status": "No verified reconciliation ledgers are included in this demo snapshot.",
        }

    # Matching rules require source schemas and business keys to be explicitly
    # configured. Do not imply a match until that mapping has been implemented.
    return {
        "matches": [],
        "summary": {
            "total_records_processed": 0,
            "matched_records": 0,
            "review_required_records": 0,
            "total_discrepancy_amount": 0.0,
            "overall_reconciliation_health_pct": 0.0,
        },
        "data_status": "Source records were provided, but verified matching rules are not configured for this snapshot.",
    }
