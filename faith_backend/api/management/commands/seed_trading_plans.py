from django.core.management.base import BaseCommand
from api.trading_models import TradingPlan

class Command(BaseCommand):
    help = 'Seed initial trading plans'

    def handle(self, *args, **kwargs):
        plans = [
            {
                'name': 'Starter Evaluation',
                'description': 'Perfect for beginners to prove their skills.',
                'account_size': 10000.00,
                'profit_target': 1000.00,
                'max_drawdown': 500.00,
                'max_daily_loss': 250.00,
                'price': 99.00,
                'min_trading_days': 5
            },
            {
                'name': 'Professional Evaluation',
                'description': 'For experienced traders looking for higher capital.',
                'account_size': 50000.00,
                'profit_target': 3000.00,
                'max_drawdown': 2000.00,
                'max_daily_loss': 1000.00,
                'price': 299.00,
                'min_trading_days': 5
            },
            {
                'name': 'Master Evaluation',
                'description': 'Maximum capital for top-tier traders.',
                'account_size': 100000.00,
                'profit_target': 6000.00,
                'max_drawdown': 4000.00,
                'max_daily_loss': 2000.00,
                'price': 499.00,
                'min_trading_days': 5
            }
        ]

        for p_data in plans:
            plan, created = TradingPlan.objects.get_or_create(
                name=p_data['name'],
                defaults=p_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created plan: {plan.name}"))
            else:
                self.stdout.write(f"Plan already exists: {plan.name}")
