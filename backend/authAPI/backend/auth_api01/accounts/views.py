from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .serializers import * #  UserRegisterationSerializers, UserLoginSerializers, UserProfileSerializers, userChangePasswordSerializers, emailVerifyUsingOtpSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.renderer import CustomRenderers
from rest_framework.permissions import IsAuthenticated
from accounts.models import MyUser




# Generate Tokens Manually
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def send_otp(user):
    user.generate_otp()
    # Logic to send email with the OTP


class UserRegisterationView(APIView):
    renderer_classes  = [CustomRenderers]
    def post(self,request):
        
        serializers = UserRegisterationSerializers(data = request.data)
        print("data -> ", request.data)
        if serializers.is_valid():
            user = serializers.save()
            send_otp(user=user)
            token = get_tokens_for_user(user)
            print("User Saved -> ", user)
            return Response({'msg':'Register Success',
                             'tokens':token,
                             'data':str(serializers.data)},
                             status=status.HTTP_201_CREATED)
        

        return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    renderer_classes  = [CustomRenderers]
    def post(self, request):
        serializer = UserLoginSerializers(data = request.data)
        print("request : -> ",request)
        print("request data -> ", request.data)
        if serializer.is_valid():
            email = serializer.data.get('email')
            password = serializer.data.get('password')
            user = authenticate(email = email, password = password)
            if user: 
                token = get_tokens_for_user(user)
                return Response({'msg':'Login Success',
                                 'is_profile_complete': user.is_profile_complete,
                                 'tokens':token},
                            status=status.HTTP_200_OK)
            else:
                return Response({'errors':{
                    'non_field_errors':['Email or Password is Not Valid']
                }},
                    status = status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    




class UserProfileView(APIView):
    renderer_classes = [CustomRenderers]
    permission_classes = [IsAuthenticated]
    def get(self,request):
        print(request.user)
        serializer = UserProfileSerializers(request.user)
        return Response(serializer.data,status=status.HTTP_200_OK)
    

class userChangePasswordView(APIView):
    renderer_classes = [CustomRenderers]
    permission_classes = [IsAuthenticated]
    def post(self,request):
        serializer = userChangePasswordSerializers(data = request.data,context = {'user':request.user})
        if serializer.is_valid():
            # old_password = serializer.data.get('old_password')
            # new_password = serializer.data.get('new_password')
            # if not user.check_password(old_password):
            #     return Response({'errors':{'non_field_errors':['Old Password is Not Valid']}},status=status.HTTP
            #                     _400_BAD_REQUEST)
            
            return  Response({'msg':'Password Change Success'},status=status.HTTP_200_OK)
        return  Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



class emailVerifyUsingOtpView(APIView):
    renderer_classes = [CustomRenderers]

    def post(self,request):
        serializer = emailVerifyUsingOtpSerializer(data= request.data)
        
        if serializer.is_valid():
            return  Response({'msg':'Email Verify Success'},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)




class saveProfileView(APIView):
    renderer_classes = [CustomRenderers]
    permission_classes = [IsAuthenticated]
    def post(self,request):
        serializer = saveProfileSerializer(data = request.data,context = {'user':request.user}) 
      
        user_obj = MyUser.objects.filter(email = request.user)
        
        if serializer.is_valid():
            user_obj.update(phone=serializer.data['phone']
            ,first_name=serializer.data['first_name']
            ,last_name=serializer.data['last_name']
            ,date_of_birth=serializer.data['date_of_birth']
            ,age=serializer.data['age']
            ,weight=serializer.data['weight']
            ,height=serializer.data['height']
            ,is_profile_complete = True
            )
            
            
            return  Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


 











class resendOtpView(APIView):

    # this is TODO

    renderer_classes = [CustomRenderers]
    # permission_classes = [IsAuthenticated]
    def post(self,request):
        email = request.data['email']
        print('request data:-> ',request.data)
        print('email->', email)
        user = MyUser.objects.get(email=email)
        if user:
            send_otp(user)
        

       


      
   