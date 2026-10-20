
import os
import pandas as pd


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(BASE_DIR)

# One canonical notification feed is shared by the Copilot and API fallback.
# Override this path only when an alternate feed is intentionally configured.
NOTIFICATIONS_FILE = os.getenv(
    "UDYAM_NOTIFICATIONS_FILE",
    os.path.join(BACKEND_DIR, "verified_data", "notifications.csv"),
)


def _load_notifications():
    """
    Load notification data from CSV.
    """
    if not os.path.exists(NOTIFICATIONS_FILE):
        return pd.DataFrame()

    return pd.read_csv(NOTIFICATIONS_FILE)


def get_notifications(
    vendor_id=None,
    notification_type=None,
    priority=None,
    unread_only=False
):
    """
    Return notifications for a vendor.

    Parameters
    ----------
    vendor_id : str, optional
        Filter notifications by vendor.

    notification_type : str, optional
        Example:
        'compliance_due'
        'procurement'
        'festival'
        'news'

    priority : str, optional
        HIGH / MEDIUM / LOW

    unread_only : bool
        If True, return only unread notifications.

    Returns
    -------
    list[dict]
        JSON-serializable notification objects.
    """

    df = _load_notifications()

    if df.empty:
        return []

    if vendor_id is not None:
        df = df[
            df["vendor_id"].astype(str) == str(vendor_id)
        ]

    if notification_type is not None:
        df = df[
            df["type"].astype(str) == str(notification_type)
        ]

    if priority is not None:
        df = df[
            df["priority"].astype(str).str.upper()
            == str(priority).upper()
        ]

    if unread_only:
        df = df[
            df["is_read"] == False
        ]

    return df.to_dict(orient="records")


def get_notification_summary(vendor_id=None):
    """
    Return notification counts by type and priority.
    """

    notifications = get_notifications(
        vendor_id=vendor_id
    )

    if not notifications:
        return {
            "total": 0,
            "by_type": {},
            "by_priority": {}
        }

    df = pd.DataFrame(notifications)

    return {
        "total": len(df),
        "by_type": (
            df["type"]
            .value_counts()
            .to_dict()
        ),
        "by_priority": (
            df["priority"]
            .value_counts()
            .to_dict()
        )
    }
