from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.notification_models import Notification, NotificationPreference
from api.notification_serializers import NotificationSerializer, NotificationPreferenceSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for user notifications (bell icon dropdown)"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'success', 'message': 'All notifications marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark single notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'put', 'patch']  # No POST/DELETE, only GET/UPDATE
    
    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Get or create notification preferences for current user"""
        prefs, created = NotificationPreference.objects.get_or_create(user=self.request.user)
        return prefs
    
    def list(self, request, *args, **kwargs):
        """Return user's notification preferences"""
        prefs = self.get_object()
        serializer = self.get_serializer(prefs)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update notification preferences"""
        prefs = self.get_object()
        serializer = self.get_serializer(prefs, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
