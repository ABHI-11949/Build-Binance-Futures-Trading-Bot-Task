from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
from dotenv import load_dotenv
import logging
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Import our trading bot modules
from bot.client import BinanceFuturesClient
from bot.orders import OrderManager
from bot.logging_config import setup_logging

# Setup logging
logger = setup_logging()

app = Flask(__name__, static_folder='../frontend')
CORS(app)  # Enable CORS for all routes

# Global variables
client = None
order_manager = None

def initialize_client():
    """Initialize Binance client with environment variables"""
    global client, order_manager
    
    api_key = os.getenv('BINANCE_API_KEY')
    api_secret = os.getenv('BINANCE_API_SECRET')
    
    if not api_key or not api_secret:
        logger.error("API credentials not found in environment variables")
        return False
    
    try:
        client = BinanceFuturesClient(api_key, api_secret, testnet=True)
        order_manager = OrderManager(client)
        logger.info("Binance client initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize client: {str(e)}")
        return False

# Initialize client on startup
initialize_client()

@app.route('/')
def serve_frontend():
    """Serve the main frontend page"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory(app.static_folder, path)

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Trading Bot API is running',
        'connected': client is not None
    })

@app.route('/api/connect', methods=['POST'])
def test_connection():
    """Test connection to Binance"""
    try:
        if client and client.test_connectivity():
            account_info = client.get_account_info()
            return jsonify({
                'status': 'success',
                'message': 'Connected to Binance Futures Testnet',
                'account': {
                    'total_balance': account_info.get('totalWalletBalance'),
                    'available_balance': account_info.get('availableBalance'),
                    'account_type': account_info.get('accountType')
                }
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to connect to Binance'
            }), 500
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/place-order', methods=['POST'])
def place_order():
    """Place a new order"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['symbol', 'side', 'order_type', 'quantity']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        symbol = data['symbol']
        side = data['side']
        order_type = data['order_type']
        quantity = float(data['quantity'])
        price = float(data['price']) if data.get('price') else None
        
        # Validate order type
        if order_type.upper() not in ['MARKET', 'LIMIT']:
            return jsonify({
                'status': 'error',
                'message': 'Invalid order type. Must be MARKET or LIMIT'
            }), 400
        
        # Validate side
        if side.upper() not in ['BUY', 'SELL']:
            return jsonify({
                'status': 'error',
                'message': 'Invalid side. Must be BUY or SELL'
            }), 400
        
        # Place order
        response = order_manager.place_order(
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=price
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Order placed successfully',
            'order': response
        })
        
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Failed to place order: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get order history"""
    try:
        symbol = request.args.get('symbol')
        limit = int(request.args.get('limit', 50))
        
        if client:
            if symbol:
                orders = client.client.futures_get_all_orders(symbol=symbol, limit=limit)
            else:
                orders = client.client.futures_get_all_orders(limit=limit)
            
            return jsonify({
                'status': 'success',
                'orders': orders,
                'count': len(orders)
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to get orders: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """Get specific order details"""
    try:
        symbol = request.args.get('symbol', 'BTCUSDT')
        
        if client:
            order = client.client.futures_get_order(symbol=symbol, orderId=order_id)
            return jsonify({
                'status': 'success',
                'order': order
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to get order: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/orders/<order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    """Cancel an order"""
    try:
        symbol = request.json.get('symbol', 'BTCUSDT')
        
        if client:
            response = client.client.futures_cancel_order(symbol=symbol, orderId=order_id)
            return jsonify({
                'status': 'success',
                'message': 'Order cancelled successfully',
                'response': response
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to cancel order: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/account', methods=['GET'])
def get_account():
    """Get account information"""
    try:
        if client:
            account_info = client.get_account_info()
            
            # Get positions
            positions = client.client.futures_position_information()
            
            # Get open orders
            open_orders = client.client.futures_get_open_orders()
            
            return jsonify({
                'status': 'success',
                'account': account_info,
                'positions': positions,
                'open_orders': open_orders
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to get account info: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/market/tickers', methods=['GET'])
def get_tickers():
    """Get market tickers"""
    try:
        if client:
            tickers = client.client.futures_ticker()
            return jsonify({
                'status': 'success',
                'tickers': tickers
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to get tickers: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/market/depth', methods=['GET'])
def get_depth():
    """Get order book depth"""
    try:
        symbol = request.args.get('symbol', 'BTCUSDT')
        limit = int(request.args.get('limit', 20))
        
        if client:
            depth = client.client.futures_order_book(symbol=symbol, limit=limit)
            return jsonify({
                'status': 'success',
                'depth': depth
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to get depth: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/market/trades', methods=['GET'])
def get_trades():
    """Get recent trades"""
    try:
        symbol = request.args.get('symbol', 'BTCUSDT')
        limit = int(request.args.get('limit', 50))
        
        if client:
            trades = client.client.futures_recent_trades(symbol=symbol, limit=limit)
            return jsonify({
                'status': 'success',
                'trades': trades
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to get trades: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/market/klines', methods=['GET'])
def get_klines():
    """Get candlestick data"""
    try:
        symbol = request.args.get('symbol', 'BTCUSDT')
        interval = request.args.get('interval', '1h')
        limit = int(request.args.get('limit', 100))
        
        if client:
            klines = client.client.futures_klines(
                symbol=symbol,
                interval=interval,
                limit=limit
            )
            return jsonify({
                'status': 'success',
                'klines': klines
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Client not initialized'
            }), 500
    except Exception as e:
        logger.error(f"Failed to get klines: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/config', methods=['GET', 'POST'])
def config():
    """Get or update configuration"""
    if request.method == 'GET':
        return jsonify({
            'status': 'success',
            'config': {
                'api_key': os.getenv('BINANCE_API_KEY', ''),
                'api_secret': os.getenv('BINANCE_API_SECRET', ''),
                'testnet': True
            }
        })
    else:
        # POST - Update configuration
        data = request.json
        
        # In production, you would save these securely
        # For this example, we'll just update environment variables
        if 'api_key' in data:
            os.environ['BINANCE_API_KEY'] = data['api_key']
        if 'api_secret' in data:
            os.environ['BINANCE_API_SECRET'] = data['api_secret']
        
        # Reinitialize client with new credentials
        initialize_client()
        
        return jsonify({
            'status': 'success',
            'message': 'Configuration updated'
        })
@app.route('/api/test-connection', methods=['GET'])
def alias_test_connection():
    return test_connection()  # call the POST /api/connect function


@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Get recent logs"""
    try:
        # Find the latest log file
        log_dir = Path('logs')
        if not log_dir.exists():
            return jsonify({
                'status': 'success',
                'logs': []
            })
        
        log_files = list(log_dir.glob('*.log'))
        if not log_files:
            return jsonify({
                'status': 'success',
                'logs': []
            })
        
        latest_log = max(log_files, key=lambda x: x.stat().st_mtime)
        
        with open(latest_log, 'r') as f:
            lines = f.readlines()[-100:]  # Last 100 lines
        
        logs = []
        for line in lines:
            parts = line.strip().split(' - ', 3)
            if len(parts) >= 4:
                logs.append({
                    'timestamp': parts[0],
                    'logger': parts[1],
                    'level': parts[2],
                    'message': parts[3]
                })
        
        return jsonify({
            'status': 'success',
            'logs': logs
        })
    except Exception as e:
        logger.error(f"Failed to get logs: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def server_error(error):
    logger.error(f"Server error: {str(error)}")
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('logs', exist_ok=True)
    os.makedirs('frontend', exist_ok=True)
    
    print("=" * 60)
    print("Trading Bot API Server")
    print("=" * 60)
    print(f"Frontend: http://localhost:5000")
    print(f"API Base: http://localhost:5000/api")
    print(f"Health Check: http://localhost:5000/api/health")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)