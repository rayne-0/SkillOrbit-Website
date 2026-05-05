import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
from core.db import db

@csrf_exempt
def mentors_list_create(request):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
    
    collection = db['mentors']
    
    if request.method == 'GET':
        cursor = collection.find()
        mentors = []
        for m in cursor:
            m['id'] = str(m['_id'])
            del m['_id']
            mentors.append(m)
        return JsonResponse({'success': True, 'mentors': mentors})
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_mentor = {
                'name': data.get('name'),
                'email': data.get('email'),
                'avatar': data.get('avatar'),
                'bio': data.get('bio'),
                'expertise': data.get('expertise', []),
                'schedule': data.get('schedule', ''),
                'assignedStudents': data.get('assignedStudents', [])
            }
            result = collection.insert_one(new_mentor)
            new_mentor['id'] = str(result.inserted_id)
            del new_mentor['_id']
            return JsonResponse({'success': True, 'mentor': new_mentor}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
            
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
