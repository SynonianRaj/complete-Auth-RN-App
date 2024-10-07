from rest_framework import serializers
from accounts.models import MyUser
from django.utils import timezone

class UserRegisterationSerializers(serializers.ModelSerializer):
    
    
    password2 = serializers.CharField(style={'input_type':'password'},
                                      write_only = True)
    class Meta:
        model = MyUser
        fields = ['email','otp','password','password2']
        # fields = '__all__'
        
    
    def validate(self, attrs):
        password1 = attrs.get('password')
        password2 = attrs.get('password2')
        print("passs1 ->", password1)
        print("pass2 -> ", password2)
       
        if password1 != password2:
            raise serializers.ValidationError("Password and Confirm Password doesn't match !")
        
        return attrs

    def create(self, validated_data):
            validated_data.pop('password2')  # Remove password2
            user = MyUser.objects.create_user(**validated_data)
            return user

    def to_representation(self, instance):
        # Customize the representation to return specific fields
        return {
            'email': instance.email,
            'otp': instance.otp,
            # Add other fields you want to expose here
        
        }



class UserLoginSerializers(serializers.ModelSerializer):
    
    email = serializers.EmailField()

    class Meta:
        model = MyUser
        fields = ['email','password']



class UserProfileSerializers(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        exclude = ['password']



class userChangePasswordSerializers(serializers.Serializer):
    password = serializers.CharField(min_length=8,max_length=255, style={'input_type':'password'})
    password2 = serializers.CharField(min_length=8, max_length=255, style={'input_type':'password'})

    class Meta:
        fields = ['password','password2']
    
    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')

        if password != password2:
            raise serializers.ValidationError("Password and Confirm Password doesn't match! ")
        
        user = self.context.get('user')
        # if password != user.password:
        #     raise serializers.ValidationError("Password doesn't match with your current password! ")
        
        user.set_password(password)
        user.save()
        return attrs




class emailVerifyUsingOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')
        print("email -> ", email)
        print('otp -> ', otp)

        user = self.get_user(email)
        if user.is_verified :
            raise serializers.ValidationError("Your email is already verified! ")

        if user.otp_expiration < timezone.now():
            raise serializers.ValidationError("OTP has expired.")
        if user.otp != otp:
            raise serializers.ValidationError("Invalid OTP!")
        
        # Mark user as verified and clear OTP
        user.is_verified = True
        user.otp = None  # Optionally clear the OTP after verification
        user.otp_expiration = None  # Optionally clear the expiration time
        user.save()
        
        return attrs

    def get_user(self, email):
        try:
            return MyUser.objects.get(email=email)
        except MyUser.DoesNotExist:
            raise serializers.ValidationError("Email doesn't match with your registered email!")




class saveProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['first_name', 'last_name','phone', 'date_of_birth','age', 'weight','height']

        def validate(self,attrs):
            phone = attrs.get('phone')
            first_name = attrs.get('first_name')
            last_name = attrs.get('last_name')
            date_of_birth = attrs.get('date_of_birth')
            age = attrs.get('age')
            weight = attrs.get('weight')
            height = attrs.get('height')
            # gender = attrs.get('gender')
           
            user = self.context.get('user')
            user.update(phone =phone)
            user_obj = self.model.objects.filter(email = user)
            print('user from serializer -> ', user)
            user_obj.phone=phone, 
            user_obj.first_name=first_name,
            user_obj.last_name=last_name,
            user_obj.date_of_birth=date_of_birth,
            user_obj.age=age,
            user_obj.weight=weight,
            user_obj.height=height,
            user_obj.is_profile_complete = True
            user_obj.save()
            
            return attrs



            

    
    
   


