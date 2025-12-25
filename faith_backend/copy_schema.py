import psycopg2
import sys

# Railway connection
railway_conn = psycopg2.connect(
    "postgresql://postgres:EQnOgRPMvZTtyDhlUHOcgpNSsVXwYOtR@centerbeam.proxy.rlwy.net:22007/railway"
)

# Local connection
local_conn = psycopg2.connect(
    "postgresql://postgres:faithconnect_dev_password@localhost:5432/faithconnect"
)

print("Connected to both databases")

# Get all table schemas from Railway
railway_cur = railway_conn.cursor()
local_cur = local_conn.cursor()

# Get all tables
railway_cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
""")

tables = railway_cur.fetchall()
print(f"Found {len(tables)} tables to copy")

for (table_name,) in tables:
    print(f"Copying schema for: {table_name}")
    
    # Get CREATE TABLE statement
    railway_cur.execute(f"""
        SELECT 
            'CREATE TABLE IF NOT EXISTS ' || quote_ident(table_name) || ' (' ||
            string_agg(
                quote_ident(column_name) || ' ' || 
                data_type ||
                CASE 
                    WHEN character_maximum_length IS NOT NULL 
                    THEN '(' || character_maximum_length || ')'
                    ELSE ''
                END ||
                CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
                ', '
            ) || ');'
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        GROUP BY table_name;
    """)
    
    create_stmt = railway_cur.fetchone()
    if create_stmt:
        try:
            local_cur.execute(create_stmt[0])
            local_conn.commit()
            print(f"  ✓ Created {table_name}")
        except Exception as e:
            print(f"  ✗ Error creating {table_name}: {e}")
            local_conn.rollback()

# Copy indexes, constraints, sequences
print("\nCopying sequences...")
railway_cur.execute("""
    SELECT sequence_name FROM information_schema.sequences 
    WHERE sequence_schema = 'public';
""")
sequences = railway_cur.fetchall()
for (seq_name,) in sequences:
    try:
        railway_cur.execute(f"SELECT last_value FROM {seq_name};")
        last_val = railway_cur.fetchone()[0]
        local_cur.execute(f"CREATE SEQUENCE IF NOT EXISTS {seq_name} START {last_val};")
        local_conn.commit()
        print(f"  ✓ {seq_name}")
    except Exception as e:
        print(f"  ✗ {seq_name}: {e}")
        local_conn.rollback()

railway_cur.close()
local_cur.close()
railway_conn.close()
local_conn.close()

print("\n✅ Schema import complete!")
