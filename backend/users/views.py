from rest_framework import generics, permissions
from .serializers import RegisterSupplierSerializer, CurrentUserSerializer
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny] # Разрешено всем
    serializer_class = RegisterSupplierSerializer

class MeView(generics.RetrieveUpdateAPIView):
    """Вернуть инфо о текущем залогиненном юзере"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user