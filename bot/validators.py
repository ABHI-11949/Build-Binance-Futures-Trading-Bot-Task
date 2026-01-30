import re
import logging

logger = logging.getLogger(__name__)

class OrderValidator:
    """Validator for order parameters"""
    
    @staticmethod
    def validate_symbol(symbol: str) -> bool:
        """Validate symbol format (e.g., BTCUSDT)"""
        pattern = r'^[A-Z]{3,10}[A-Z]{3,10}$'
        if not re.match(pattern, symbol):
            logger.error(f"Invalid symbol format: {symbol}")
            return False
        return True
    
    @staticmethod
    def validate_side(side: str) -> bool:
        """Validate order side"""
        valid_sides = ['BUY', 'SELL']
        if side.upper() not in valid_sides:
            logger.error(f"Invalid side: {side}. Must be one of {valid_sides}")
            return False
        return True
    
    @staticmethod
    def validate_order_type(order_type: str) -> bool:
        """Validate order type"""
        valid_types = ['MARKET', 'LIMIT']
        if order_type.upper() not in valid_types:
            logger.error(f"Invalid order type: {order_type}. Must be one of {valid_types}")
            return False
        return True
    
    @staticmethod
    def validate_quantity(quantity: float, symbol_info: dict = None) -> bool:
        """Validate order quantity"""
        if quantity <= 0:
            logger.error(f"Quantity must be positive: {quantity}")
            return False
        
        if symbol_info:
            # Check against symbol filters if provided
            for filter_info in symbol_info['filters']:
                if filter_info['filterType'] == 'LOT_SIZE':
                    min_qty = float(filter_info['minQty'])
                    max_qty = float(filter_info['maxQty'])
                    step_size = float(filter_info['stepSize'])
                    
                    if quantity < min_qty:
                        logger.error(f"Quantity below minimum: {quantity} < {min_qty}")
                        return False
                    if quantity > max_qty:
                        logger.error(f"Quantity above maximum: {quantity} > {max_qty}")
                        return False
                    
                    # Check step size
                    remainder = (quantity - min_qty) % step_size
                    if remainder > 1e-10:  # Allow for floating point precision
                        logger.error(f"Quantity must be multiple of step size: {step_size}")
                        return False
        
        return True
    
    @staticmethod
    def validate_price(price: float, order_type: str, symbol_info: dict = None) -> bool:
        """Validate order price"""
        if order_type.upper() == 'LIMIT':
            if price <= 0:
                logger.error(f"Price must be positive for LIMIT orders: {price}")
                return False
            
            if symbol_info:
                # Check price filter if provided
                for filter_info in symbol_info['filters']:
                    if filter_info['filterType'] == 'PRICE_FILTER':
                        min_price = float(filter_info['minPrice'])
                        max_price = float(filter_info['maxPrice'])
                        tick_size = float(filter_info['tickSize'])
                        
                        if price < min_price:
                            logger.error(f"Price below minimum: {price} < {min_price}")
                            return False
                        if price > max_price:
                            logger.error(f"Price above maximum: {price} > {max_price}")
                            return False
                        
                        # Check tick size
                        remainder = (price - min_price) % tick_size
                        if remainder > 1e-10:
                            logger.error(f"Price must be multiple of tick size: {tick_size}")
                            return False
        
        return True