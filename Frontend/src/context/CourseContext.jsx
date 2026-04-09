import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_BASE = 'http://localhost:8000/api/courses';
const PAYMENTS_API = 'http://localhost:8000/api/payments';
const CourseContext = createContext(null);

function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CourseProvider({ children }) {
  const { user } = useAuth(); // Monitor auth state to re-fetch private data
  
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------------------------------------------------- //
  //  Fetch Global Courses (Public)
  // ---------------------------------------------------------------------- //
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------- //
  //  Fetch Enrollments (Authenticated)
  // ---------------------------------------------------------------------- //
  const fetchEnrollments = useCallback(async () => {
    try {
      const stored = localStorage.getItem('skillorbit_tokens');
      if (!stored) return;
      
      const tokens = JSON.parse(stored);
      if (!tokens?.access) return;

      const res = await fetch(`${API_BASE}/user/enrolled/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      const data = await res.json();
      if (data.success) {
        setEnrollments(data.enrollments);
      }
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    }
  }, []);

  // Fetch when the component mounts or when the user changes
  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [fetchCourses, fetchEnrollments, user]);

  // ---------------------------------------------------------------------- //
  //  Enroll in Course
  // ---------------------------------------------------------------------- //
  const enrollUser = async (courseId) => {
    const stored = localStorage.getItem('skillorbit_tokens');
    if (!stored) throw new Error("Please log in to enroll.");
    const tokens = JSON.parse(stored);

    const res = await fetch(`${API_BASE}/${courseId}/enroll/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.access}` }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    
    // Refresh enrollments after success
    await fetchEnrollments();
    return data;
  };

  // ---------------------------------------------------------------------- //
  //  Mark Lesson Complete
  // ---------------------------------------------------------------------- //
  const markLessonComplete = async (courseId, lessonId) => {
    const stored = localStorage.getItem('skillorbit_tokens');
    if (!stored) return;
    const tokens = JSON.parse(stored);
    
    const res = await fetch(`${API_BASE}/${courseId}/progress/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokens.access}` 
      },
      body: JSON.stringify({ lesson_id: lessonId })
    });
    
    const data = await res.json();
    if (data.success) {
      await fetchEnrollments(); // Re-sync progress state
    }
    return data;
  };
  
  // ---------------------------------------------------------------------- //
  //  Purchase Paid Course (Razorpay)
  // ---------------------------------------------------------------------- //
  const purchaseCourse = async (courseId) => {
    const stored = localStorage.getItem('skillorbit_tokens');
    if (!stored) throw new Error("Please log in to purchase.");
    const tokens = JSON.parse(stored);

    // 1. Create order on backend
    const ordRes = await fetch(`${PAYMENTS_API}/create-order/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokens.access}` },
      body: JSON.stringify({ course_id: courseId })
    });
    const ordData = await ordRes.json();

    if (!ordData.success) {
      // If the backend says it's free, try falling back to standard enroll
      if (ordData.error && ordData.error.includes("free")) {
        return enrollUser(courseId);
      }
      throw new Error(ordData.error || "Failed to create order");
    }

    // 2. Load script
    const res = await loadRazorpayScript();
    if (!res) throw new Error("Razorpay SDK failed to load. Are you offline?");

    return new Promise((resolve, reject) => {
      // 3. Init Razorpay
      const options = {
        key: ordData.key_id,
        amount: ordData.amount,
        currency: ordData.currency,
        name: "SkillOrbit",
        description: "Course Purchase",
        order_id: ordData.razorpay_order_id,
        handler: async function (response) {
          try {
            // 4. Verify payment
            const verRes = await fetch(`${PAYMENTS_API}/verify/`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${tokens.access}` },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                course_id: courseId
              })
            });
            const verData = await verRes.json();

            if (verData.success) {
              await fetchEnrollments();
              resolve(verData);
            } else {
              reject(new Error(verData.error || "Payment verification failed"));
            }
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name: user?.name || "Learner",
          email: user?.email || "",
          contact: "9999999999" // Can be requested in a form if needed
        },
        theme: {
          color: "#0056D2"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        reject(new Error(response.error.description || "Payment Failed"));
      });
      paymentObject.open();
    });
  };

  // Helper to quickly check if user is enrolled in a course
  const isEnrolled = useCallback((courseId) => {
    return enrollments.some(e => String(e.course_id) === String(courseId));
  }, [enrollments]);

  return (
    <CourseContext.Provider value={{
      courses,
      enrollments,
      loading,
      error,
      enrollUser,
      purchaseCourse,
      markLessonComplete,
      refreshEnrollments: fetchEnrollments,
      refreshCourses: fetchCourses,
      isEnrolled
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within <CourseProvider>');
  return ctx;
}
