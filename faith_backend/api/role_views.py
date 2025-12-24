from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from .roles import Role, UserRole, create_default_roles
from .serializers import RoleSerializer, UserRoleSerializer, PermissionSerializer


class HasRolePermission:
    """
    Custom permission class similar to Filament Shield
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Super admin has all permissions
        if hasattr(request.user, 'is_super_admin') and request.user.is_super_admin:
            return True
            
        # Check if user has required role/permission
        required_permission = getattr(view, 'required_permission', None)
        if required_permission:
            return request.user.has_perm(required_permission)
        
        return True


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing roles
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    required_permission = 'api.manage_roles'

    @action(detail=True, methods=['post'])
    def assign_permissions(self, request, pk=None):
        """Assign permissions to a role"""
        role = self.get_object()
        permission_ids = request.data.get('permission_ids', [])
        
        permissions = Permission.objects.filter(id__in=permission_ids)
        role.permissions.set(permissions)
        
        return Response({
            'message': f'Assigned {permissions.count()} permissions to {role.name}',
            'role': RoleSerializer(role).data
        })

    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        """Get all permissions for a role"""
        role = self.get_object()
        permissions = role.permissions.all()
        
        return Response({
            'role': role.name,
            'permissions': PermissionSerializer(permissions, many=True).data
        })

    @action(detail=False, methods=['post'])
    def create_defaults(self, request):
        """Create default roles"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admins can create default roles'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        roles = create_default_roles()
        return Response({
            'message': 'Default roles created successfully',
            'roles': {k: RoleSerializer(v).data for k, v in roles.items()}
        })


class UserRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user role assignments
    """
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]
    required_permission = 'api.manage_user_roles'

    @action(detail=False, methods=['post'])
    def assign(self, request):
        """Assign a role to a user"""
        user_id = request.data.get('user_id')
        role_id = request.data.get('role_id')
        
        if not user_id or not role_id:
            return Response(
                {'error': 'user_id and role_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from .models import User
        try:
            user = User.objects.get(id=user_id)
            role = Role.objects.get(id=role_id)
        except (User.DoesNotExist, Role.DoesNotExist) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user_role, created = UserRole.objects.get_or_create(
            user=user,
            role=role,
            defaults={'assigned_by': request.user}
        )
        
        return Response({
            'message': f'Role {role.name} {"assigned" if created else "already assigned"} to {user.first_name}',
            'user_role': UserRoleSerializer(user_role).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def unassign(self, request):
        """Remove a role from a user"""
        user_id = request.data.get('user_id')
        role_id = request.data.get('role_id')
        
        deleted_count, _ = UserRole.objects.filter(
            user_id=user_id,
            role_id=role_id
        ).delete()
        
        return Response({
            'message': f'Role unassigned successfully' if deleted_count > 0 else 'Role assignment not found',
            'deleted': deleted_count > 0
        })


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing available permissions
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def grouped(self, request):
        """Get permissions grouped by content type"""
        permissions = Permission.objects.select_related('content_type').all()
        
        grouped = {}
        for perm in permissions:
            app_label = perm.content_type.app_label
            model = perm.content_type.model
            key = f"{app_label}.{model}"
            
            if key not in grouped:
                grouped[key] = {
                    'app': app_label,
                    'model': model,
                    'permissions': []
                }
            
            grouped[key]['permissions'].append({
                'id': perm.id,
                'codename': perm.codename,
                'name': perm.name
            })
        
        return Response(grouped)
