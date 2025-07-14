import os
import json
import psycopg2
from psycopg2 import extras

def get_db_connection():
    """Establishes a connection to the CockroachDB database."""
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

def lambda_handler(event, context):
    """
    Main Lambda function handler.
    Routes requests to the appropriate function based on the HTTP method and path.
    """
    print(f"Received event: {json.dumps(event)}")

    # Handle pre-flight CORS requests
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': ''
        }

    try:
        resource = event.get('resource')
        http_method = event.get('httpMethod')
        path_parameters = event.get('pathParameters', {})
        body = event.get('body')

        # Route the request to the appropriate handler
        if resource == '/account' and http_method == 'POST':
            response = create_account(json.loads(body))
        elif resource == '/account' and http_method == 'GET':
            response = get_all_accounts()
        elif resource == '/account/{id}' and http_method == 'GET':
            response = get_account_by_id(path_parameters.get('id'))
        elif resource == '/trade' and http_method == 'POST':
            response = create_trade(json.loads(body))
        elif resource == '/trade' and http_method == 'GET':
            response = get_all_trades()
        elif resource == '/trade/{id}' and http_method == 'GET':
            response = get_trade_by_id(path_parameters.get('id'))
        elif resource == '/analytics/{account_id}' and http_method == 'GET':
            response = get_analytics(path_parameters.get('account_id'))
        else:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
                'body': json.dumps({'message': 'Not Found'})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps(response, default=str) # Use default=str to handle UUIDs, decimals, etc.
        }

    except Exception as e:
        print(f"Error processing request: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            'body': json.dumps({'message': 'Internal Server Error'})
        }

# --- Handler Functions ---

def create_account(account_data):
    """Creates a new trading account."""
    sql = """
        INSERT INTO trading_accounts (name, currency, initial_balance, current_balance)
        VALUES (%s, %s, %s, %s) RETURNING id;
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                account_data['name'],
                account_data['currency'],
                account_data['initial_balance'],
                account_data['initial_balance'] # Current balance starts as initial balance
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
    return {'message': 'Account created successfully', 'id': new_id}

def get_all_accounts():
    """Retrieves all trading accounts."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM trading_accounts ORDER BY created_at DESC;")
            accounts = cur.fetchall()
    return accounts

def get_account_by_id(account_id):
    """Retrieves a single trading account by its ID."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM trading_accounts WHERE id = %s;", (account_id,))
            account = cur.fetchone()
    if account is None:
        raise Exception(f"Account with ID {account_id} not found.")
    return account

def create_trade(trade_data):
    """Creates a new trade for a given account."""
    sql = """
        INSERT INTO trades (account_id, currency_pair, direction, rationale, outcome, profit_loss, retrospective)
        VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                trade_data['account_id'],
                trade_data['currency_pair'],
                trade_data['direction'],
                trade_data['rationale'],
                trade_data.get('outcome', 'OPEN'),
                trade_data.get('profit_loss'),
                trade_data.get('retrospective')
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
    return {'message': 'Trade created successfully', 'id': new_id}

def get_all_trades():
    """Retrieves all trades."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM trades ORDER BY created_at DESC;")
            trades = cur.fetchall()
    return trades

def get_trade_by_id(trade_id):
    """Retrieves a single trade by its ID."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM trades WHERE id = %s;", (trade_id,))
            trade = cur.fetchone()
    if trade is None:
        raise Exception(f"Trade with ID {trade_id} not found.")
    return trade

def get_analytics(account_id):
    """Retrieves analytics for a given account."""
    # This is a placeholder for a more complex analytics query.
    # You can expand this to calculate win rates, total P/L, etc.
    sql = """
        SELECT
            outcome,
            COUNT(*) as trade_count,
            SUM(profit_loss) as total_pl
        FROM trades
        WHERE account_id = %s
        GROUP BY outcome;
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            cur.execute(sql, (account_id,))
            analytics = cur.fetchall()
    return analytics
