from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import TaxForm
from .serializers import TaxFormSerializer

class TaxFormViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tax forms to be viewed or edited.
    """
    queryset = TaxForm.objects.all().order_by('-created_at')
    serializer_class = TaxFormSerializer
    permission_classes = [permissions.IsAuthenticated] # 或者根据您的需求设置权限

    # 您可以在这里添加自定义的 action 或者覆盖默认方法
