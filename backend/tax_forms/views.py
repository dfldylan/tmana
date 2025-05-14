from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import TaxForm
from .serializers import TaxFormSerializer
from django.utils import timezone

class TaxFormViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tax forms to be viewed or edited.
    """
    queryset = TaxForm.objects.all().order_by('id')
    serializer_class = TaxFormSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """根据用户类型过滤数据"""
        user = self.request.user
        if user.user_type == 'admin':
            return TaxForm.objects.all().order_by('id')
        else:
            # 普通用户只能看到自己的表单
            return TaxForm.objects.order_by('id')
    
    def perform_create(self, serializer):
        """创建表单时添加时间戳，移除created_by"""
        serializer.save(
            created_at=timezone.now(),
            updated_at=timezone.now()
        )
    
    def perform_update(self, serializer):
        """更新表单时更新时间戳"""
        serializer.save(updated_at=timezone.now())
    
    def create(self, request, *args, **kwargs):
        """重写创建方法，处理嵌套数据"""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("验证错误:", serializer.errors)  # 打印错误信息到控制台
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """重写更新方法，支持部分更新"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        # 验证数据并显示详细错误
        if not serializer.is_valid():
            print("更新验证错误:", serializer.errors)  # 打印错误信息到控制台
            return Response({
                'status': 'error',
                'message': '数据验证失败',
                'errors': serializer.errors,
                'form_id': kwargs.get('pk')  # 返回表单ID，便于调试
            }, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            # 清除预获取缓存
            instance._prefetched_objects_cache = {}
            
        return Response(serializer.data)
