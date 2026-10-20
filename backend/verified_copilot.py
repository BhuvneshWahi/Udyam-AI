
import os
import re
import sys
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FORECAST_DIR = os.path.join(BASE_DIR, "aiml")
NOTIFICATION_DIR = os.path.join(BASE_DIR, "market")
RAG_DIR = os.path.join(BASE_DIR, "rag")
SEED_DIR = os.path.join(BASE_DIR, "verified_data")

VENDOR_ID = "vendor_sharma_001"
DEFAULT_DEMO_DATE = "2026-09-26"


def get_reference_date():
    """Return the stable seeded-demo date, overridable for a different demo run."""
    configured_date = os.getenv("UDYAM_DEMO_DATE", DEFAULT_DEMO_DATE)
    return pd.Timestamp(configured_date).normalize()


# ============================================================
# LOAD BACKEND MODULES
# ============================================================

for path in [
    FORECAST_DIR,
    NOTIFICATION_DIR,
    RAG_DIR
]:

    if path not in sys.path:
        sys.path.append(path)


import forecast_engine
import notifications_engine
import compliance_rag


# ============================================================
# PUBLIC BACKEND FUNCTIONS
# ============================================================

get_product_forecast = (
    forecast_engine.get_product_forecast
)

get_product_recommendation = (
    forecast_engine.get_product_recommendation
)

get_product_insight = (
    forecast_engine.get_product_insight
)

get_all_recommendations = (
    forecast_engine.get_all_recommendations
)

get_notifications = (
    notifications_engine.get_notifications
)

get_notification_summary = (
    notifications_engine.get_notification_summary
)

generate_compliance_answer = (
    compliance_rag.generate_compliance_answer
)


# ============================================================
# CSV HELPER
# ============================================================

def load_seed_csv(filename):

    path = os.path.join(
        SEED_DIR,
        filename
    )

    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Missing seed file: {path}"
        )

    return pd.read_csv(path)


# ============================================================
# PRODUCT RESOLUTION
# ============================================================

def _contains_term(text, term):
    """Match a keyword/phrase as a token, not as part of a larger identifier."""
    return re.search(rf"(?<!\w){re.escape(term.lower())}(?!\w)", text.lower()) is not None


def resolve_products(query):
    """Return every catalog product explicitly mentioned in a query, in catalog order."""
    query_lower = _routing_query(query)
    products_df = load_seed_csv("products.csv")
    matches = []

    for _, row in products_df.iterrows():
        product_name = str(row["name"])
        # Word boundaries prevent short names from matching inside other words.
        pattern = rf"(?<![\w]){re.escape(product_name.lower())}(?![\w])"
        if re.search(pattern, query_lower):
            matches.append({
                "product_id": row["id"],
                "product_name": product_name,
                "category": row.get("category"),
            })

    return matches


def resolve_product(query):
    """Resolve a single product mention; multi-product queries use resolve_products."""
    matches = resolve_products(query)
    return matches[0] if len(matches) == 1 else None


def _routing_query(query):
    """Remove standalone negative constraints before keyword-based intent routing.

    Without this, a safety instruction such as "Do not convert the 7-day plan into
    a monthly forecast" is incorrectly interpreted as a request for a monthly plan,
    and "Do not mention GST" is incorrectly routed to compliance.
    """
    raw = str(query or "")
    # Treat newlines and sentence/semicolon boundaries as separate instructions.
    pieces = re.split(r"(?<=[.!?;])\s+|\n+", raw)
    kept = []
    negative_start = re.compile(
        r"^\s*(?:(?:please)\s+)?(?:do\s+not|don't|dont|never|avoid)\b",
        re.IGNORECASE,
    )
    for piece in pieces:
        sentence = piece.strip()
        if not sentence or negative_start.match(sentence):
            continue
        kept.append(sentence)
    return " ".join(kept).lower().strip()


# ============================================================
# COMPLIANCE TYPE RESOLUTION
# ============================================================

def resolve_compliance_type(query):
    """Resolve a user's compliance query to a seeded task where unambiguous.

    Generic GST questions are routed to the GSTR-3B record only when the user
    is asking about a deadline/countdown, not for broad GST-policy questions.
    """
    q = query.lower().strip()

    if (
        "gstr-3b" in q
        or "gstr 3b" in q
        or "gst 3b" in q
    ):
        return "GSTR-3B"

    gst_due_terms = (
        "due", "deadline", "due date", "filing date", "filing", "next",
        "overdue", "days remaining", "how many days", "when", "kab",
        "last date", "date"
    )
    mentions_gst = ("gst" in q) or ("goods and services tax" in q)
    if mentions_gst and any(term in q for term in gst_due_terms):
        return "GSTR-3B"

    if (
        "itr" in q
        or "income tax" in q
        or "advance tax" in q
    ):
        return "ITR (advance tax)"

    if "udyam" in q:
        return "Udyam profile review"

    return None


# ============================================================
# INTENT DETECTION
# ============================================================

def detect_intent(query):

    # Route from the positive request, not from keywords appearing only in a
    # standalone "do not ..." constraint.
    q = _routing_query(query)


    # --------------------------------------------------------
    # COMPLIANCE
    # --------------------------------------------------------

    compliance_terms = [
        "gst",
        "gstr",
        "gstr-3b",
        "gstr 3b",
        "gstr-2b",
        "gstr 2b",
        "itr",
        "income tax",
        "advance tax",
        "udyam",
        "msme",
        "classification",
        "turnover",
        "investment",
        "tax",
        "compliance",
        "deadline",
        "due date",
        "filing"
    ]

    if any(_contains_term(q, term) for term in compliance_terms):
        return "COMPLIANCE"


    # --------------------------------------------------------
    # NOTIFICATIONS
    # --------------------------------------------------------

    notification_terms = [
        "notification",
        "notifications",
        "alert",
        "alerts",
        "pending notifications",
        "reminder",
        "reminders",
        "show my alerts"
    ]

    if any(_contains_term(q, term) for term in notification_terms):
        return "NOTIFICATION"


    # --------------------------------------------------------
    # BUSINESS / PROCUREMENT
    # --------------------------------------------------------

    procurement_terms = [
        "procurement",
        "purchase",
        "purchasing",
        "purchase order",
        "po",
        "stock status",
        "inventory status",
        "inventory",
        "current stock",
        "available stock",
        "stock level",
        "reorder",
        "what should i reorder",
        "what products should i reorder",
        "which products should i reorder",
        "stock badhana",
        "stock badhaana",
        "stock badhana chahiye",
        "stock up",
        "stock up for",
        "stock up on",
        "which products should i stock",
        "what products should i stock",
        "which products should i buy",
        "what products should i buy",
        "kaunse products ka stock",
        "kaun se products ka stock",
        "replenish",
        "supplier"
    ]

    if any(_contains_term(q, term) for term in procurement_terms):
        return "BUSINESS"


    # --------------------------------------------------------
    # MARKET
    # --------------------------------------------------------

    market_terms = [
        "market",
        "trend",
        "trending",
        "news",
        "signal",
        "demand trend",
        "market radar",
        "diwali",
        "dhanteras",
        "festival"
    ]

    if any(_contains_term(q, term) for term in market_terms):
        return "MARKET"


    # --------------------------------------------------------
    # FORECAST
    # --------------------------------------------------------

    forecast_terms = [
        "forecast",
        "forecasting",
        "next week",
        "next 7 days",
        "future demand",
        "demand",
        "kitna stock karu",
        "kitna maal",
        "maal badhaun",
        "how much should i stock"
    ]

    if any(_contains_term(q, term) for term in forecast_terms):
        return "FORECAST"


    return "UNKNOWN"


# ============================================================
# FORECAST HANDLER
# ============================================================

def handle_forecast(query):

    product = resolve_product(query)

    if product is None:

        return {
            "intent": "FORECAST",
            "answer": (
                "Please mention a product such as "
                "Rice, Besan, Ghee, Sugar, Atta, "
                "or Dry Fruits."
            ),
            "product": None,
            "forecast": [],
            "recommendation": {},
            "market_context": [],
            "confidence": "low",
            "sources": []
        }


    product_id = product["product_id"]
    product_name = product["product_name"]

    forecast = get_product_forecast(
        product_id
    )

    recommendation = get_product_recommendation(
        product_id
    )

    market_context = [
        item
        for item in forecast
        if (
            item.get("market_signal", 0) != 0
            or item.get("event_adjustment", 0) != 0
        )
    ]


    base_demand = recommendation.get(
        "base_7_day_demand_kg",
        0
    )

    adjusted_demand = recommendation.get(
        "adjusted_7_day_demand_kg",
        0
    )

    current_stock = recommendation.get(
        "current_inventory_kg",
        0
    )

    incoming_po = recommendation.get(
        "incoming_po_kg",
        0
    )

    additional_stock = recommendation.get(
        "recommended_additional_stock_kg",
        0
    )

    priority = recommendation.get(
        "priority",
        "UNKNOWN"
    )

    market_signal = recommendation.get(
        "market_signal_pct",
        0
    )

    festival_signal = recommendation.get(
        "festival_signal_pct",
        0
    )


    answer = (
        f"{product_name}: the base 7-day demand forecast is "
        f"{base_demand:.0f} kg. After market and festival "
        f"adjustments, expected demand is about "
        f"{adjusted_demand:.0f} kg. Current stock is "
        f"{current_stock:.0f} kg with {incoming_po:.0f} kg "
        f"incoming through open purchase orders. "
        f"The system flags {priority} procurement priority "
        f"and recommends reviewing approximately "
        f"{additional_stock:.0f} kg of additional stock. "
        f"Market signal: +{market_signal:.0f}%; "
        f"festival effect: +{festival_signal:.0f}%."
    )


    return {
        "intent": "FORECAST",
        "answer": answer,
        "product": product,
        "forecast": forecast,
        "recommendation": recommendation,
        "market_context": market_context,
        "confidence": "medium",
        "sources": [
            {
                "type": "internal",
                "label": "7-day demand forecast"
            },
            {
                "type": "market",
                "label": "Category market signal"
            },
            {
                "type": "event",
                "label": "Festival/event adjustment"
            }
        ]
    }


# ============================================================
# NOTIFICATION HANDLER
# ============================================================

def handle_notification(query):

    notifications = get_notifications(
        vendor_id=VENDOR_ID,
        unread_only=False
    )

    if not notifications:

        answer = (
            "There are no notifications "
            "for this vendor."
        )

    else:

        unread = [
            n
            for n in notifications
            if not n.get("is_read", False)
        ]

        high = [
            n
            for n in notifications
            if str(
                n.get("priority", "")
            ).upper() == "HIGH"
        ]

        answer_lines = [
            f"You have {len(notifications)} notifications."
        ]

        if unread:

            answer_lines.append(
                f"{len(unread)} are unread."
            )

        if high:

            answer_lines.append(
                f"{len(high)} are HIGH priority."
            )

        for n in notifications[:3]:

            answer_lines.append(
                f"- {n.get('title', 'Notification')}: "
                f"{n.get('body', '')}"
            )

        answer = "\n".join(
            answer_lines
        )


    return {
        "intent": "NOTIFICATION",
        "answer": answer,
        "notifications": notifications,
        "confidence": "high",
        "sources": [
            {
                "type": "internal",
                "label": "notifications.csv"
            }
        ]
    }


# ============================================================
# BUSINESS / PROCUREMENT HANDLER
# ============================================================

def is_monthly_horizon_query(query):
    """Detect requests for monthly planning that the saved 7-day artifact cannot answer."""
    q = _routing_query(query)
    monthly_terms = (
        "next month",
        "next month's",
        "coming month",
        "for next month",
        "month ahead",
        "monthly forecast",
        "monthly demand",
        "agale mahine",
        "agle mahine",
        "agla mahina",
        "aane wale mahine",
        "aane wale mahine mein",
        "agle mahine ka",
        "agale mahine ka",
        "next 30 days",
    )
    return any(term in q for term in monthly_terms)


def handle_business(query):

    # Do not silently answer a monthly planning request with the saved 7-day
    # artifact. Be explicit about the supported horizon until a monthly model
    # and corresponding validated data are available.
    if is_monthly_horizon_query(query):
        return {
            "intent": "BUSINESS",
            "answer": (
                "You asked for next-month stock planning, but the connected planning "
                "artifact currently contains a saved 7-day plan only. I cannot safely "
                "rank products or quote monthly reorder quantities from a 7-day forecast, "
                "so I have not presented those figures as a monthly recommendation. "
                "For the currently available 7-day plan, ask: 'What should I reorder?'"
            ),
            "inventory": [],
            "purchase_orders": [],
            "recommendations": [],
            "horizon_unavailable": True,
            "requested_horizon": "Next month",
            "available_horizon": "7 days",
            "confidence": "low",
            "sources": [
                {
                    "type": "internal",
                    "label": "aiml/udyam_recommendations.json (saved 7-day planning recommendations only)",
                }
            ],
        }

    mentioned_products = resolve_products(query)
    product = mentioned_products[0] if len(mentioned_products) == 1 else None

    inventory_df = load_seed_csv(
        "inventory.csv"
    )

    po_df = load_seed_csv(
        "purchase_orders.csv"
    )


    if "vendor_id" in inventory_df.columns:

        inventory_df = inventory_df[
            inventory_df["vendor_id"] == VENDOR_ID
        ].copy()


    if "vendor_id" in po_df.columns:

        po_df = po_df[
            po_df["vendor_id"] == VENDOR_ID
        ].copy()

    # Restrict a multi-product comparison to the products the user named.
    # This avoids resolving only the first mentioned product and returning a
    # single-product card for a comparison request.
    requested_product_ids = None
    if len(mentioned_products) > 1:
        requested_product_ids = {
            str(item["product_id"]) for item in mentioned_products
        }
        inventory_df = inventory_df[
            inventory_df["product_id"].astype(str).isin(requested_product_ids)
        ].copy()
        po_df = po_df[
            po_df["product_id"].astype(str).isin(requested_product_ids)
        ].copy()

    if product is not None:

        product_id = product["product_id"]
        product_name = product["product_name"]

        inv_row = inventory_df[
            inventory_df["product_id"] == product_id
        ]

        po_rows = po_df[
            po_df["product_id"] == product_id
        ]


        current_stock = 0.0

        if not inv_row.empty:

            stock_col = None

            for candidate in [
                "current_qty",
                "current_quantity",
                "quantity",
                "current_stock",
                "stock"
            ]:

                if candidate in inv_row.columns:

                    stock_col = candidate
                    break


            if stock_col is not None:

                current_stock = float(
                    inv_row.iloc[0][stock_col]
                )


        incoming_po = 0.0

        if (
            not po_rows.empty
            and "quantity" in po_rows.columns
        ):

            incoming_po = float(
                po_rows["quantity"].sum()
            )


        if incoming_po > 0:

            answer = (
                f"{product_name} currently has about "
                f"{current_stock:.0f} kg in stock and "
                f"{incoming_po:.0f} kg incoming through "
                f"purchase orders."
            )

        else:

            answer = (
                f"{product_name} currently has about "
                f"{current_stock:.0f} kg in stock and "
                f"no incoming quantity found in the "
                f"current purchase-order data."
            )


        return {
            "intent": "BUSINESS",
            "answer": answer,
            "product": product,
            "inventory": {
                "current_stock": current_stock
            },
            "purchase_orders": po_rows.to_dict(
                orient="records"
            ),
            "confidence": "high",
            "sources": [
                {
                    "type": "internal",
                    "label": "inventory.csv"
                },
                {
                    "type": "internal",
                    "label": "purchase_orders.csv"
                }
            ]
        }


    # General procurement questions (for example, "What should I reorder?")
    # must return product-level recommendations, not only record counts.
    # Inventory and open-PO quantities are reconciled against the same CSVs
    # used by product-specific queries so the answer cannot show 0 kg while
    # the live context panel shows 21 kg for Besan.
    recommendations = get_all_recommendations() or []
    if requested_product_ids is not None:
        recommendations = [
            rec for rec in recommendations
            if str(rec.get("product_id", "")) in requested_product_ids
        ]

    inventory_qty_by_product = {}
    for _, row in inventory_df.iterrows():
        product_id = str(row.get("product_id", ""))
        qty_value = row.get("current_qty", row.get("current_quantity", row.get("quantity")))
        if product_id and pd.notna(qty_value):
            inventory_qty_by_product[product_id] = float(qty_value)

    incoming_qty_by_product = {}
    if "product_id" in po_df.columns and "quantity" in po_df.columns:
        closed_statuses = {"CANCELLED", "CANCELED", "CLOSED", "RECEIVED", "COMPLETED"}
        open_po_df = po_df.copy()
        if "status" in open_po_df.columns:
            open_po_df = open_po_df[
                ~open_po_df["status"].astype(str).str.upper().isin(closed_statuses)
            ]
        for product_id, rows in open_po_df.groupby("product_id"):
            incoming_qty_by_product[str(product_id)] = float(
                pd.to_numeric(rows["quantity"], errors="coerce").fillna(0).sum()
            )

    # The saved recommendation artifact provides the planning suggestions;
    # CSVs remain the source of truth for current stock and inbound quantity.
    enriched_recommendations = []
    for item in recommendations:
        rec = dict(item)
        product_id = str(rec.get("product_id", ""))
        if product_id in inventory_qty_by_product:
            rec["current_inventory_kg"] = inventory_qty_by_product[product_id]
        else:
            rec["current_inventory_kg"] = None
        rec["incoming_po_kg"] = incoming_qty_by_product.get(product_id, 0.0)
        enriched_recommendations.append(rec)

    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    enriched_recommendations.sort(
        key=lambda rec: (
            priority_order.get(str(rec.get("priority", "LOW")).upper(), 3),
            -float(rec.get("recommended_additional_stock_kg") or 0),
        )
    )
    high_priority = [
        rec for rec in enriched_recommendations
        if str(rec.get("priority", "")).upper() == "HIGH"
    ]

    if enriched_recommendations:
        highlights = "; ".join(
            f"{rec.get('product_name', rec.get('product_id', 'Product'))} "
            f"(review about {float(rec.get('recommended_additional_stock_kg') or 0):.0f} kg additional stock)"
            for rec in high_priority[:3]
        )
        if high_priority:
            answer = (
                f"The saved 7-day procurement planner marks {len(high_priority)} product(s) "
                f"HIGH priority: {highlights}. See the product-level evidence below. "
                "These are planning suggestions, not purchase orders; validate supplier lead times, "
                "pack sizes, and the reorder policy before placing an order."
            )
        else:
            answer = (
                "The saved 7-day procurement planner has no HIGH-priority products. "
                "See the product-level stock, incoming-order, demand, and suggested-stock evidence below."
            )
    else:
        answer = (
            f"I found {len(po_df)} purchase-order record(s) and "
            f"{len(inventory_df)} inventory record(s), but the saved planning recommendations "
            "could not be loaded. I cannot safely identify which products to reorder yet."
        )

    return {
        "intent": "BUSINESS",
        "answer": answer,
        "inventory": inventory_df.to_dict(orient="records"),
        "purchase_orders": po_df.to_dict(orient="records"),
        "recommendations": enriched_recommendations,
        "confidence": "high" if enriched_recommendations else "low",
        "sources": [
            {"type": "internal", "label": "inventory.csv"},
            {"type": "internal", "label": "purchase_orders.csv"},
            {"type": "internal", "label": "aiml/udyam_recommendations.json (saved 7-day planning recommendations)"},
        ]
    }


# ============================================================
# COMPLIANCE HANDLER
# ============================================================

def handle_compliance(query):

    query_lower = query.lower()

    compliance_type = (
        resolve_compliance_type(query)
    )

    due_question_terms = [
        "when",
        "kab",
        "due",
        "deadline",
        "date",
        "last date",
        "kitne din",
        "how many days"
    ]

    is_due_question = any(
        term in query_lower
        for term in due_question_terms
    )


    # --------------------------------------------------------
    # Personalized compliance task
    # --------------------------------------------------------

    if (
        compliance_type
        and is_due_question
    ):

        tasks_df = load_seed_csv(
            "compliance_tasks.csv"
        )

        task = tasks_df[
            (
                tasks_df["vendor_id"]
                == VENDOR_ID
            )
            &
            (
                tasks_df["type"]
                == compliance_type
            )
        ]


        if not task.empty:

            row = task.iloc[0]

            due_date = pd.to_datetime(
                row["due_date"]
            )

            today = get_reference_date()

            days_left = int((due_date.normalize() - today).days)
            system_today = pd.Timestamp.now().normalize()
            actual_days_left = int((due_date.normalize() - system_today).days)
            due_display = due_date.strftime('%d %B %Y')
            demo_reference_display = today.strftime('%d %B %Y')
            system_date_display = system_today.strftime('%d %B %Y')

            if days_left > 0:
                demo_countdown = f"{days_left} days remaining in the seeded demo timeline"
            elif days_left == 0:
                demo_countdown = "due on the seeded demo reference date"
            else:
                demo_countdown = f"{abs(days_left)} days before the seeded demo reference date (past due)"

            if actual_days_left > 0:
                current_timing = f"the saved due date is {actual_days_left} days from the backend system date"
            elif actual_days_left == 0:
                current_timing = "the saved due date is today according to the backend system date"
            else:
                current_timing = f"the saved due date passed {abs(actual_days_left)} days before the backend system date"

            if compliance_type == "GSTR-3B" and actual_days_left < 0:
                answer = (
                    "I cannot confirm the next upcoming GST filing deadline from the connected data. "
                    f"The only saved GSTR-3B task is dated {due_display} and marked {row['status']}. "
                    f"Seeded demo reference date: {demo_reference_display} ({demo_countdown}); "
                    f"backend system date: {system_date_display}, and {current_timing}. "
                    "No later GST due-date record is available in this dataset. This is seeded demo data, "
                    "not a live GST portal check; verify the actual filing status and next due date against official records."
                )
            else:
                answer = (
                    f"The connected seeded compliance record lists {compliance_type} with due date {due_display} "
                    f"and status {row['status']}. Seeded demo reference date: {demo_reference_display} "
                    f"({demo_countdown}); backend system date: {system_date_display}, and {current_timing}. "
                    "This is seeded demo data, not a live compliance-portal check. Verify actual filing details before relying on it."
                )

            priority = (
                "HIGH"
                if days_left <= 3
                else "MEDIUM"
                if days_left <= 7
                else "LOW"
            )

            return {
                "intent": "COMPLIANCE",
                "answer": answer,
                "confidence": "high",
                "priority": priority,
                "sources": [
                    {
                        "type": "vendor_compliance_data",
                        "label": "compliance_tasks.csv",
                        "task_id": row["id"],
                        "task_type": compliance_type,
                        "due_date": due_date.strftime("%Y-%m-%d"),
                        "days_left": days_left,
                        "reference_date": today.strftime("%Y-%m-%d"),
                        "system_date": system_today.strftime("%Y-%m-%d"),
                        "actual_days_left": actual_days_left,
                        "system_due_status": (
                            f"{actual_days_left} days remaining" if actual_days_left > 0
                            else "due today" if actual_days_left == 0
                            else f"{abs(actual_days_left)} days overdue"
                        ),
                        "status": row["status"]
                    }
                ]
            }


    # --------------------------------------------------------
    # MSME classification → Udyam RAG
    # --------------------------------------------------------

    is_msme_knowledge = (
        "msme" in query_lower
        and any(
            term in query_lower
            for term in [
                "classification",
                "turnover",
                "investment",
                "micro",
                "small",
                "medium",
                "category",
                "categories",
                "limit",
                "limits"
            ]
        )
    )


    if is_msme_knowledge:

        rag_result = generate_compliance_answer(
            query=(
                query
                + " Udyam MSME classification"
            ),
            top_k=4,
            doc_type_filter="udyam",
            similarity_threshold=0.55
        )

    else:

        rag_result = generate_compliance_answer(
            query=query,
            top_k=4,
            similarity_threshold=0.55
        )


    return {
        "intent": "COMPLIANCE",
        "answer": rag_result.get(
            "answer",
            "I could not verify this from the "
            "connected compliance knowledge base."
        ),
        "confidence": rag_result.get(
            "confidence",
            "low"
        ),
        "sources": rag_result.get(
            "sources",
            []
        )
    }


# ============================================================
# MARKET HANDLER
# ============================================================

def handle_market(query):

    market_df = load_seed_csv(
        "market_signals.csv"
    )

    if "vendor_id" in market_df.columns:

        relevant = market_df[
            market_df["vendor_id"] == VENDOR_ID
        ].copy()

    else:

        relevant = market_df.copy()


    return {
        "intent": "MARKET",
        "answer": (
            f"I found {len(relevant)} relevant "
            f"market signal(s) in the connected "
            f"market feed."
        ),
        "market_context": relevant.to_dict(
            orient="records"
        ),
        "confidence": "medium",
        "sources": [
            {
                "type": "market",
                "label": "market_signals.csv"
            }
        ]
    }


# ============================================================
# MAIN COPILOT
# ============================================================

def copilot(query):

    intent = detect_intent(query)


    if intent == "FORECAST":

        result = handle_forecast(query)


    elif intent == "COMPLIANCE":

        result = handle_compliance(query)


    elif intent == "NOTIFICATION":

        result = handle_notification(query)


    elif intent == "BUSINESS":

        result = handle_business(query)


    elif intent == "MARKET":

        result = handle_market(query)


    else:

        result = {
            "intent": "UNKNOWN",
            "answer": (
                "I can help with demand forecasts, "
                "market trends, notifications, "
                "procurement, inventory, or "
                "compliance questions."
            ),
            "confidence": "low",
            "sources": []
        }


    result["query"] = query

    return result


# Backend-friendly alias
get_copilot_response = copilot
