import sqlite3
from pathlib import Path

db_path = Path("crypto_trace.db")
if db_path.exists():
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cols = [
        ("source_api", "TEXT DEFAULT 'blockchain_explorer'"),
        ("ingested_at", "DATETIME")
    ]
    for col_name, col_type in cols:
        try:
            cur.execute(f"ALTER TABLE transactions ADD COLUMN {col_name} {col_type};")
            print(f"Added column {col_name}")
        except Exception as e:
            print(f"Column {col_name}: {e}")
    conn.commit()
    conn.close()
    print("Migration completed.")
