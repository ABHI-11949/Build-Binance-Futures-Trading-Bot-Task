// Trading Bot Frontend JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentPage = window.location.pathname.split('/').pop();
    let marketDataInterval;
    let selectedOrders = new Set();

    // Initialize based on current page
    initializePage();

    // Page-specific initialization
    function initializePage() {
        switch(currentPage) {
            case 'index.html':
            case '':
                initializeHomePage();
                break;
            case 'dashboard.html':
                initializeDashboard();
                break;
            case 'orders.html':
                initializeOrdersPage();
                break;
            case 'settings.html':
                initializeSettingsPage();
                break;
        }

        // Common initialization
        initializeCommon();
    }

    // Common initialization for all pages
    function initializeCommon() {
        // Initialize toast
        initializeToast();
        
        // Initialize navigation
        initializeNavigation();
        
        // Set up event listeners
        setupEventListeners();
    }

    // Toast Notification System
    function initializeToast() {
        window.showToast = function(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMessage = toast.querySelector('.toast-message');
            const toastIcon = toast.querySelector('i');
            
            toastMessage.textContent = message;
            
            // Set icon based on type
            switch(type) {
                case 'success':
                    toastIcon.className = 'fas fa-check-circle';
                    toastIcon.style.color = 'var(--success)';
                    break;
                case 'error':
                    toastIcon.className = 'fas fa-times-circle';
                    toastIcon.style.color = 'var(--danger)';
                    break;
                case 'warning':
                    toastIcon.className = 'fas fa-exclamation-triangle';
                    toastIcon.style.color = 'var(--warning)';
                    break;
                case 'info':
                    toastIcon.className = 'fas fa-info-circle';
                    toastIcon.style.color = 'var(--info)';
                    break;
            }
            
            toast.classList.add('active');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                toast.classList.remove('active');
            }, 5000);
        };
        
        // Close toast on button click
        document.querySelector('.toast-close')?.addEventListener('click', function() {
            document.getElementById('toast').classList.remove('active');
        });
    }

    // Navigation
    function initializeNavigation() {
        // Highlight current page in navigation
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href) || 
                (currentPath.endsWith('/') && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Event Listeners Setup
    function setupEventListeners() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
    }

    // Home Page Functions
    function initializeHomePage() {
        // Test connection button
        document.getElementById('testConnectionBtn')?.addEventListener('click', function() {
            showToast('Testing connection to Binance Testnet...', 'info');
            
            // Simulate API connection test
            setTimeout(() => {
                const success = Math.random() > 0.2; // 80% success rate
                if (success) {
                    showToast('✅ Connected to Binance Testnet successfully!', 'success');
                } else {
                    showToast('❌ Failed to connect to Binance Testnet', 'error');
                }
            }, 1500);
        });
        
        // View logs button
        document.getElementById('viewLogsBtn')?.addEventListener('click', function() {
            showToast('Opening log viewer...', 'info');
            // In a real app, this would open a log viewer or download logs
        });
        
        // Refresh activities button
        document.getElementById('refreshActivities')?.addEventListener('click', loadRecentActivities);
        
        // Load initial data
        loadRecentActivities();
        loadMarketData();
    }

    // Load recent activities
    function loadRecentActivities() {
        const activityTable = document.getElementById('activityTable');
        if (!activityTable) return;
        
        // Simulated activity data
        const activities = [
            { time: '14:30:25', symbol: 'BTCUSDT', type: 'MARKET', side: 'BUY', quantity: '0.001', price: '$45,230.50', status: 'FILLED' },
            { time: '14:28:10', symbol: 'ETHUSDT', type: 'LIMIT', side: 'SELL', quantity: '0.1', price: '$2,450.75', status: 'OPEN' },
            { time: '14:25:45', symbol: 'BNBUSDT', type: 'MARKET', side: 'BUY', quantity: '1.5', price: '$305.20', status: 'FILLED' },
            { time: '14:20:30', symbol: 'ADAUSDT', type: 'LIMIT', side: 'SELL', quantity: '100', price: '$0.45', status: 'CANCELLED' },
            { time: '14:15:15', symbol: 'XRPUSDT', type: 'MARKET', side: 'BUY', quantity: '50', price: '$0.62', status: 'FILLED' }
        ];
        
        activityTable.innerHTML = activities.map(activity => `
            <tr>
                <td>${activity.time}</td>
                <td><strong>${activity.symbol}</strong></td>
                <td><span class="status-badge status-${activity.status.toLowerCase()}">${activity.type}</span></td>
                <td><span class="${activity.side === 'BUY' ? 'side-buy' : 'side-sell'}">${activity.side}</span></td>
                <td>${activity.quantity}</td>
                <td>${activity.price}</td>
                <td><span class="status-badge status-${activity.status.toLowerCase()}">${activity.status}</span></td>
            </tr>
        `).join('');
        
        showToast('Recent activities loaded', 'success');
    }

    // Load market data
    function loadMarketData() {
        // This would fetch real market data in production
        console.log('Loading market data...');
    }

    // Dashboard Functions
    function initializeDashboard() {
        // Initialize trading form
        initializeTradingForm();
        
        // Initialize market tabs
        initializeMarketTabs();
        
        // Load market data
        loadDashboardData();
        
        // Start market data updates
        startMarketDataUpdates();
    }

    // Initialize trading form
    function initializeTradingForm() {
        const form = document.getElementById('orderForm');
        if (!form) return;
        
        // Order type toggle
        document.querySelectorAll('.type-option').forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                
                // Update active state
                document.querySelectorAll('.type-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                
                // Update hidden input
                document.getElementById('orderType').value = type;
                
                // Update summary
                document.getElementById('summaryType').textContent = type;
                
                // Show/hide price field
                const priceGroup = document.getElementById('priceGroup');
                if (type === 'LIMIT') {
                    priceGroup.classList.remove('hidden');
                    document.getElementById('price').required = true;
                } else {
                    priceGroup.classList.add('hidden');
                    document.getElementById('price').required = false;
                }
                
                // Recalculate estimated cost
                calculateEstimatedCost();
            });
        });
        
        // Side toggle
        document.querySelectorAll('.side-option').forEach(option => {
            option.addEventListener('click', function() {
                const side = this.dataset.side;
                
                // Update active state
                document.querySelectorAll('.side-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                
                // Update hidden input
                document.getElementById('side').value = side;
                
                // Update summary
                document.getElementById('summarySide').textContent = side;
                document.getElementById('summarySide').className = side === 'BUY' ? 'side-buy' : 'side-sell';
                
                // Recalculate estimated cost
                calculateEstimatedCost();
            });
        });
        
        // Symbol change
        document.getElementById('symbol').addEventListener('change', function() {
            const symbol = this.value;
            document.getElementById('summarySymbol').textContent = symbol;
            
            // Simulate fetching current price
            updateCurrentPrice(symbol);
            
            // Recalculate estimated cost
            calculateEstimatedCost();
        });
        
        // Quantity changes
        document.getElementById('quantity').addEventListener('input', function() {
            document.getElementById('summaryQuantity').textContent = this.value;
            calculateEstimatedCost();
        });
        
        // Price changes
        document.getElementById('price')?.addEventListener('input', function() {
            calculateEstimatedCost();
        });
        
        // Quantity presets
        document.querySelectorAll('.btn-preset').forEach(button => {
            button.addEventListener('click', function() {
                const value = this.dataset.value;
                document.getElementById('quantity').value = value;
                document.getElementById('summaryQuantity').textContent = value;
                calculateEstimatedCost();
            });
        });
        
        // Use market price button
        document.getElementById('useMarketPrice')?.addEventListener('click', function() {
            const currentPrice = document.getElementById('currentPrice').textContent.replace('$', '');
            document.getElementById('price').value = currentPrice;
            calculateEstimatedCost();
        });
        
        // Reset form button
        document.getElementById('resetForm')?.addEventListener('click', function() {
            form.reset();
            
            // Reset to defaults
            document.querySelectorAll('.type-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.type === 'MARKET') {
                    opt.classList.add('active');
                }
            });
            document.getElementById('orderType').value = 'MARKET';
            
            document.querySelectorAll('.side-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.side === 'BUY') {
                    opt.classList.add('active');
                }
            });
            document.getElementById('side').value = 'BUY';
            
            updateCurrentPrice('BTCUSDT');
            calculateEstimatedCost();
            
            showToast('Form reset to defaults', 'info');
        });
        
        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const symbol = document.getElementById('symbol').value;
            const orderType = document.getElementById('orderType').value;
            const side = document.getElementById('side').value;
            const quantity = document.getElementById('quantity').value;
            const price = document.getElementById('price')?.value;
            
            // Show confirmation modal
            showOrderConfirmation(symbol, orderType, side, quantity, price);
        });
        
        // Refresh symbols button
        document.getElementById('refreshSymbols')?.addEventListener('click', function() {
            showToast('Refreshing symbol list...', 'info');
        });
        
        // Initialize with default values
        updateCurrentPrice('BTCUSDT');
        calculateEstimatedCost();
    }

    // Calculate estimated cost
    function calculateEstimatedCost() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        let price;
        
        const orderType = document.getElementById('orderType').value;
        if (orderType === 'LIMIT') {
            price = parseFloat(document.getElementById('price').value) || 0;
        } else {
            // For market orders, use current price
            const currentPriceText = document.getElementById('currentPrice').textContent;
            price = parseFloat(currentPriceText.replace(/[^0-9.-]+/g, '')) || 0;
        }
        
        const cost = quantity * price;
        const formattedCost = isNaN(cost) ? '$0' : `$${cost.toFixed(2)}`;
        
        document.getElementById('summaryCost').textContent = formattedCost;
    }

    // Update current price display
    function updateCurrentPrice(symbol) {
        // Simulated price data - in production, this would come from an API
        const prices = {
            'BTCUSDT': 45230.50,
            'ETHUSDT': 2450.75,
            'BNBUSDT': 305.20,
            'ADAUSDT': 0.45,
            'XRPUSDT': 0.62,
            'SOLUSDT': 95.80
        };
        
        const price = prices[symbol] || 0;
        document.getElementById('currentPrice').textContent = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Show order confirmation modal
    function showOrderConfirmation(symbol, type, side, quantity, price) {
        const modal = document.getElementById('orderModal');
        if (!modal) return;
        
        // Update modal content
        document.getElementById('modalSymbol').textContent = symbol;
        document.getElementById('modalType').textContent = type;
        document.getElementById('modalSide').textContent = side;
        document.getElementById('modalSide').className = side === 'BUY' ? 'side-buy' : 'side-sell';
        document.getElementById('modalQuantity').textContent = quantity;
        
        // Calculate estimated cost for modal
        const currentPrice = document.getElementById('currentPrice').textContent.replace('$', '');
        const cost = parseFloat(quantity) * (parseFloat(price) || parseFloat(currentPrice));
        document.getElementById('modalCost').textContent = `$${cost.toFixed(2)}`;
        
        // Show modal
        modal.classList.add('active');
        
        // Confirm order button
        document.getElementById('confirmOrder').onclick = function() {
            placeOrder(symbol, type, side, quantity, price);
            modal.classList.remove('active');
        };
    }

    // Place order (simulated)
    function placeOrder(symbol, type, side, quantity, price) {
        showToast(`Placing ${side} ${type} order for ${quantity} ${symbol}...`, 'info');
        
        // Simulate API call
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                const orderId = Math.floor(Math.random() * 1000000000);
                showToast(`✅ Order placed successfully! Order ID: ${orderId}`, 'success');
                
                // Update open orders list
                updateOpenOrders();
            } else {
                showToast('❌ Failed to place order. Please try again.', 'error');
            }
        }, 2000);
    }

    // Initialize market tabs
    function initializeMarketTabs() {
        document.querySelectorAll('.market-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // Update active tab
                document.querySelectorAll('.market-tab').forEach(t => {
                    t.classList.remove('active');
                });
                this.classList.add('active');
                
                // Show corresponding content
                document.querySelectorAll('.market-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabName + 'Content').classList.add('active');
            });
        });
    }

    // Load dashboard data
    function loadDashboardData() {
        loadPriceTable();
        loadOrderBook();
        loadRecentTrades();
        loadOpenOrders();
        
        // Initialize balance chart
        initializeBalanceChart();
    }

    // Start market data updates
    function startMarketDataUpdates() {
        // Clear any existing interval
        if (marketDataInterval) {
            clearInterval(marketDataInterval);
        }
        
        // Update market data every 5 seconds
        marketDataInterval = setInterval(() => {
            loadPriceTable();
            loadOrderBook();
            loadRecentTrades();
            loadOpenOrders();
        }, 5000);
    }

    // Load price table
    function loadPriceTable() {
        const priceTable = document.getElementById('priceTable');
        if (!priceTable) return;
        
        // Simulated price data
        const prices = [
            { symbol: 'BTCUSDT', price: 45230.50, change: 2.45, volume: '28.5K' },
            { symbol: 'ETHUSDT', price: 2450.75, change: 1.23, volume: '15.2K' },
            { symbol: 'BNBUSDT', price: 305.20, change: -0.56, volume: '8.7K' },
            { symbol: 'ADAUSDT', price: 0.45, change: 3.21, volume: '45.3K' },
            { symbol: 'XRPUSDT', price: 0.62, change: -1.45, volume: '32.1K' },
            { symbol: 'SOLUSDT', price: 95.80, change: 5.67, volume: '12.8K' }
        ];
        
        priceTable.innerHTML = prices.map(item => `
            <tr>
                <td><strong>${item.symbol}</strong></td>
                <td>$${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="${item.change >= 0 ? 'price-up' : 'price-down'}">
                    ${item.change >= 0 ? '+' : ''}${item.change}%
                </td>
                <td>${item.volume}</td>
            </tr>
        `).join('');
    }

    // Load order book
    function loadOrderBook() {
        const asksList = document.getElementById('asksList');
        const bidsList = document.getElementById('bidsList');
        const spreadValue = document.getElementById('spreadValue');
        
        if (!asksList || !bidsList || !spreadValue) return;
        
        // Generate simulated order book data
        let asks = [];
        let bids = [];
        let currentPrice = 45230.50;
        
        for (let i = 0; i < 10; i++) {
            const askPrice = currentPrice * (1 + 0.0005 * (i + 1));
            const bidPrice = currentPrice * (1 - 0.0005 * (i + 1));
            const amount = (Math.random() * 0.5 + 0.1).toFixed(4);
            
            asks.push({ price: askPrice, amount });
            bids.push({ price: bidPrice, amount });
        }
        
        // Render asks (highest price first)
        asksList.innerHTML = asks.sort((a, b) => b.price - a.price).map(item => `
            <div class="order-book-item">
                <span class="price">$${item.price.toFixed(2)}</span>
                <span class="amount">${item.amount}</span>
            </div>
        `).join('');
        
        // Render bids (highest price first)
        bidsList.innerHTML = bids.sort((a, b) => b.price - a.price).map(item => `
            <div class="order-book-item">
                <span class="price">$${item.price.toFixed(2)}</span>
                <span class="amount">${item.amount}</span>
            </div>
        `).join('');
        
        // Calculate spread
        const spread = asks[0].price - bids[0].price;
        spreadValue.textContent = `Spread: $${spread.toFixed(2)}`;
    }

    // Load recent trades
    function loadRecentTrades() {
        const tradesTable = document.getElementById('tradesTable');
        if (!tradesTable) return;
        
        // Simulated trade data
        const trades = [];
        const sides = ['BUY', 'SELL'];
        const now = new Date();
        
        for (let i = 0; i < 10; i++) {
            const price = 45230.50 + (Math.random() - 0.5) * 100;
            const amount = (Math.random() * 0.5 + 0.01).toFixed(4);
            const side = sides[Math.floor(Math.random() * sides.length)];
            const time = new Date(now - i * 60000); // One minute apart
            
            trades.push({
                price: price.toFixed(2),
                amount,
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                side
            });
        }
        
        tradesTable.innerHTML = trades.map(trade => `
            <tr>
                <td>$${trade.price}</td>
                <td>${trade.amount}</td>
                <td>${trade.time}</td>
                <td><span class="${trade.side === 'BUY' ? 'side-buy' : 'side-sell'}">${trade.side}</span></td>
            </tr>
        `).join('');
    }

    // Load open orders
    function loadOpenOrders() {
        const openOrdersList = document.getElementById('openOrdersList');
        if (!openOrdersList) return;
        
        // Simulated open orders
        const openOrders = [
            { symbol: 'BTCUSDT', side: 'BUY', type: 'LIMIT', quantity: '0.005', price: '44,500.00', time: '14:25' },
            { symbol: 'ETHUSDT', side: 'SELL', type: 'LIMIT', quantity: '0.2', price: '2,500.00', time: '14:30' },
            { symbol: 'BNBUSDT', side: 'BUY', type: 'MARKET', quantity: '2.0', price: 'Market', time: '14:35' }
        ];
        
        openOrdersList.innerHTML = openOrders.map(order => `
            <div class="open-order-item">
                <div class="order-info">
                    <div class="order-symbol">${order.symbol}</div>
                    <div class="order-details">
                        ${order.side} ${order.type} • ${order.quantity} @ ${order.price}
                    </div>
                    <div class="order-time">Placed at ${order.time}</div>
                </div>
                <div class="order-actions">
                    <button class="btn-small cancel-order" data-symbol="${order.symbol}">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add cancel event listeners
        document.querySelectorAll('.cancel-order').forEach(button => {
            button.addEventListener('click', function() {
                const symbol = this.dataset.symbol;
                cancelOrder(symbol);
            });
        });
    }

    // Update open orders (for after placing a new order)
    function updateOpenOrders() {
        // In a real app, this would fetch fresh data from the API
        setTimeout(loadOpenOrders, 1000);
    }

    // Cancel order (simulated)
    function cancelOrder(symbol) {
        showToast(`Cancelling order for ${symbol}...`, 'info');
        
        setTimeout(() => {
            showToast(`✅ Order for ${symbol} cancelled successfully`, 'success');
            loadOpenOrders();
        }, 1500);
    }

    // Cancel all orders
    document.getElementById('cancelAllOrders')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel all open orders?')) {
            showToast('Cancelling all open orders...', 'info');
            
            setTimeout(() => {
                showToast('✅ All open orders cancelled successfully', 'success');
                loadOpenOrders();
            }, 2000);
        }
    });

    // Initialize balance chart
    function initializeBalanceChart() {
        const canvas = document.getElementById('balanceChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = 150;
        
        // Simulated balance data
        const data = [8500, 8600, 8450, 8550, 8700, 8650, 8800];
        
        // Draw chart
        drawChart(ctx, data);
    }

    // Draw simple chart
    function drawChart(ctx, data) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 20;
        
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        
        const xStep = (width - 2 * padding) / (data.length - 1);
        const yScale = (height - 2 * padding) / range;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical grid
        for (let i = 0; i <= 4; i++) {
            const x = padding + (width - 2 * padding) * (i / 4);
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
        
        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        data.forEach((value, index) => {
            const x = padding + index * xStep;
            const y = height - padding - (value - min) * yScale;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw area under line
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        
        data.forEach((value, index) => {
            const x = padding + index * xStep;
            const y = height - padding - (value - min) * yScale;
            ctx.lineTo(x, y);
        });
        
        ctx.lineTo(width - padding, height - padding);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(0, 208, 156, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 208, 156, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // Orders Page Functions
    function initializeOrdersPage() {
        // Order search
        document.getElementById('orderSearch')?.addEventListener('input', function() {
            filterOrders();
        });
        
        // Order filter
        document.getElementById('orderFilter')?.addEventListener('change', function() {
            filterOrders();
        });
        
        // Time filter
        document.getElementById('timeFilter')?.addEventListener('change', function() {
            filterOrders();
        });
        
        // Export orders
        document.getElementById('exportOrders')?.addEventListener('click', function() {
            showToast('Exporting orders to CSV...', 'info');
            // In a real app, this would generate and download a CSV file
        });
        
        // Refresh orders
        document.getElementById('refreshOrders')?.addEventListener('click', function() {
            loadOrders();
        });
        
        // Select all checkbox
        document.getElementById('selectAll')?.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.order-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                if (this.checked) {
                    selectedOrders.add(checkbox.dataset.orderId);
                } else {
                    selectedOrders.delete(checkbox.dataset.orderId);
                }
            });
            updateSelectedCount();
            updateCancelSelectedButton();
        });
        
        // Cancel selected orders
        document.getElementById('cancelSelected')?.addEventListener('click', function() {
            if (selectedOrders.size === 0) return;
            
            if (confirm(`Cancel ${selectedOrders.size} selected order(s)?`)) {
                showToast(`Cancelling ${selectedOrders.size} order(s)...`, 'info');
                
                setTimeout(() => {
                    showToast(`✅ ${selectedOrders.size} order(s) cancelled successfully`, 'success');
                    selectedOrders.clear();
                    updateSelectedCount();
                    updateCancelSelectedButton();
                    loadOrders();
                }, 2000);
            }
        });
        
        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', function() {
            const current = parseInt(document.getElementById('currentPage').textContent);
            if (current > 1) {
                goToPage(current - 1);
            }
        });
        
        document.getElementById('nextPage')?.addEventListener('click', function() {
            const current = parseInt(document.getElementById('currentPage').textContent);
            const total = parseInt(document.getElementById('totalPages').textContent);
            if (current < total) {
                goToPage(current + 1);
            }
        });
        
        // View on Binance button
        document.getElementById('viewOnBinance')?.addEventListener('click', function() {
            window.open('https://testnet.binancefuture.com', '_blank');
        });
        
        // Load initial orders
        loadOrders();
    }

    // Load orders
    function loadOrders() {
        // Generate simulated orders
        const orders = generateMockOrders(50);
        
        // Update statistics
        updateOrderStats(orders);
        
        // Render orders table
        renderOrdersTable(orders);
        
        // Initialize pagination
        initializePagination(orders);
        
        // Add event listeners for order checkboxes and details
        setTimeout(() => {
            setupOrderTableEvents();
        }, 100);
    }

    // Generate mock orders
    function generateMockOrders(count) {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'SOLUSDT'];
        const types = ['MARKET', 'LIMIT'];
        const sides = ['BUY', 'SELL'];
        const statuses = ['FILLED', 'OPEN', 'CANCELLED', 'PARTIAL'];
        
        const orders = [];
        const now = new Date();
        
        for (let i = 0; i < count; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const side = sides[Math.floor(Math.random() * sides.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            const quantity = (Math.random() * 10 + 0.001).toFixed(3);
            const price = type === 'MARKET' ? 'Market' : 
                `$${(Math.random() * 50000 + 100).toFixed(2)}`;
            
            const filled = status === 'FILLED' ? quantity : 
                status === 'PARTIAL' ? (parseFloat(quantity) * 0.7).toFixed(3) : '0';
            
            const total = type === 'MARKET' ? 'Market' : 
                `$${(parseFloat(quantity) * parseFloat(price.replace(/[^0-9.-]+/g, ''))).toFixed(2)}`;
            
            const orderId = Math.floor(Math.random() * 1000000000);
            const time = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            orders.push({
                id: orderId,
                time: time.toLocaleString(),
                symbol,
                type,
                side,
                quantity,
                price,
                filled,
                total,
                status,
                details: {
                    created: time.toLocaleString(),
                    updated: new Date(time.getTime() + Math.random() * 60000).toLocaleString(),
                    avgPrice: price === 'Market' ? 
                        `$${(Math.random() * 50000 + 100).toFixed(2)}` : price,
                    commission: `$${(Math.random() * 10).toFixed(2)}`
                }
            });
        }
        
        // Sort by time (newest first)
        return orders.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    // Update order statistics
    function updateOrderStats(orders) {
        const total = orders.length;
        const success = orders.filter(o => o.status === 'FILLED').length;
        const pending = orders.filter(o => o.status === 'OPEN' || o.status === 'PARTIAL').length;
        const failed = orders.filter(o => o.status === 'CANCELLED').length;
        
        document.getElementById('totalOrders').textContent = total;
        document.getElementById('successOrders').textContent = success;
        document.getElementById('pendingOrders').textContent = pending;
        document.getElementById('failedOrders').textContent = failed;
    }

    // Render orders table
    function renderOrdersTable(orders, page = 1, pageSize = 10) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageOrders = orders.slice(start, end);
        
        const tableBody = document.getElementById('ordersTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = pageOrders.map(order => `
            <tr>
                <td>
                    <input type="checkbox" class="order-checkbox" data-order-id="${order.id}">
                </td>
                <td><code>${order.id}</code></td>
                <td>${order.time}</td>
                <td><strong>${order.symbol}</strong></td>
                <td><span class="status-badge">${order.type}</span></td>
                <td><span class="${order.side === 'BUY' ? 'side-buy' : 'side-sell'}">${order.side}</span></td>
                <td>${order.quantity}</td>
                <td>${order.price}</td>
                <td>${order.filled}</td>
                <td>${order.total}</td>
                <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>
                    <button class="btn-small view-order" data-order-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'OPEN' || order.status === 'PARTIAL' ? `
                    <button class="btn-small cancel-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    // Initialize pagination
    function initializePagination(orders, pageSize = 10) {
        const totalPages = Math.ceil(orders.length / pageSize);
        
        document.getElementById('currentPage').textContent = '1';
        document.getElementById('totalPages').textContent = totalPages;
        
        document.getElementById('prevPage').disabled = true;
        document.getElementById('nextPage').disabled = totalPages <= 1;
    }

    // Setup order table events
    function setupOrderTableEvents() {
        // Order checkboxes
        document.querySelectorAll('.order-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const orderId = this.dataset.orderId;
                if (this.checked) {
                    selectedOrders.add(orderId);
                } else {
                    selectedOrders.delete(orderId);
                }
                updateSelectedCount();
                updateCancelSelectedButton();
                updateSelectAllCheckbox();
            });
        });
        
        // View order details
        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.dataset.orderId;
                showOrderDetails(orderId);
            });
        });
        
        // Cancel order buttons
        document.querySelectorAll('.cancel-order-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.dataset.orderId;
                cancelSingleOrder(orderId);
            });
        });
    }

    // Update selected count
    function updateSelectedCount() {
        const count = selectedOrders.size;
        document.getElementById('selectedCount').textContent = count;
    }

    // Update cancel selected button
    function updateCancelSelectedButton() {
        const button = document.getElementById('cancelSelected');
        if (!button) return;
        
        button.disabled = selectedOrders.size === 0;
    }

    // Update select all checkbox
    function updateSelectAllCheckbox() {
        const selectAll = document.getElementById('selectAll');
        if (!selectAll) return;
        
        const checkboxes = document.querySelectorAll('.order-checkbox');
        const allChecked = checkboxes.length > 0 && 
            Array.from(checkboxes).every(cb => cb.checked);
        const someChecked = Array.from(checkboxes).some(cb => cb.checked);
        
        selectAll.checked = allChecked;
        selectAll.indeterminate = someChecked && !allChecked;
    }

    // Filter orders
    function filterOrders() {
        // In a real app, this would filter the orders based on search and filter criteria
        showToast('Applying filters...', 'info');
    }

    // Go to page
    function goToPage(page) {
        // In a real app, this would load the specific page of orders
        document.getElementById('currentPage').textContent = page;
        
        // Update pagination buttons
        const totalPages = parseInt(document.getElementById('totalPages').textContent);
        document.getElementById('prevPage').disabled = page === 1;
        document.getElementById('nextPage').disabled = page === totalPages;
        
        showToast(`Loading page ${page}...`, 'info');
    }

    // Show order details
    function showOrderDetails(orderId) {
        const modal = document.getElementById('orderDetailsModal');
        if (!modal) return;
        
        // In a real app, this would fetch order details from API
        // For now, we'll use mock data
        const order = {
            id: orderId,
            symbol: 'BTCUSDT',
            type: 'LIMIT',
            side: 'BUY',
            price: '$45,230.50',
            quantity: '0.005 BTC',
            total: '$226.15',
            filled: '0.005 BTC',
            status: 'FILLED',
            created: '2024-01-15 14:30:25',
            updated: '2024-01-15 14:30:30',
            avgPrice: '$45,230.50',
            commission: '$0.23'
        };
        
        // Update modal content
        document.getElementById('detailId').textContent = order.id;
        document.getElementById('detailSymbol').textContent = order.symbol;
        document.getElementById('detailType').textContent = order.type;
        document.getElementById('detailSide').textContent = order.side;
        document.getElementById('detailSide').className = order.side === 'BUY' ? 'side-buy' : 'side-sell';
        document.getElementById('detailPrice').textContent = order.price;
        document.getElementById('detailQuantity').textContent = order.quantity;
        document.getElementById('detailTotal').textContent = order.total;
        document.getElementById('detailFilled').textContent = order.filled;
        document.getElementById('detailCreated').textContent = order.created;
        document.getElementById('detailUpdated').textContent = order.updated;
        document.getElementById('detailStatus').textContent = order.status;
        document.getElementById('detailStatus').className = `status-${order.status.toLowerCase()}`;
        document.getElementById('detailCommission').textContent = order.commission;
        document.getElementById('detailAvgPrice').textContent = order.avgPrice;
        
        // Calculate duration
        const created = new Date(order.created);
        const updated = new Date(order.updated);
        const duration = Math.floor((updated - created) / 1000);
        document.getElementById('detailDuration').textContent = `${duration} seconds`;
        
        // Generate mock fills
        const fillsTable = document.getElementById('fillsTable');
        if (fillsTable) {
            const fills = [
                { id: 123456, price: '$45,230.50', quantity: '0.005', commission: '$0.23', time: '14:30:30' }
            ];
            
            fillsTable.innerHTML = fills.map(fill => `
                <tr>
                    <td><code>${fill.id}</code></td>
                    <td>${fill.price}</td>
                    <td>${fill.quantity}</td>
                    <td>${fill.commission}</td>
                    <td>${fill.time}</td>
                </tr>
            `).join('');
        }
        
        // Show modal
        modal.classList.add('active');
    }

    // Cancel single order
    function cancelSingleOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            showToast(`Cancelling order ${orderId}...`, 'info');
            
            setTimeout(() => {
                showToast(`✅ Order ${orderId} cancelled successfully`, 'success');
                selectedOrders.delete(orderId.toString());
                updateSelectedCount();
                updateCancelSelectedButton();
                loadOrders();
            }, 1500);
        }
    }

    // Settings Page Functions
    function initializeSettingsPage() {
        // Settings menu navigation
        document.querySelectorAll('.settings-menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                
                // Update active menu item
                document.querySelectorAll('.settings-menu-item').forEach(i => {
                    i.classList.remove('active');
                });
                this.classList.add('active');
                
                // Show corresponding section
                document.querySelectorAll('.settings-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(targetId).classList.add('active');
            });
        });
        
        // API form
        document.getElementById('apiForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            saveApiSettings();
        });
        
        // Test API connection
        document.getElementById('testApiConnection')?.addEventListener('click', function() {
            testApiConnection();
        });
        
        // Toggle API key visibility
        document.getElementById('toggleApiKey')?.addEventListener('click', function() {
            togglePasswordVisibility('apiKey', this);
        });
        
        // Toggle API secret visibility
        document.getElementById('toggleApiSecret')?.addEventListener('click', function() {
            togglePasswordVisibility('apiSecret', this);
        });
        
        // Generate test keys
        document.getElementById('generateTestKeys')?.addEventListener('click', function() {
            generateTestKeys();
        });
        
        // Save all settings
        document.getElementById('saveAllSettings')?.addEventListener('click', function() {
            saveAllSettings();
        });
        
        // Export logs
        document.getElementById('exportLogs')?.addEventListener('click', function() {
            exportLogs();
        });
        
        // Clear logs
        document.getElementById('clearLogs')?.addEventListener('click', function() {
            clearLogs();
        });
        
        // Slider value displays
        initializeSliders();
        
        // Theme selector
        initializeThemeSelector();
    }

    // Toggle password visibility
    function togglePasswordVisibility(inputId, button) {
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    // Test API connection
    function testApiConnection() {
        showToast('Testing API connection to Binance...', 'info');
        
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                showToast('✅ API connection successful!', 'success');
                document.querySelector('.status-indicator').className = 'status-indicator connected';
                document.querySelector('.status-indicator').innerHTML = `
                    <i class="fas fa-plug"></i>
                    <span>Connected to Binance Testnet</span>
                `;
            } else {
                showToast('❌ API connection failed. Check your credentials.', 'error');
                document.querySelector('.status-indicator').className = 'status-indicator disconnected';
                document.querySelector('.status-indicator').innerHTML = `
                    <i class="fas fa-plug"></i>
                    <span>Disconnected from Binance</span>
                `;
            }
        }, 2000);
    }

    // Save API settings
    function saveApiSettings() {
        const apiKey = document.getElementById('apiKey').value;
        const apiSecret = document.getElementById('apiSecret').value;
        const apiEnv = document.getElementById('apiEnv').value;
        
        // In a real app, this would save to localStorage or backend
        localStorage.setItem('binance_api_key', apiKey);
        localStorage.setItem('binance_api_secret', apiSecret);
        localStorage.setItem('binance_api_env', apiEnv);
        
        showToast('API settings saved successfully!', 'success');
    }

    // Generate test keys
    function generateTestKeys() {
        const testKey = 'testnet_api_key_' + Math.random().toString(36).substring(7);
        const testSecret = 'testnet_api_secret_' + Math.random().toString(36).substring(7);
        
        document.getElementById('apiKey').value = testKey;
        document.getElementById('apiSecret').value = testSecret;
        
        showToast('Test API keys generated. Remember to save!', 'success');
    }

    // Initialize sliders
    function initializeSliders() {
        // Refresh interval slider
        const refreshSlider = document.getElementById('refreshInterval');
        if (refreshSlider) {
            refreshSlider.addEventListener('input', function() {
                document.getElementById('intervalValue').textContent = `${this.value} seconds`;
            });
        }
        
        // Position size slider
        const positionSlider = document.getElementById('maxPositionSize');
        if (positionSlider) {
            positionSlider.addEventListener('input', function() {
                document.getElementById('positionSizeValue').textContent = `${this.value}%`;
            });
        }
        
        // Stop loss slider
        const stopLossSlider = document.getElementById('stopLoss');
        if (stopLossSlider) {
            stopLossSlider.addEventListener('input', function() {
                document.getElementById('stopLossValue').textContent = `${this.value}%`;
            });
        }
        
        // Take profit slider
        const takeProfitSlider = document.getElementById('takeProfit');
        if (takeProfitSlider) {
            takeProfitSlider.addEventListener('input', function() {
                document.getElementById('takeProfitValue').textContent = `${this.value}%`;
            });
        }
    }

    // Initialize theme selector
    function initializeThemeSelector() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.dataset.theme;
                
                // Update active state
                document.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                
                // Update hidden input
                document.getElementById('theme').value = theme;
                
                // In a real app, this would apply the theme
                showToast(`Theme changed to ${theme} mode`, 'success');
            });
        });
    }

    // Save all settings
    function saveAllSettings() {
        // Collect all settings
        const settings = {
            api: {
                key: document.getElementById('apiKey')?.value,
                secret: document.getElementById('apiSecret')?.value,
                env: document.getElementById('apiEnv')?.value
            },
            trading: {
                defaultSymbol: document.getElementById('defaultSymbol')?.value,
                defaultQuantity: document.getElementById('defaultQuantity')?.value,
                confirmOrders: document.getElementById('confirmOrders')?.checked,
                autoRefresh: document.getElementById('autoRefresh')?.checked,
                soundEffects: document.getElementById('soundEffects')?.checked,
                refreshInterval: document.getElementById('refreshInterval')?.value
            },
            risk: {
                maxPositionSize: document.getElementById('maxPositionSize')?.value,
                stopLoss: document.getElementById('stopLoss')?.value,
                takeProfit: document.getElementById('takeProfit')?.value
            },
            notifications: {
                orderFilled: document.getElementById('notifyOrderFilled')?.checked,
                orderCancelled: document.getElementById('notifyOrderCancelled')?.checked,
                errors: document.getElementById('notifyErrors')?.checked,
                balance: document.getElementById('notifyBalance')?.checked,
                sound: document.getElementById('notificationSound')?.value
            },
            appearance: {
                theme: document.getElementById('theme')?.value,
                chartType: document.getElementById('chartType')?.value,
                compactView: document.getElementById('compactView')?.checked,
                showGrid: document.getElementById('showGrid')?.checked,
                animations: document.getElementById('animations')?.checked
            },
            logs: {
                logLevel: document.getElementById('logLevel')?.value,
                logRetention: document.getElementById('logRetention')?.value
            }
        };
        
        // In a real app, this would save to localStorage or backend
        localStorage.setItem('trading_bot_settings', JSON.stringify(settings));
        
        showToast('All settings saved successfully!', 'success');
    }

    // Export logs
    function exportLogs() {
        showToast('Preparing logs for export...', 'info');
        
        // In a real app, this would generate and download a log file
        setTimeout(() => {
            showToast('✅ Logs exported successfully!', 'success');
        }, 1500);
    }

    // Clear logs
    function clearLogs() {
        if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
            showToast('Clearing all logs...', 'info');
            
            setTimeout(() => {
                showToast('✅ All logs cleared successfully!', 'success');
            }, 1000);
        }
    }

    // Window resize handler
    window.addEventListener('resize', function() {
        // Reinitialize charts on resize
        const canvas = document.getElementById('balanceChart');
        if (canvas) {
            initializeBalanceChart();
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        if (marketDataInterval) {
            clearInterval(marketDataInterval);
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {

    const API_BASE = "http://127.0.0.1:5000/api";
    let marketDataInterval = null;

    // -------------------------------
    // Toast helper
    // -------------------------------
    function showToast(message, type='info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // For real UI, replace with toast library or DOM notifications
    }

    // -------------------------------
    // Theme selector
    // -------------------------------
    function initializeThemeSelector() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.dataset.theme;
                
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                document.getElementById('theme').value = theme;
                showToast(`Theme changed to ${theme} mode`, 'success');
            });
        });
    }
    initializeThemeSelector();

    // -------------------------------
    // Save settings
    // -------------------------------
    function saveAllSettings() {
        const settings = {
            api: {
                key: document.getElementById('apiKey')?.value,
                secret: document.getElementById('apiSecret')?.value,
                env: document.getElementById('apiEnv')?.value
            },
            trading: {
                defaultSymbol: document.getElementById('defaultSymbol')?.value,
                defaultQuantity: document.getElementById('defaultQuantity')?.value,
                confirmOrders: document.getElementById('confirmOrders')?.checked
            },
            appearance: {
                theme: document.getElementById('theme')?.value
            }
        };
        localStorage.setItem('trading_bot_settings', JSON.stringify(settings));
        showToast('All settings saved successfully!', 'success');
    }

    // -------------------------------
    // Logs
    // -------------------------------
    function exportLogs() {
        showToast('Preparing logs for export...', 'info');
        setTimeout(() => showToast('✅ Logs exported successfully!', 'success'), 1500);
    }

    function clearLogs() {
        if (confirm('Are you sure you want to clear all logs?')) {
            showToast('Clearing all logs...', 'info');
            setTimeout(() => showToast('✅ All logs cleared successfully!', 'success'), 1000);
        }
    }

    // -------------------------------
    // API: Wallet info
    // -------------------------------
    function fetchWalletInfo() {
        fetch(`${API_BASE}/test-connection`)
            .then(res => res.json())
            .then(data => {
                console.log("Wallet Info:", data);
                const walletEl = document.getElementById("wallet");
                if(walletEl) walletEl.innerText = `Balance: ${data.totalWalletBalance || 'N/A'} USDT`;
            })
            .catch(err => console.error(err));
    }
    fetchWalletInfo();

    // -------------------------------
    // API: Place order example
    // -------------------------------
    function placeTestOrder() {
        fetch(`${API_BASE}/place-order`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                symbol: 'BTCUSDT',
                side: 'BUY',
                order_type: 'MARKET',
                quantity: 0.01
            })
        })
        .then(res => res.json())
        .then(data => console.log("Order Response:", data))
        .catch(err => console.error(err));
    }

    // -------------------------------
    // Window resize & cleanup
    // -------------------------------
    window.addEventListener('resize', () => {
        // Reinitialize charts here if needed
    });

    window.addEventListener('beforeunload', () => {
        if (marketDataInterval) clearInterval(marketDataInterval);
    });

});
