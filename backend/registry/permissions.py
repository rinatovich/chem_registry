from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Разрешает редактирование объекта только его автору (created_by).
    Для остальных - только чтение.
    """
    def has_object_permission(self, request, view, obj):
            # Чтение разрешено всем (публичные данные)
            if request.method in permissions.SAFE_METHODS:
                return True

            # Редактирование - только владелец
            return obj.created_by == request.user

class IsControllerOrAdmin(permissions.BasePermission):
    """
    Доступ только для Админов и Контролирующих органов
    (например, для кнопки "Одобрить / Отклонить")
    """
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and (user.is_staff or user.role in ['ADMIN', 'CONTROLLER'])