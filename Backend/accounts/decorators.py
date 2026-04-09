from functools import wraps
from django.http import JsonResponse
from .utils import get_user_from_request
from .models import UserCollection

def login_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        payload = get_user_from_request(request)
        if not payload:
            return JsonResponse({"success": False, "error": "Authentication required."}, status=401)
        
        user = UserCollection.find_by_id(payload["user_id"])
        if not user:
            return JsonResponse({"success": False, "error": "User not found."}, status=404)
            
        request.user = user  # Attach user to request
        return view_func(request, *args, **kwargs)
    return _wrapped_view

def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        payload = get_user_from_request(request)
        if not payload:
            return JsonResponse({"success": False, "error": "Authentication required."}, status=401)
        
        user = UserCollection.find_by_id(payload["user_id"])
        if not user:
            return JsonResponse({"success": False, "error": "User not found."}, status=404)
            
        if not user.get("is_admin", False):
            return JsonResponse({"success": False, "error": "Admin privileges required."}, status=403)
            
        request.user = user
        return view_func(request, *args, **kwargs)
    return _wrapped_view
