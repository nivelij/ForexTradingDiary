import os
import json
import psycopg2
import base64
import boto3
import traceback
from psycopg2 import extras
from datetime import datetime
from genai import generate_trading_insights

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
    # Check if this is an SQS event
    if 'Records' in event:
        for record in event['Records']:
            if record.get('eventSource') == 'aws:sqs':
                print(f"SQS message received: {record['body']}")
                try:
                    message_body = json.loads(record['body'])
                    if message_body.get('action') == 'generate':
                        account_id = message_body.get('account_id')
                        if account_id:
                            insights_data = generate_insights(account_id)
                            print(f"Generated insights for account {account_id}: {insights_data}")
                        else:
                            print("No account_id found in SQS message")
                except json.JSONDecodeError:
                    print("Failed to parse SQS message body as JSON")
                except Exception as e:
                    print(f"Error processing SQS message: {e}")
                    traceback.print_exc()
        return {'statusCode': 200}
    
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
        
        # /insights endpoint
        elif path == "/insights" and method == "GET":
            account_id = query_params.get('account_id')
            response = get_insights(account_id)
            return build_response(200, response)
        
        elif path == "/insights" and method == "PUT":
            account_id = query_params.get('account_id')
            if not account_id:
                return build_response(400, {"error": "Missing account_id in query parameters"})
            response = generate_insights_event(account_id)
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
    """Creates a new trade for a given account and handles screenshots."""
    screenshots = trade_data.pop('screenshots', [])

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

            if screenshots:
                screenshot_sql = """
                    INSERT INTO trade_screenshots (trade_id, image_data, mime_type)
                    VALUES (%s, %s, %s);
                """
                for screenshot_b64 in screenshots:
                    try:
                        header, encoded = screenshot_b64.split(',', 1)
                        mime_type = header.split(';')[0].split(':')[1]
                        image_data = base64.b64decode(encoded)
                        cur.execute(screenshot_sql, (new_id, image_data, mime_type))
                    except Exception as e:
                        print(f"Error processing screenshot: {e}")

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
    """Retrieves a single trade by its ID, including screenshots."""
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            # Get trade details
            cur.execute("SELECT * FROM trades WHERE id = %s;", (trade_id,))
            trade = cur.fetchone()

            if trade is None:
                raise Exception(f"Trade with ID {trade_id} not found.")

            # Get screenshots
            cur.execute("SELECT image_data, mime_type FROM trade_screenshots WHERE trade_id = %s;", (trade_id,))
            screenshots_data = cur.fetchall()

            screenshots = []
            for record in screenshots_data:
                image_base64 = base64.b64encode(record['image_data']).decode('utf-8')
                screenshots.append(f"data:{record['mime_type']};base64,{image_base64}")

            trade['screenshots'] = screenshots

    return trade

def get_insights(account_id):
    """Retrieves insights for a given account."""
    get_insights_sql = "SELECT advice FROM trading_insights WHERE account_id = %s;"

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(get_insights_sql, (account_id,))
            insight = cur.fetchone()

    insights = {
        "advice": insight[0] if insight else "No insights available."
    }

    return insights


def update_trade(trade_id, trade_data):
    """Updates an existing trade, handles screenshots, and recalculates account balance."""
    screenshots = trade_data.pop('screenshots', [])

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
        SET current_balance = current_balance + %s
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
            profit_loss = trade_data.get('profit_loss', None)

            # Update the trade
            cur.execute(update_sql, (
                trade_data['currency_pair'],
                trade_data['direction'],
                trade_data['rationale'],
                trade_data.get('outcome', 'OPEN'),
                profit_loss,
                trade_data.get('retrospective'),
                trade_id
            ))

            # Handle screenshots
            if screenshots:
                # Then, insert the new ones
                screenshot_sql = """
                    INSERT INTO trade_screenshots (trade_id, image_data, mime_type)
                    VALUES (%s, %s, %s);
                """
                for screenshot_b64 in screenshots:
                    try:
                        header, encoded = screenshot_b64.split(',', 1)
                        mime_type = header.split(';')[0].split(':')[1]
                        image_data = base64.b64decode(encoded)
                        cur.execute(screenshot_sql, (trade_id, image_data, mime_type))
                    except Exception as e:
                        print(f"Error processing screenshot: {e}")
            
            # Recalculate and update the account balance
            if profit_loss is not None:
                cur.execute(balance_update_sql, (profit_loss, account_id))
            
            conn.commit()
            
            # Generate insights when profit_loss is provided
            if profit_loss is not None:
                try:
                    generate_insights_event(account_id)
                except Exception as e:
                    print(f"Warning: Failed to generate insights: {e}")
                    
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

def generate_insights(account_id):
    """Query trade data and format for insights generation."""
    sql = """
        SELECT currency_pair, rationale, retrospective, outcome 
        FROM trades 
        WHERE rationale <> '' 
        AND retrospective <> '' 
        AND account_id = %s 
        ORDER BY updated_at DESC
    """
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (account_id,))
            trades = cur.fetchall()
    
    formatted_data = []
    for trade in trades:
        formatted_data.append([trade[0], trade[1], trade[2], trade[3]])
    
    insights = generate_trading_insights(json.dumps(formatted_data))
    
    # Insert or update the insights in trading_insights table
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Check if record exists
            cur.execute("SELECT account_id FROM trading_insights WHERE account_id = %s;", (account_id,))
            exists = cur.fetchone()
            
            if exists:
                # Update existing record
                cur.execute("UPDATE trading_insights SET advice = %s WHERE account_id = %s;", (insights, account_id))
            else:
                # Insert new record
                cur.execute("INSERT INTO trading_insights (account_id, advice) VALUES (%s, %s);", (account_id, insights))
            
            conn.commit()
    
    return insights

def generate_insights_event(account_id):
    """Sends insights data to SQS queue."""
    try:
        sqs = boto3.client('sqs', region_name='eu-central-1')
        queue_url = 'https://sqs.eu-central-1.amazonaws.com/177078044036/TradingInsightsQueue'
        
        response = sqs.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps({
                "action": "generate",
                "account_id": account_id
            }, default=str)
        )
        
        return {'message': 'Insights sent to SQS successfully', 'messageId': response['MessageId']}
    except Exception as e:
        print(f"Error sending message to SQS: {e}")
        raise Exception(f"Failed to send insights to SQS: {str(e)}")
