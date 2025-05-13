from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import User
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

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
