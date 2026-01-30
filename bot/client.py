from binance.client import Client
from binance.exceptions import BinanceAPIException, BinanceOrderException
import logging

logger = logging.getLogger(__name__)

class BinanceFuturesClient:
    """Wrapper for Binance Futures API client"""
    
    def __init__(self, api_key: str, api_secret: str, testnet: bool = True):
        """
        Initialize Binance Futures client
        
        Args:
            api_key: Binance API key
            api_secret: Binance API secret
            testnet: Use testnet (default: True)
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        
        # Initialize client
        self.client = Client(
            api_key=api_key,
            api_secret=api_secret,
            testnet=testnet
        )
        
        # Set futures testnet URL
        if testnet:
            self.client.FUTURES_URL = 'https://testnet.binancefuture.com'
        
        logger.info(f"Binance Futures client initialized (Testnet: {testnet})")
    
    def get_account_info(self):
        """Get futures account information"""
        try:
            account_info = self.client.futures_account()
            logger.info("Account info retrieved successfully")
            return account_info
        except BinanceAPIException as e:
            logger.error(f"Failed to get account info: {e}")
            raise
    
    def get_symbol_info(self, symbol: str):
        """Get symbol information including filters"""
        try:
            exchange_info = self.client.futures_exchange_info()
            for symbol_info in exchange_info['symbols']:
                if symbol_info['symbol'] == symbol:
                    logger.info(f"Symbol info retrieved for {symbol}")
                    return symbol_info
            raise ValueError(f"Symbol {symbol} not found")
        except BinanceAPIException as e:
            logger.error(f"Failed to get symbol info: {e}")
            raise
    
    def test_connectivity(self):
        """Test connection to Binance Futures API"""
        try:
            self.client.futures_ping()
            logger.info("Connection test successful")
            return True
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False