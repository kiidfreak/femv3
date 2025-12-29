from django.db import models
from django.utils import timezone
from api.models import User

class TradingPlan(models.Model):
    """Configuration for different prop firm evaluation plans"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Financial Targets
    account_size = models.DecimalField(max_digits=12, decimal_places=2, help_text="Starting balance (e.g., 50000)")
    profit_target = models.DecimalField(max_digits=12, decimal_places=2, help_text="Profit needed to pass")
    
    # Risk Limits
    max_drawdown = models.DecimalField(max_digits=12, decimal_places=2, help_text="Maximum total loss allowed")
    max_daily_loss = models.DecimalField(max_digits=12, decimal_places=2, help_text="Maximum loss allowed in a single day")
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost of the plan")
    currency = models.CharField(max_length=10, default='USD')
    
    # Rules
    min_trading_days = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trading_plan'

    def __str__(self):
        return f"{self.name} (${self.account_size})"


class TradingAccount(models.Model):
    """Individual trader account linked to a plan"""
    STATUS_CHOICES = (
        ('pending', 'Pending Setup'),
        ('active', 'Active'),
        ('failed', 'Failed'),
        ('passed', 'Passed'),
        ('funded', 'Funded'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trading_accounts')
    plan = models.ForeignKey(TradingPlan, on_delete=models.PROTECT)
    
    # Tradeovate Specifics
    tradeovate_account_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    tradeovate_username = models.CharField(max_length=255, null=True, blank=True)
    
    # Account State
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    equity = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateTimeField(default=timezone.now)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Analytics
    total_trades = models.IntegerField(default=0)
    win_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    current_drawdown = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    class Meta:
        db_table = 'trading_account'

    def __str__(self):
        return f"{self.user.phone} - {self.plan.name} ({self.status})"


class Trade(models.Model):
    """Historical trades fetched from Tradeovate"""
    account = models.ForeignKey(TradingAccount, on_delete=models.CASCADE, related_name='trades')
    tradeovate_id = models.CharField(max_length=255, unique=True)
    
    symbol = models.CharField(max_length=50)
    side = models.CharField(max_length=10, choices=(('buy', 'Buy'), ('sell', 'Sell')))
    
    entry_price = models.DecimalField(max_digits=12, decimal_places=4)
    exit_price = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    
    quantity = models.IntegerField()
    pnl = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    
    entry_time = models.DateTimeField()
    exit_time = models.DateTimeField(null=True, blank=True)
    
    is_closed = models.BooleanField(default=False)

    class Meta:
        db_table = 'trading_trade'
        ordering = ['-entry_time']

    def __str__(self):
        return f"{self.symbol} {self.side} ({self.pnl})"
