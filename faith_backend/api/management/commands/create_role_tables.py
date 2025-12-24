from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Create Role and UserRole tables directly'

    def handle(self, *args, **options):
        self.stdout.write('Creating roles and user_roles tables...')
        
        with connection.cursor() as cursor:
            # Create roles table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS roles (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    display_name VARCHAR(255),
                    description TEXT,
                    is_super_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Create role_permissions junction table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS roles_permissions (
                    id SERIAL PRIMARY KEY,
                    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
                    permission_id INTEGER REFERENCES auth_permission(id) ON DELETE CASCADE,
                    UNIQUE(role_id, permission_id)
                );
            """)
            
            # Create user_roles junction table  
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_roles (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_auth_user(id) ON DELETE CASCADE,
                    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    assigned_by_id INTEGER REFERENCES user_auth_user(id) ON DELETE SET NULL,
                    UNIQUE(user_id, role_id)
                );
            """)
        
        self.stdout.write(self.style.SUCCESS('✅ Tables created successfully!'))
        self.stdout.write('Now you can run: python manage.py setup_shield --create-super-admin')
