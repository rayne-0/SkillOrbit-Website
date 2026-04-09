import uuid
from datetime import datetime
from bson import ObjectId
from core.db import db

class OrderCollection:
    collection = db.orders

    @classmethod
    def create_order(cls, user_id, course_id, amount, currency="INR", gateway_order_id=None):
        """
        Creates a new pending order transaction in the database.
        :param user_id: string Mongo ObjectId of the user
        :param course_id: string Mongo ObjectId of the course
        :param amount: int, amount in smallest currency unit (e.g., paise for INR)
        :param currency: str, e.g., 'INR'
        :param gateway_order_id: str, the Razorpay order ID
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        if isinstance(course_id, str):
            course_id = ObjectId(course_id)

        doc = {
            "user_id": user_id,
            "course_id": course_id,
            "amount": amount,
            "currency": currency,
            "gateway_order_id": gateway_order_id,
            "gateway_payment_id": None,
            "invoice_number": None,
            "status": "created",  # created, paid, failed
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = cls.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    @classmethod
    def get_by_gateway_order_id(cls, gateway_order_id):
        return cls.collection.find_one({"gateway_order_id": gateway_order_id})
        
    @classmethod
    def get_by_id(cls, order_id):
        try:
            return cls.collection.find_one({"_id": ObjectId(order_id)})
        except:
            return None

    @classmethod
    def mark_paid(cls, order_id, gateway_payment_id):
        """
        Updates an order as paid and creates an invoice number.
        """
        invoice_num = f"INV-{datetime.utcnow().strftime('%Y%m')}-{str(uuid.uuid4())[:6].upper()}"
        cls.collection.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {
                "status": "paid",
                "gateway_payment_id": gateway_payment_id,
                "invoice_number": invoice_num,
                "updated_at": datetime.utcnow()
            }}
        )
        return invoice_num

    @classmethod
    def get_user_orders(cls, user_id):
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return list(cls.collection.find({"user_id": user_id}).sort("created_at", -1))
