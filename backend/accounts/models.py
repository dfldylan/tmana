from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', '管理员'),
        ('user', '普通用户'),
    )
    
    user_type = models.CharField(
        max_length=10, 
        choices=USER_TYPE_CHOICES,
        default='user'
    )
    is_active = models.BooleanField(default=True)

    def is_admin(self):
        return self.user_type == 'admin'
