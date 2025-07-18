import os
import json
import psycopg2
from psycopg2 import extras
from datetime import datetime

# Define the CORS headers that will be added to every response
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    "Access-Control-Allow-Credentials": "true"
}

def build_response(status_code, payload):
    return {
        'statusCode': status_code,
        'headers': CORS_HEADERS,
        'body': json.dumps(payload, default=str)
    }

def get_db_connection():
    """Establishes a connection to the CockroachDB database."""
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise

def lambda_handler(event, context):
    # Extract the path and HTTP method using keys for REST API proxy integration
    path = event.get("path")
    method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod")
    query_params = event.get("queryStringParameters") or {}
    path_parameters = event.get("pathParameters") or {}
    body = event.get("body")

    print(f"Received event: {event}")

    if body:
        try:
            body = json.loads(body)
        except Exception:
            body = None

    # Handle OPTIONS (preflight) request
    if method == "OPTIONS":
        return build_response(200, {})

    try:
        # /account endpoints
        if path == "/account" and method == "POST":
            if not body:
                return build_response(400, {"error": "Missing request body"})
            response = create_account(body)
            return build_response(200, response)
        
        elif path == "/account" and method == "GET":
            response = get_all_accounts()
            return build_response(200, response)
        
        elif path and path.startswith("/account/") and method == "GET":
            account_id = path_parameters.get('id') or path.split('/')[-1]
            response = get_account_by_id(account_id)
            return build_response(200, response)
        
        # /trade endpoints
        elif path == "/trade" and method == "POST":
            if not body:
                return build_response(400, {"error": "Missing request body"})
            response = create_trade(body)
            return build_response(200, response)
        
        elif path == "/trade" and method == "GET":
            trade_id = query_params.get('id')
            if trade_id:
                response = get_trade_by_id(trade_id)
            else:
                response = get_all_trades()
            return build_response(200, response)
        
        elif path == "/trade" and method == "PATCH":
            if not body:
                return build_response(400, {"error": "Missing request body"})
            trade_id = query_params.get('id')
            if not trade_id:
                return build_response(400, {"error": "Missing trade id in query parameters"})
            response = update_trade(trade_id, body)
            return build_response(200, response)
        
        # /analytics endpoints
        elif path and path.startswith("/analytics/") and method == "GET":
            account_id = path_parameters.get('account_id') or path.split('/')[-1]
            response = get_analytics(account_id)
            return build_response(200, response)
        
        # /health endpoint
        elif path == "/health" and method == "GET":
            try:
                # Simple health check - test database connection
                with get_db_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1")
                return build_response(200, {"status": {"server": "OK", "database": "OK"}})
            except Exception as e:
                return build_response(503, {"status": "NOTOK", "message": str(e)})
        
        # Fallback: endpoint not found
        else:
            return build_response(404, {"error": "Endpoint not found"})
    
    except Exception as e:
        print(f"Error processing request: {e}")
        return build_response(500, {"error": "Internal Server Error", "message": str(e)})

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
        INSERT INTO trades (account_id, created_at, currency_pair, direction, rationale, outcome, profit_loss, retrospective, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_DATE) RETURNING id;
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (
                trade_data['account_id'],
                trade_data['created_at'],
                trade_data['currency_pair'],
                trade_data['direction'],
                trade_data['rationale'],
                trade_data.get('outcome', 'OPEN'),
                trade_data.get('profit_loss', 0),
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

def update_trade(trade_id, trade_data):
    """Updates an existing trade and recalculates account balance."""
    # First get the account_id from the trade being updated
    get_account_sql = "SELECT account_id FROM trades WHERE id = %s;"
    
    update_sql = """
        UPDATE trades
        SET 
            currency_pair = %s,
            direction = %s,
            rationale = %s,
            outcome = %s,
            profit_loss = %s,
            retrospective = %s,
            updated_at = now()
        WHERE id = %s;
    """
    
    # Recalculate account balance based on all trades for this account
    balance_update_sql = """
        UPDATE trading_accounts 
        SET current_balance = initial_balance + COALESCE(
            (SELECT SUM(profit_loss) 
             FROM trades 
             WHERE account_id = %s AND profit_loss IS NOT NULL), 
            0
        )
        WHERE id = %s;
    """
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Get the account_id
            cur.execute(get_account_sql, (trade_id,))
            result = cur.fetchone()
            if not result:
                raise Exception(f"Trade with ID {trade_id} not found.")
            account_id = result[0]
            
            # Update the trade
            cur.execute(update_sql, (
                trade_data['currency_pair'],
                trade_data['direction'],
                trade_data['rationale'],
                trade_data.get('outcome', 'OPEN'),
                trade_data.get('profit_loss', 0),
                trade_data.get('retrospective'),
                trade_id
            ))
            
            # Recalculate and update the account balance
            cur.execute(balance_update_sql, (account_id, account_id))
            
            conn.commit()
    return {'message': f'Trade {trade_id} updated successfully and account balance recalculated'}

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
