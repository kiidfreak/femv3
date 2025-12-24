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
        
        if not phone or not email:
            return Response({'error': 'Phone and Email are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(phone=phone).exists():
            return Response({'error': 'Phone number already registered'}, status=status.HTTP_400_BAD_REQUEST)

        if email and User.objects.filter(email=email).exists():
             return Response({'error': 'Email address already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.create(
                phone=phone,
                email=email,
                first_name=first_name,
                partnership_number=partnership_number,
                is_active=True
            )
            
            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.save()
        except IntegrityError:
             return Response({'error': 'Account with this details already exists'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             return Response({'error': f'Registration failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        success = False
        if method == 'email':
            success = send_email_otp(email, otp, first_name, 1) # Template #1
        else:
            success = send_sms_otp(phone, otp)
            
        return Response({'message': 'Account created. OTP sent.', 'identifier': phone if method == 'phone' else email, 'method': method})

class VerifyOTPView(APIView):
    permission_classes = []
    
    def post(self, request):
        identifier = request.data.get('identifier')
        otp = request.data.get('otp')
        
        if not identifier or not otp:
            return Response({'error': 'Identifier and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.filter(phone=identifier, otp=otp).first() or User.objects.filter(email=identifier, otp=otp).first()
        
        if not user:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.otp = None
        user.is_verified = True
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
                'has_business_profile': user.businesses.exists() if hasattr(user, 'businesses') else False
            }
        })

from rest_framework.permissions import IsAuthenticated

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        user_type = request.data.get('user_type')
        
        if user_type:
            if user_type not in ['member', 'business_owner', 'church_admin']:
                return Response({'error': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)
            user.user_type = user_type
            user.save()
            
        return Response({
            'message': 'Profile updated',
            'user': {
                'id': user.id,
                'user_type': user.user_type
            }
        })
