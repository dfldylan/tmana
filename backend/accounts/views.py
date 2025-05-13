from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from .models import User
from .serializers import UserSerializer, UserRegistrationSerializer
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import generics

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)  # 创建会话
            # 返回用户信息，不返回token
            return JsonResponse({
                "success": True, 
                "username": user.username,
                "user_id": user.id
            })
        return JsonResponse({"error": "Invalid credentials"}, status=400)

# 添加一个新视图检查会话状态
class CheckAuthView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return JsonResponse({
                "isAuthenticated": True,
                "username": request.user.username,
                "user_id": request.user.id
            })
        return JsonResponse({"isAuthenticated": False}, status=401)

# 添加登出视图
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return JsonResponse({"success": True})

class UserRegistrationView(generics.CreateAPIView):
    """
    用户注册视图。
    允许任何人 (IsAuthenticatedOrReadOnly 通常用于列表/详情，对于创建通常是 AllowAny)
    通过 POST 请求创建新用户。
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] # 允许任何用户访问此端点进行注册

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # 您可以在这里添加额外的逻辑，例如发送欢迎邮件
            # 或者直接返回成功信息和用户信息（不含密码）
            
            # 为了安全，通常不直接返回创建的用户对象的所有字段，特别是密码。
            # 可以创建一个 UserSerializer (不含密码字段) 来序列化 user 对象返回。
            # 或者简单返回一个成功消息。
            return Response(
                {"message": "用户注册成功。", "user_id": user.id, "username": user.username, "email": user.email},
                status=status.HTTP_201_CREATED
            )
        
        # 如果序列化器验证失败，错误将包含在 serializer.errors 中
        # DRF 的 CreateAPIView 会自动处理这个并返回 400 Bad Request
        # 但如果想自定义错误响应格式，可以覆盖此行为
        # 例如，提取更友好的错误信息
        error_messages = []
        for field, errors in serializer.errors.items():
            for error in errors:
                error_messages.append(f"{field}: {error}")
        
        return Response({"errors": serializer.errors, "detail": "注册失败，请检查输入数据。"}, status=status.HTTP_400_BAD_REQUEST)
