from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Разрешает редактирование объекта:
    1. Автору (created_by)
    2. Администраторам (is_staff)
    Для остальных - только чтение.
    """
    def has_object_permission(self, request, view, obj):
            # Чтение разрешено всем (безопасные методы: GET, HEAD, OPTIONS)
            if request.method in permissions.SAFE_METHODS:
                return True

            # Редактирование: либо владелец, либо админ
            return (obj.created_by == request.user) or request.user.is_staff

class IsControllerOrAdmin(permissions.BasePermission):
    """
    Доступ только для Админов и Контролирующих органов
    """
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and (user.is_staff or user.role in ['ADMIN', 'CONTROLLER'])