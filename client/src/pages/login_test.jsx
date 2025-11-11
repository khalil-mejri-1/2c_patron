import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; 

export default function LoginTest() {
  // 1. استخدام دالة تهيئة State لقراءة القيمة من LocalStorage عند تحميل المكون
  // يتم تنفيذ هذه الدالة مرة واحدة فقط عند التحميل الأولي
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('loggedInUserEmail') || null;
  });

  const handleCredentialResponse = useCallback((response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    
    try {
      const userObject = jwtDecode(response.credential);
      console.log('Decoded User Data:', userObject);
      
      // 2. تحديث الـ State وحفظ البريد الإلكتروني في LocalStorage
      setUserEmail(userObject.email);
      localStorage.setItem('loggedInUserEmail', userObject.email);
      
      // ملاحظة: يُفضل دائمًا إرسال response.credential إلى الخادم للتحقق النهائي
      
    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  }, []);

  const logout = () => {
    if (!userEmail) {
        console.log("No user is currently logged in.");
        return;
    }

    if (window.google && window.google.accounts && window.google.accounts.id) {
      // 3. استخدام userEmail من الـ State لعمل revoke
      window.google.accounts.id.revoke(userEmail, (done) => {
        console.log('Consent revoked for:', userEmail, done);
        
        // 4. مسح الـ State والبريد الإلكتروني من LocalStorage
        setUserEmail(null); 
        localStorage.removeItem('loggedInUserEmail');
        
        // إعادة تحميل الواجهة الرسومية لضمان ظهور زر تسجيل الدخول
        window.google.accounts.id.renderButton(
             document.getElementById("google-sign-in-button"),
             { /* ... button options ... */ }
        );
      });
    } else {
      console.error("Google Identity Services script not yet loaded or initialized.");
    }
  };

  useEffect(() => {
    // نتحقق من window.google فقط لتنفيذ عملية التهيئة والعرض
    if (window.google) {
      
      window.google.accounts.id.initialize({
        client_id: "509196356589-2sqg41uk19epl6m7bpbaeee2i8pmkpqm.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        context: "signin",
        ux_mode: "popup",
        auto_prompt: false,
      });

      // 5. عرض زر تسجيل الدخول فقط إذا لم يكن المستخدم مسجلاً
      // نستخدم userEmail الذي تم تحميله من localStorage هنا
      if (!userEmail) {
          window.google.accounts.id.renderButton(
            document.getElementById("google-sign-in-button"), 
            { 
              type: "standard", 
              shape: "rectangular", 
              theme: "outline", 
              text: "signin_with",
              size: "large", 
              logo_alignment: "left"
            } 
          );
      }
      // إذا كان المستخدم مسجلاً (userEmail موجود)، فلن يتم عرض زر Google
    }
  }, [handleCredentialResponse, userEmail]); // إضافة userEmail كـ dependency لتحديث العرض عند تسجيل الخروج/الدخول

  return (
    <div>
      <h2>Google Sign-In Example</h2>
      
      {/* عرض حالة تسجيل الدخول */}
      {userEmail ? (
          <>
            <p>Logged in as: <strong>{userEmail}</strong></p>
            <button onClick={logout}>Logout</button>
          </>
      ) : (
          <>
             {/* عرض رسالة عند عدم تسجيل الدخول */}
             <p>Please sign in.</p>
             {/* div الذي سيعرض فيه زر Google، ويتم إخفاؤه/إظهاره عن طريق دالة renderButton في useEffect */}
             <div id="google-sign-in-button"></div>
          </>
      )}
    </div>
  );
}