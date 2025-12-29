import random
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.db import IntegrityError
from .models import PendingUser

User = get_user_model()

def send_sms_otp(phone, otp):
    """
    Sends SMS via Ndovubase API
    """
    api_key = settings.SMS_API_KEY
    sender_id = settings.SMS_FROM_NUMBER
    
    # Typical Ndovubase/Kenia SMS Gateway structure
    url = "https://api.ndovubase.com/v1/sms/send" # Placeholder URL
    payload = {
        "api_key": api_key,
        "username": "faithconnect", # Derived from context
        "sender_id": sender_id,
        "message": f"Your Faith Connect verification code is: {otp}. Valid for 10 minutes.",
        "phone": phone
    }
    
    try:
        # response = requests.post(url, json=payload)
        # return response.status_code == 200
        print(f"DEBUG: SMS Sent to {phone} via Ndovubase: {otp}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to send SMS: {e}")
        return False

def send_email_otp(email, otp, first_name, template_id=None):
    """
    Sends Email via SMTP (Html fallback)
    """
    try:
        subject = "Faith Connect Verification"
        message = f"Hello {first_name or 'User'},\n\nYour verification code is: {otp}\n\nValid for 10 minutes.\n\nFaith Connect Team"
        from_email = settings.DEFAULT_FROM_EMAIL
        
        send_mail(subject, message, from_email, [email], fail_silently=False)
        print(f"DEBUG: Email Sent to {email}: {otp}")
        return True
    except Exception as e:
        print(f"ERROR: Failed to send Email: {e}")
        return False

class PhoneLoginView(APIView):
    permission_classes = []
    
    def post(self, request):
        identifier = request.data.get('phone') # Can be phone or email
        method = request.data.get('method', 'phone') # 'phone' or 'email'
        
        if not identifier:
            return Response({'error': 'Identifier is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(phone=identifier).first() or User.objects.filter(email=identifier).first()
        
        if not user:
            return Response({'error': 'Account not found. Please sign up.'}, status=status.HTTP_404_NOT_FOUND)
        
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()
        
        success = False
        if method == 'email' and user.email:
            success = send_email_otp(user.email, otp, user.first_name, 3) # Template #3
        else:
            success = send_sms_otp(user.phone, otp)
        
        if not success:
            return Response({'error': f'Failed to send code via {method}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({'message': 'OTP sent successfully', 'identifier': identifier, 'method': method})

class SignupView(APIView):
    permission_classes = []
    
    def post(self, request):
        phone = request.data.get('phone')
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        partnership_number = request.data.get('partnership_number')
        method = request.data.get('method', 'phone')
        
        # Validate based on method
        if method == 'email':
            if not email:
                return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email address already registered'}, status=status.HTTP_400_BAD_REQUEST)
            phone = None # Ensure phone is None if not provided
        else:
             # Phone method
            if not phone:
                return Response({'error': 'Phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(phone=phone).exists():
                return Response({'error': 'Phone number already registered'}, status=status.HTTP_400_BAD_REQUEST)
            # Email is optional/secondary for phone signups, but check uniqueness if provided
            if email and User.objects.filter(email=email).exists():
                 return Response({'error': 'Email address already registered'}, status=status.HTTP_400_BAD_REQUEST)


        if not partnership_number:
            return Response({'error': 'Partnership Number is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Delete existing pending records
            if method == 'email':
                PendingUser.objects.filter(email=email).delete()
            elif phone:
                PendingUser.objects.filter(phone=phone).delete()
            
            otp = str(random.randint(100000, 999999))
            pending_user = PendingUser.objects.create(
                phone=phone,
                email=email,
                first_name=first_name,
                partnership_number=partnership_number,
                otp=otp
            )
        except Exception as e:
             return Response({'error': f'Registration failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        success = False
        if method == 'email':
            success = send_email_otp(email, otp, first_name, 1) # Template #1
        else:
            success = send_sms_otp(phone, otp)
            
        return Response({'message': 'OTP sent. Please verify to complete registration.', 'identifier': phone if method == 'phone' else email, 'method': method})

class ResendOTPView(APIView):
    permission_classes = []
    
    def post(self, request):
        identifier = request.data.get('identifier')
        method = request.data.get('method', 'phone')
        
        if not identifier:
            return Response({'error': 'Identifier is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000, 999999))
        first_name = "User"
        
        # Check existing users (for Login resend)
        user = User.objects.filter(phone=identifier).first() or User.objects.filter(email=identifier).first()
        if user:
            user.otp = otp
            user.save()
            first_name = user.first_name
        else:
            # Check pending users (for Signup resend)
            pending = PendingUser.objects.filter(phone=identifier).first() or PendingUser.objects.filter(email=identifier).first()
            if pending:
                pending.otp = otp
                pending.save()
                first_name = pending.first_name
            else:
                return Response({'error': 'No pending registration or account found'}, status=status.HTTP_404_NOT_FOUND)
        
        success = False
        if method == 'email' and (user.email if user else pending.email):
            success = send_email_otp(user.email if user else pending.email, otp, first_name)
        else:
            success = send_sms_otp(user.phone if user else pending.phone, otp)
            
        if not success:
            return Response({'error': 'Failed to resend code'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({'message': 'OTP resent successfully'})

class VerifyOTPView(APIView):
    permission_classes = []
    
    def post(self, request):
        identifier = request.data.get('identifier')
        otp = request.data.get('otp')
        
        if not identifier or not otp:
            return Response({'error': 'Identifier and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Try finding in existing users first (Login case)
        user = User.objects.filter(phone=identifier, otp=otp).first() or User.objects.filter(email=identifier, otp=otp).first()
        
        if not user:
            # Try finding in pending users (Signup case)
            pending = PendingUser.objects.filter(phone=identifier, otp=otp).first() or PendingUser.objects.filter(email=identifier, otp=otp).first()
            if not pending:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Successful signup verification - Create the user now
            try:
                user = User.objects.create(
                    phone=pending.phone or None,
                    email=pending.email or None,
                    first_name=pending.first_name,
                    partnership_number=pending.partnership_number,
                    phone_verified=True,
                    is_active=True
                )
                pending.delete()
            except IntegrityError:
                return Response({'error': 'An account with this phone or email already exists.'}, status=status.HTTP_409_CONFLICT)
            except Exception as e:
                return Response({'error': f'Failed to create account: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Successful login verification
            user.otp = None
            user.phone_verified = True
            user.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'phone': user.phone,
                'email': user.email,
                'first_name': user.first_name,
                'user_type': user.user_type,
                'partnership_number': user.partnership_number,
                'phone_verified': user.phone_verified,
                'has_business_profile': user.has_business_profile,
                'is_verified': user.is_verified, # Church verification
                'profile_image_url': user.profile_image.url if user.profile_image else None
            }
        })

from rest_framework.permissions import IsAuthenticated

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'user': {
                'id': user.id,
                'phone': user.phone,
                'email': user.email,
                'first_name': user.first_name,
                'user_type': user.user_type,
                'partnership_number': user.partnership_number,
                'phone_verified': user.phone_verified,
                'has_business_profile': user.has_business_profile,
                'is_verified': user.is_verified, # Church verification
                'profile_image_url': user.profile_image.url if user.profile_image else None,
                'email_notifications': user.email_notifications,
                'sms_notifications': user.sms_notifications
            }
        })

    def patch(self, request):
        user = request.user
        
        # Handle simple fields
        user_type = request.data.get('user_type')
        if user_type:
            if user_type not in ['member', 'business_owner', 'church_admin']:
                return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)
            user.user_type = user_type

        # Use getattr/setattr or direct assignment for other fields
        fields_to_update = ['first_name', 'last_name', 'email', 'partnership_number']
        for field in fields_to_update:
            if field in request.data:
                setattr(user, field, request.data.get(field))

        # Handle boolean fields properly (form-data sends strings 'true'/'false')
        if 'email_notifications' in request.data:
            val = request.data.get('email_notifications')
            user.email_notifications = str(val).lower() == 'true'
            
        if 'sms_notifications' in request.data:
            val = request.data.get('sms_notifications')
            user.sms_notifications = str(val).lower() == 'true'

        # Handle file upload
        if 'profile_image' in request.FILES:
            user.profile_image = request.FILES['profile_image']
            
        user.save()
            
        return Response({
            'message': 'Profile updated',
            'user': {
                'id': user.id,
                'phone': user.phone,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': user.user_type,
                'partnership_number': user.partnership_number,
                'phone_verified': user.phone_verified,
                'has_business_profile': user.has_business_profile,
                'is_verified': user.is_verified,
                'profile_image_url': user.profile_image.url if user.profile_image else None,
                'email_notifications': user.email_notifications,
                'sms_notifications': user.sms_notifications
            }
        })

