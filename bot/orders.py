from binance.exceptions import BinanceAPIException, BinanceOrderException
import logging
from .validators import OrderValidator

logger = logging.getLogger(__name__)

class OrderManager:
    """Manages order placement and tracking"""
    
    def __init__(self, client):
        self.client = client
    
    def place_order(self, symbol: str, side: str, order_type: str, 
                   quantity: float, price: float = None, **kwargs):
        """
        Place an order on Binance Futures
        
        Args:
            symbol: Trading pair (e.g., BTCUSDT)
            side: BUY or SELL
            order_type: MARKET or LIMIT
            quantity: Order quantity
            price: Required for LIMIT orders
            **kwargs: Additional order parameters
        
        Returns:
            dict: Order response from Binance
        """
        # Log order request
        logger.info(f"Placing order: {symbol} {side} {order_type} "
                   f"qty={quantity}, price={price}")
        
        try:
            # Validate inputs
            if not OrderValidator.validate_symbol(symbol):
                raise ValueError(f"Invalid symbol: {symbol}")
            
            if not OrderValidator.validate_side(side):
                raise ValueError(f"Invalid side: {side}")
            
            if not OrderValidator.validate_order_type(order_type):
                raise ValueError(f"Invalid order type: {order_type}")
            
            # Get symbol info for validation
            symbol_info = self.client.get_symbol_info(symbol)
            
            if not OrderValidator.validate_quantity(quantity, symbol_info):
                raise ValueError(f"Invalid quantity: {quantity}")
            
            # Prepare order parameters
            order_params = {
                'symbol': symbol,
                'side': side.upper(),
                'type': order_type.upper(),
                'quantity': quantity
            }
            
            # Add price for LIMIT orders
            if order_type.upper() == 'LIMIT':
                if price is None:
                    raise ValueError("Price is required for LIMIT orders")
                
                if not OrderValidator.validate_price(price, order_type, symbol_info):
                    raise ValueError(f"Invalid price: {price}")
                
                order_params['price'] = price
                order_params['timeInForce'] = 'GTC'  # Good Till Canceled
            
            # Add any additional parameters
            order_params.update(kwargs)
            
            # Place the order
            response = self.client.client.futures_create_order(**order_params)
            
            # Log successful order
            logger.info(f"Order placed successfully: {response}")
            
            return response
            
        except BinanceAPIException as e:
            logger.error(f"Binance API error: {e.status_code} - {e.message}")
            raise
        except BinanceOrderException as e:
            logger.error(f"Binance order error: {e.status_code} - {e.message}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error placing order: {e}")
            raise
    
    def get_order_status(self, symbol: str, order_id: int):
        """Get status of a specific order"""
        try:
            order_status = self.client.client.futures_get_order(
                symbol=symbol,
                orderId=order_id
            )
            logger.info(f"Order status retrieved: {order_id}")
            return order_status
        except BinanceAPIException as e:
            logger.error(f"Failed to get order status: {e}")
            raise
    
    def cancel_order(self, symbol: str, order_id: int):
        """Cancel an existing order"""
        try:
            response = self.client.client.futures_cancel_order(
                symbol=symbol,
                orderId=order_id
            )
            logger.info(f"Order cancelled: {order_id}")
            return response
        except BinanceAPIException as e:
            logger.error(f"Failed to cancel order: {e}")
            raise