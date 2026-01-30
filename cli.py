#!/usr/bin/env python3
#!/usr/bin/env python3
import click
import os
from dotenv import load_dotenv
import logging

from bot.client import BinanceFuturesClient
from bot.orders import OrderManager
from bot.validators import OrderValidator
from bot.logging_config import setup_logging

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logging()



@click.group()
def cli():
    """Trading Bot for Binance Futures Testnet"""
    pass

@cli.command()
@click.option('--symbol', required=True, help='Trading symbol (e.g., BTCUSDT)')
@click.option('--side', required=True, type=click.Choice(['BUY', 'SELL']), 
              help='Order side')
@click.option('--type', 'order_type', required=True, 
              type=click.Choice(['MARKET', 'LIMIT']), help='Order type')
@click.option('--quantity', required=True, type=float, help='Order quantity')
@click.option('--price', type=float, help='Price (required for LIMIT orders)')
@click.option('--api-key', envvar='BINANCE_API_KEY', help='Binance API key')
@click.option('--api-secret', envvar='BINANCE_API_SECRET', help='Binance API secret')
def place_order(symbol, side, order_type, quantity, price, api_key, api_secret):
    """Place a new order on Binance Futures Testnet"""
    
    # Validate inputs
    click.echo("🔍 Validating inputs...")
    
    if not OrderValidator.validate_symbol(symbol):
        click.echo("Invalid symbol format")
        return
    
    if order_type == 'LIMIT' and price is None:
        click.echo("Price is required for LIMIT orders")
        return
    
    if not api_key or not api_secret:
        click.echo(" API credentials not found. Set BINANCE_API_KEY and BINANCE_API_SECRET")
        click.echo("   or use --api-key and --api-secret options")
        return
    
    # Initialize client
    try:
        click.echo("🔗 Connecting to Binance Futures Testnet...")
        client = BinanceFuturesClient(api_key, api_secret, testnet=True)
        
        # Test connectivity
        if not client.test_connectivity():
            click.echo("Failed to connect to Binance Futures")
            return
        
        click.echo(" Connected successfully")
        
        # Initialize order manager
        order_manager = OrderManager(client)
        
        # Display order summary
        click.echo(" Order Summary:")
        click.echo(f"   Symbol: {symbol}")
        click.echo(f"   Side: {side}")
        click.echo(f"   Type: {order_type}")
        click.echo(f"   Quantity: {quantity}")
        if price:
            click.echo(f"   Price: {price}")
        
        # Confirm placement
        if not click.confirm("\n  Place this order?"):
            click.echo("Order cancelled")
            return
        
        # Place the order
        click.echo("\n Placing order...")
        response = order_manager.place_order(
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=quantity,
            price=price
        )
        
        # Display results
        click.echo("\n Order Placed Successfully!")
        click.echo(" Order Details:")
        click.echo(f"   Order ID: {response.get('orderId')}")
        click.echo(f"   Status: {response.get('status')}")
        click.echo(f"   Executed Qty: {response.get('executedQty', 0)}")
        click.echo(f"   Avg Price: {response.get('avgPrice', 'N/A')}")
        click.echo(f"   Client Order ID: {response.get('clientOrderId')}")
        
    except Exception as e:
        click.echo(f"Error: {str(e)}")
        logger.error(f"Order placement failed: {e}")

@cli.command()
@click.option('--api-key', envvar='BINANCE_API_KEY', help='Binance API key')
@click.option('--api-secret', envvar='BINANCE_API_SECRET', help='Binance API secret')
def test_connection(api_key, api_secret):
    """Test connection to Binance Futures Testnet"""
    
    if not api_key or not api_secret:
        click.echo(" API credentials not found")
        return
    
    try:
        client = BinanceFuturesClient(api_key, api_secret, testnet=True)
        
        if client.test_connectivity():
            click.echo("Connection successful!")
            
            # Get account info
            account_info = client.get_account_info()
            click.echo(f"\n Account Information:")
            click.echo(f"   Account Type: {account_info.get('accountType')}")
            click.echo(f"   Total Wallet Balance: {account_info.get('totalWalletBalance')} USDT")
            click.echo(f"   Available Balance: {account_info.get('availableBalance')} USDT")
        else:
            click.echo(" Connection failed")
            
    except Exception as e:
        click.echo(f"Error: {str(e)}")

@cli.command()
@click.option('--symbol', required=True, help='Trading symbol (e.g., BTCUSDT)')
@click.option('--api-key', envvar='BINANCE_API_KEY', help='Binance API key')
@click.option('--api-secret', envvar='BINANCE_API_SECRET', help='Binance API secret')
def symbol_info(symbol, api_key, api_secret):
    """Get information about a trading symbol"""
    
    if not api_key or not api_secret:
        click.echo(" API credentials not found")
        return
    
    try:
        client = BinanceFuturesClient(api_key, api_secret, testnet=True)
        info = client.get_symbol_info(symbol)
        
        click.echo(f"\n Symbol Information for {symbol}:")
        click.echo(f"   Base Asset: {info.get('baseAsset')}")
        click.echo(f"   Quote Asset: {info.get('quoteAsset')}")
        click.echo(f"   Status: {info.get('status')}")
        
        # Display filters
        click.echo("\n  Filters:")
        for filter_info in info.get('filters', []):
            if filter_info['filterType'] == 'PRICE_FILTER':
                click.echo(f"   Price Filter:")
                click.echo(f"     Min Price: {filter_info['minPrice']}")
                click.echo(f"     Max Price: {filter_info['maxPrice']}")
                click.echo(f"     Tick Size: {filter_info['tickSize']}")
            elif filter_info['filterType'] == 'LOT_SIZE':
                click.echo(f"   Lot Size:")
                click.echo(f"     Min Qty: {filter_info['minQty']}")
                click.echo(f"     Max Qty: {filter_info['maxQty']}")
                click.echo(f"     Step Size: {filter_info['stepSize']}")
                
    except Exception as e:
        click.echo(f"Error: {str(e)}")

if __name__ == '__main__':
    cli()