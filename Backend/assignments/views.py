import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
from datetime import datetime
from core.db import db

# In a real app, you'd use decorators to verify JWTs, but for now we'll accept requests directly.

@csrf_exempt
def assignments_list_create(request):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
    
    collection = db['assignments']
    
    if request.method == 'GET':
        # List all assignments
        assignments_cursor = collection.find()
        assignments = []
        for a in assignments_cursor:
            a['_id'] = str(a['_id'])
            assignments.append(a)
        return JsonResponse({'success': True, 'assignments': assignments})
        
    elif request.method == 'POST':
        # Submit a new assignment
        try:
            data = json.loads(request.body)
            new_assignment = {
                'assignmentId': data.get('assignmentId'),
                'studentId': data.get('studentId'),
                'studentName': data.get('studentName'),
                'courseName': data.get('courseName'),
                'title': data.get('title'),
                'textContent': data.get('textContent'),
                'status': 'pending',
                'submittedAt': datetime.utcnow().isoformat(),
            }
            result = collection.insert_one(new_assignment)
            new_assignment['_id'] = str(result.inserted_id)
            return JsonResponse({'success': True, 'assignment': new_assignment}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
            
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def assignment_detail(request, assignment_id):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
        
    collection = db['assignments']
    
    if request.method == 'GET':
        try:
            a = collection.find_one({'_id': ObjectId(assignment_id)})
            if not a:
                return JsonResponse({'success': False, 'error': 'Assignment not found'}, status=404)
            a['_id'] = str(a['_id'])
            return JsonResponse({'success': True, 'assignment': a})
        except Exception as e:
             return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def grade_assignment(request, assignment_id):
    if db is None:
        return JsonResponse({'success': False, 'error': 'Database not connected'}, status=500)
        
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            grade = data.get('grade')
            feedback = data.get('feedback')
            
            collection = db['assignments']
            result = collection.update_one(
                {'_id': ObjectId(assignment_id)},
                {'$set': {'grade': grade, 'feedback': feedback, 'status': 'reviewed'}}
            )
            
            if result.matched_count == 0:
                return JsonResponse({'success': False, 'error': 'Assignment not found'}, status=404)
                
            return JsonResponse({'success': True, 'message': 'Assignment graded successfully'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
            
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
