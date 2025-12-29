from rest_framework import serializers
from .trading_models import TradingPlan, TradingAccount, Trade

class TradingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradingPlan
        fields = '__all__'

class TradingAccountSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    
    class Meta:
        model = TradingAccount
        fields = [
            'id', 'user', 'user_phone', 'plan', 'plan_name', 
            'tradeovate_account_id', 'tradeovate_username',
            'balance', 'equity', 'status', 'start_date',
            'total_trades', 'win_rate', 'current_drawdown'
        ]
        read_only_fields = ['user', 'balance', 'equity', 'total_trades', 'win_rate', 'current_drawdown']

class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'
