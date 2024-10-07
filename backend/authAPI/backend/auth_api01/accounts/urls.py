from django.urls import path
from .views import *
urlpatterns = [
    path('register/', UserRegisterationView.as_view()),
    path('login/', UserLoginView.as_view()),
    path('user/profile/', UserProfileView.as_view()),
    path('user/change_password/', userChangePasswordView.as_view()),
    path('user/email_verify/', emailVerifyUsingOtpView.as_view()),
    path('resend_otp/', resendOtpView.as_view()),
    path('user/save_profile/',saveProfileView.as_view()),
]