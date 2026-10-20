from backend.repositories.business_repository import BusinessRepository


class FakeQuery:
    def __init__(self, table_name, calls):
        self.table_name = table_name
        self.calls = calls
        self.payload = None

    def insert(self, payload):
        self.payload = payload
        self.calls.append((self.table_name, payload))
        return self

    def execute(self):
        if self.table_name == "businesses":
            return type("Result", (), {"data": [{"id": "new-business", **self.payload}]})()
        return type("Result", (), {"data": []})()


class FakeClient:
    def __init__(self):
        self.calls = []

    def table(self, table_name):
        return FakeQuery(table_name, self.calls)


def test_create_business_defaults_match_retail_demo(monkeypatch):
    import backend.repositories.business_repository as module

    client = FakeClient()
    monkeypatch.setattr(module, "get_supabase_optional", lambda: client)
    monkeypatch.setattr(module, "is_supabase_configured", lambda: True)

    result = BusinessRepository().create_business(
        user_id="user-1",
        business_data={"name": "Test Retail Store"},
    )

    inserted = client.calls[0][1]
    assert inserted["city"] == "Delhi"
    assert inserted["state"] == "Delhi"
    assert inserted["sector"] == "Retail"
    assert inserted["annual_revenue"] == 0
    assert result["role"] == "OWNER"
