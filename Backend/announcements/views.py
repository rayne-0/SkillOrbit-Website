import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
from datetime import datetime
from core.db import db

@csrf_exempt
def announcements_list_create(request):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
    
    collection = db['announcements']
    
    if request.method == 'GET':
        cursor = collection.find().sort('date', -1)
        announcements = []
        for a in cursor:
            a['id'] = str(a['_id'])
            del a['_id']
            announcements.append(a)
        return JsonResponse({'success': True, 'announcements': announcements})
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_ann = {
                'title': data.get('title'),
                'message': data.get('message'),
                'type': data.get('type', 'system'),
                'link': data.get('link', ''),
                'date': datetime.utcnow().isoformat(),
                'read': False # usually stored per-user, simplified here
            }
            result = collection.insert_one(new_ann)
            new_ann['id'] = str(result.inserted_id)
            del new_ann['_id']
            return JsonResponse({'success': True, 'announcement': new_ann}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
            
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def announcement_detail_delete(request, ann_id):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
        
    collection = db['announcements']
    
    if request.method == 'DELETE':
        try:
            result = collection.delete_one({'_id': ObjectId(ann_id)})
            if result.deleted_count == 0:
                return JsonResponse({'success': False, 'error': 'Announcement not found'}, status=404)
            return JsonResponse({'success': True, 'message': 'Announcement deleted'})
        except Exception as e:
             return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def mark_all_read(request):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
    if request.method == 'PUT':
        try:
            collection = db['announcements']
            collection.update_many({}, {'$set': {'read': True}})
            return JsonResponse({'success': True, 'message': 'All marked as read'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def mark_read(request, ann_id):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
    if request.method == 'PUT':
        try:
            collection = db['announcements']
            collection.update_one({'_id': ObjectId(ann_id)}, {'$set': {'read': True}})
            return JsonResponse({'success': True, 'message': 'Marked as read'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
