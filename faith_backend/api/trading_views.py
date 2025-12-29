from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .trading_models import TradingPlan, TradingAccount, Trade
from .trading_serializers import TradingPlanSerializer, TradingAccountSerializer, TradeSerializer

class TradingPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """Public view for available trading plans"""
    queryset = TradingPlan.objects.filter(is_active=True)
    serializer_class = TradingPlanSerializer
    permission_classes = [permissions.AllowAny]


class TradingAccountViewSet(viewsets.ModelViewSet):
    """User-specific trading accounts"""
    serializer_class = TradingAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TradingAccount.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        plan = serializer.validated_data.get('plan')
        # Simulate Tradeovate account creation
        from .services.tradeovate_service import tradeovate_service
        
        # In a real app, we'd pass more user info
        to_account = tradeovate_service.create_account(self.request.user.id)
        
        serializer.save(
            user=self.request.user,
            balance=plan.account_size,
            equity=plan.account_size,
            tradeovate_account_id=to_account['accountId'],
            tradeovate_username=to_account['username'],
            status='active'
        )

    @action(detail=True, methods=['get'])
    def trades(self, request, pk=None):
        """Get trades for a specific account"""
        account = self.get_object()
        trades = account.trades.all()
        serializer = TradeSerializer(trades, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """
        Manually trigger sync with Tradeovate API
        """
        account = self.get_object()
        from .services.tradeovate_service import tradeovate_service
        
        success = tradeovate_service.sync_trades(account)
        
        if success:
            return Response({'status': 'Sync completed', 'account_id': account.tradeovate_account_id})
        else:
            return Response({'error': 'Sync failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TradeViewSet(viewsets.ReadOnlyModelViewSet):
    """View historical trades"""
    serializer_class = TradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trade.objects.filter(account__user=self.request.user)
