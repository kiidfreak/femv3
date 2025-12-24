import os
import json
import psycopg2
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('DATABASE_URL')
conn = psycopg2.connect(url)
cur = conn.cursor()

def get_columns(table):
    cur.execute("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = %s", (table,))
    return [{"name": row[0], "type": row[1], "nullable": row[2]} for row in cur.fetchall()]

tables_to_dump = ['business_business', 'user_user', 'business_category', 'business_review', 'business_service']
schema = {}

for t in tables_to_dump:
    schema[t] = get_columns(t)

with open('schema_dump.json', 'w') as f:
    json.dump(schema, f, indent=2)

conn.close()
print("Schema dump complete")
