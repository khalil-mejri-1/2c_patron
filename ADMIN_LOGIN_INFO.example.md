# 🔐 معلومات تسجيل الدخول - Google OAuth Configuration

## 📋 بيانات الاعتماد

### Google OAuth 2.0 Client ID
```
Client ID: YOUR_CLIENT_ID_HERE
Client Secret: YOUR_CLIENT_SECRET_HERE
Project ID: YOUR_PROJECT_ID_HERE
```

**⚠️ ملاحظة:** هذا ملف مثال فقط. يجب عليك:
1. نسخ هذا الملف إلى `ADMIN_LOGIN_INFO.md`
2. استبدال القيم الافتراضية ببياناتك الحقيقية
3. التأكد من أن `ADMIN_LOGIN_INFO.md` موجود في `.gitignore`

---

## 🔑 كيفية الدخول كمسؤول (Admin)
 
### الطريقة 1: حساب Admin المدمج (Hardcoded)
يمكنك تسجيل الدخول مباشرة باستخدام:
- **البريد الإلكتروني:** `admin@admin.com`
- **كلمة المرور:** `admin123`

> ⚠️ **ملاحظة:** هذا الحساب مبرمج مباشرة في ملف `AuthForm.jsx`

### الطريقة 2: تسجيل الدخول عبر Google
1. سجل الدخول بحساب Google الخاص بك
2. سيتم إنشاء حساب جديد تلقائياً بصلاحيات `client`
3. لتحويله إلى Admin، استخدم إحدى الطرق التالية:

#### أ) عبر API:
```bash
PUT http://localhost:3000/api/users/:user_id/statut
Content-Type: application/json

{
  "statut": "admin"
}
```

#### ب) عبر MongoDB مباشرة:
1. افتح MongoDB Atlas أو MongoDB Compass
2. ابحث عن المستخدم في collection `users`
3. غيّر حقل `statut` من `"client"` إلى `"admin"`

---

## 🌐 عناوين URL المصرح بها (Authorized Redirect URIs)

تأكد من إضافة هذه العناوين في Google Cloud Console:

### للتطوير المحلي:
- `http://localhost:5173/login`
- `http://localhost:5173/register`
- `http://localhost:5174/login`
- `http://localhost:5174/register`

### للإنتاج:
- `https://your-domain.com/login`
- `https://your-domain.com/register`

### JavaScript Origins:
- `http://localhost:5173`
- `http://localhost:5174`
- `https://your-domain.com`

---

## 🚀 خطوات تشغيل المشروع

### 1. تشغيل الخادم (Server):
```bash
cd server
npm install
npm start
```

### 2. تشغيل العميل (Client):
```bash
cd client
npm install
npm run dev
```

---

## 🔒 نظام الصلاحيات

### أنواع المستخدمين:
1. **client** - مستخدم عادي (القيمة الافتراضية)
2. **admin** - مسؤول (صلاحيات كاملة)

### حقول المستخدم في قاعدة البيانات:
```javascript
{
  nom: String,           // اسم المستخدم
  mail: String,          // البريد الإلكتروني (فريد)
  mot_de_pass: String,   // كلمة المرور
  image: String,         // رابط الصورة الشخصية
  statut: String,        // 'admin' أو 'client'
  abonne: String,        // 'oui' أو 'non' (للاشتراك VIP)
  createdAt: Date        // تاريخ الإنشاء
}
```

---

## 📝 ملاحظات مهمة

1. **الأمان:** يُنصح بشدة بتشفير كلمات المرور باستخدام bcrypt قبل حفظها في قاعدة البيانات
2. **JWT Tokens:** يمكن تحسين الأمان بإضافة نظام JWT للمصادقة
3. **Environment Variables:** يجب نقل Client Secret إلى ملف `.env` بدلاً من تخزينه في الكود
4. **HTTPS:** في الإنتاج، تأكد من استخدام HTTPS فقط

---

## 🆘 استكشاف الأخطاء

### مشكلة: لا يظهر زر Google Sign-In
- تأكد من تحميل السكريبت: `https://accounts.google.com/gsi/client`
- افتح Console وتحقق من وجود أخطاء JavaScript

### مشكلة: خطأ "Invalid Client ID"
- تأكد من أن Client ID صحيح في جميع الملفات
- تحقق من إعدادات Google Cloud Console

### مشكلة: لا يمكن الدخول كـ Admin
- تحقق من قيمة حقل `statut` في قاعدة البيانات
- تأكد من استخدام البريد الإلكتروني الصحيح

---

✨ **جاهز للاستخدام!** يمكنك الآن تسجيل الدخول باستخدام Google أو الحساب التقليدي.
