from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model() # 获取当前项目使用的用户模型

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'is_active')
        read_only_fields = ('id',)

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name') # 根据你的用户模型调整字段
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_email(self, value):
        """
        检查邮箱是否已被注册。
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("此邮箱地址已被注册。")
        return value

    def validate_username(self, value):
        """
        检查用户名是否已被注册。
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("此用户名已被占用。")
        return value

    def validate(self, attrs):
        """
        检查两次输入的密码是否一致。
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "两次输入的密码不匹配。"})
        
        # Django 的 validate_password 可能会抛出 DjangoValidationError，
        # DRF 希望捕获 serializers.ValidationError。
        # 此处已在 password 字段通过 validators 参数直接使用 validate_password，
        # DRF 会自动处理其抛出的 DjangoValidationError 并转换为 serializers.ValidationError。
        # 如果手动调用 validate_password，则需要像下面这样处理：
        # try:
        #     validate_password(attrs['password'], user=User(**attrs))
        # except DjangoValidationError as e:
        #     raise serializers.ValidationError(list(e.messages))

        return attrs

    def create(self, validated_data):
        """
        创建并返回一个新用户。
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type='user'  
        )
        return user