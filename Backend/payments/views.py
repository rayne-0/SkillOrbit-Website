import os
import json
import razorpay
from io import BytesIO
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from accounts.decorators import login_required
from accounts.utils import get_user_from_request
from courses.models import CourseCollection, EnrollmentCollection
from .models import OrderCollection
from reportlab.pdfgen import canvas
from bson import ObjectId
from accounts.models import UserCollection
from django.core.mail import EmailMessage
from django.conf import settings

# Load Razorpay Keys
# Use default test keys if environment variables aren't strictly set yet
RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_YourTestID')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'YourSecretKey')

# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

@csrf_exempt
@login_required
def create_order(request):
    """
    POST /api/payments/create-order/
    Payload: {"course_id": "string_id"}
    Returns order details required for Razorpay Checkout.
    """
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
        course_id = data.get('course_id')
        if not course_id:
            return JsonResponse({'success': False, 'error': 'course_id is required'}, status=400)

        payload = get_user_from_request(request)
        if not payload:
            return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
        user = UserCollection.find_by_id(payload['user_id'])

        # Check if already enrolled
        if EnrollmentCollection.get_enrollment(str(user['_id']), str(course_id)):
            return JsonResponse({'success': False, 'error': 'Already enrolled'}, status=400)

        course = CourseCollection.get_by_id(course_id)
        if not course:
            return JsonResponse({'success': False, 'error': 'Course not found'}, status=404)

        # Basic parsing of price string (e.g., "$14.99" -> 1499 paise/cents)
        # Using a fixed minimal test amount if parse fails
        price_str = str(course.get('price', 'Free'))
        amount = 10000  # Default 100.00 fallback in smallest currency unit

        if price_str.lower() == 'free':
            return JsonResponse({'success': False, 'error': 'Course is free. Direct enroll.'}, status=400)
        else:
            try:
                # Remove non-numeric characters ignoring decimals (assuming USD or INR)
                num_str = "".join(c for c in price_str if c.isdigit() or c == '.')
                # Convert to smallest unit (multiply by 100)
                amount = int(float(num_str) * 100)
            except:
                pass

        # Create Razorpay Order
        razorpay_order = razorpay_client.order.create({
            "amount": amount,
            "currency": "INR",  # Standardizing on INR for Razorpay India
            "payment_capture": "1"
        })

        # Save pending order in MongoDB
        our_order = OrderCollection.create_order(
            user_id=user['_id'],
            course_id=course_id,
            amount=amount,
            currency="INR",
            gateway_order_id=razorpay_order['id']
        )

        return JsonResponse({
            'success': True,
            'order_id': str(our_order['_id']),
            'razorpay_order_id': razorpay_order['id'],
            'amount': amount,
            'currency': "INR",
            'key_id': RAZORPAY_KEY_ID
        })

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@login_required
def verify_payment(request):
    """
    POST /api/payments/verify/
    Called by the frontend after Razorpay success callback.
    Payload: {"razorpay_payment_id": "...", "razorpay_order_id": "...", "razorpay_signature": "...", "course_id": "..."}
    """
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
        payment_id = data.get('razorpay_payment_id')
        r_order_id = data.get('razorpay_order_id')
        signature = data.get('razorpay_signature')
        course_id = data.get('course_id')

        # 1. Cryptographic Verification
        # This raises SignatureVerificationError if invalid
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': r_order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })

        # 2. Update DB Order
        order = OrderCollection.get_by_gateway_order_id(r_order_id)
        if not order:
            return JsonResponse({'success': False, 'error': 'Order context not found'}, status=404)

        OrderCollection.mark_paid(order['_id'], payment_id)

        # 3. Automatically Enroll User
        EnrollmentCollection.enroll_user(order['user_id'], course_id)

        # 4. Email the Invoice
        try:
            course = CourseCollection.get_by_id(course_id)
            user = UserCollection.get_by_id(order['user_id'])
            # Fetch the updated order to get the generated invoice_number
            updated_order = OrderCollection.get_by_id(order['_id'])
            
            pdf_buffer = get_invoice_pdf_buffer(updated_order, course, user)
            
            email = EmailMessage(
                subject=f"Your SkillOrbit Receipt - {updated_order.get('invoice_number', 'N/A')}",
                body=f"Hi {user.get('name', '')},\n\nThank you for enrolling in '{course.get('title', 'our course')}'.\nYour payment of {updated_order['currency']} {updated_order['amount']/100:.2f} was successful.\n\nPlease find your official PDF receipt attached.\n\nHappy Learning,\nThe SkillOrbit Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.get('email')]
            )
            email.attach(f"SkillOrbit_{updated_order.get('invoice_number', 'Receipt')}.pdf", pdf_buffer.getvalue(), 'application/pdf')
            email.send(fail_silently=True)
        except Exception as email_err:
            print(f"Failed to send invoice email: {email_err}")

        return JsonResponse({'success': True, 'message': 'Payment successful and course initialized!'})

    except razorpay.errors.SignatureVerificationError:
        return JsonResponse({'success': False, 'error': 'Signature Verification Failed. Potential Fraud.'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def get_invoice_pdf_buffer(order, course, base_user):
    """Helper to generate the PDF buffer so it can be emailed or downloaded."""
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    
    # PDF Content
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, 800, "INVOICE")
    
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 750, "SkillOrbit E-Learning Platform")
    p.setFont("Helvetica", 12)
    p.drawString(50, 735, "Email: support@skillorbit.com")
    
    p.setFont("Helvetica", 12)
    p.drawString(400, 750, f"Invoice #: {order.get('invoice_number', 'N/A')}")
    p.drawString(400, 735, f"Date: {order.get('updated_at', order.get('created_at')).strftime('%Y-%m-%d')}")
    
    p.drawString(50, 680, "Billed To:")
    p.drawString(50, 665, f"Name: {base_user.get('name', 'Learner')}")
    p.drawString(50, 650, f"Email: {base_user.get('email', 'N/A')}")
    
    p.line(50, 620, 550, 620)
    
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, 595, "Description")
    p.drawString(450, 595, "Amount")
    p.line(50, 585, 550, 585)
    
    p.setFont("Helvetica", 12)
    course_title = course.get('title', 'SkillOrbit Course Purchase') if course else 'Course Purchase'
    amount_str = f"{order.get('currency', 'INR')} {order.get('amount', 0) / 100:.2f}"
    
    p.drawString(50, 560, course_title)
    p.drawString(450, 560, amount_str)
    
    p.line(50, 540, 550, 540)
    
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, 515, "Total Paid:")
    p.drawString(450, 515, amount_str)
    
    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, 450, "Thank you for joining SkillOrbit! Happy Learning.")
    
    # Save PDF
    p.showPage()
    p.save()

    # Move to beginning of buffer
    buffer.seek(0)
    return buffer

@login_required
def generate_invoice(request, order_id):
    """
    GET /api/payments/invoice/<order_id>/
    Generates a dynamic PDF receipt for a successful order.
    """
    user_payload = get_user_from_request(request)
    if not user_payload:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    user = UserCollection.find_by_id(user_payload['user_id'])
    
    order = OrderCollection.get_by_id(order_id)
    if not order:
        return HttpResponse('Order not found.', status=404)

    if str(order['user_id']) != str(user['_id']):
        return HttpResponse('Unauthorized access to invoice.', status=403)

    if order['status'] != 'paid':
        return HttpResponse('Order is not completed yet.', status=400)

    course = CourseCollection.get_by_id(str(order['course_id']))
    base_user = UserCollection.get_by_id(str(order['user_id']))

    buffer = get_invoice_pdf_buffer(order, course, base_user)
    
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{order.get("invoice_number", "Invoice")}.pdf"'
    
    return response

@login_required
def list_orders(request):
    """
    GET /api/payments/orders/
    """
    payload = get_user_from_request(request)
    if not payload:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=401)
    
    user = UserCollection.find_by_id(payload['user_id'])
    if not user:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)
        
    orders = OrderCollection.get_user_orders(user['_id'])
    
    # Map to UI safe format
    mapped = []
    for o in orders:
        c = CourseCollection.get_by_id(str(o['course_id']))
        mapped.append({
            'order_id': str(o['_id']),
            'course_title': c.get('title', 'Unknown Course') if c else 'Unknown',
            'amount_paid': o['amount'] / 100,
            'currency': o['currency'],
            'status': o['status'],
            'invoice_number': o.get('invoice_number'),
            'date': o['created_at'].strftime("%b %d, %Y")
        })

    return JsonResponse({'success': True, 'orders': mapped})
