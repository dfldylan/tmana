from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaxFormViewSet

router = DefaultRouter()
router.register(r'', TaxFormViewSet) # 将 '' 注册到 TaxFormViewSet

urlpatterns = [
    path('', include(router.urls)),
]