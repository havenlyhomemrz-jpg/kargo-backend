# Sistem Arxitekturası - Visual Overview

## 🏗️ Sistem Komponetlər

```
┌─────────────────────────────────────────────────────────────────┐
│                    KARGO SYSTEMI                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           FRONTEND (React)                               │   │
│  │           localhost:3000                                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  ┌────────────────┐  ┌────────────────┐               │   │
│  │  │  LoginPage     │──│  AdminDashboard::                │   │
│  │  │  - Rol Seçimi  │  │  - 3 Tabs                      │   │
│  │  │  - Ad          │  │  - Mağaza Formu                │   │
│  │  │  - Kod         │  │  - Kuryer Formu                │   │
│  │  │                │  │  - Success Mesajı              │   │
│  │  └────────────────┘  └────────────────┘               │   │
│  │         ↓                    ↓                           │   │
│  │    StoreDashboard    CourierDashboard                  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ↕  (axios)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           BACKEND (Node.js)                              │   │
│  │           localhost:4000                                 │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  Routes:                                                 │   │
│  │  - POST /api/auth/login                                │   │
│  │  - POST /api/admin/store/create                        │   │
│  │  - POST /api/admin/courier/create                      │   │
│  │                                                          │   │
│  │  Controllers:                                            │   │
│  │  - authController                                        │   │
│  │  - adminController                                       │   │
│  │                                                          │   │
│  │  Models:                                                 │   │
│  │  - storeModel      (stores array)                       │   │
│  │  - courierModel    (couriers array)                     │   │
│  │  - userModel       (users array)                        │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Login Sırası

```
User açar localhost:3000
         ↓
    LoginPage Göstərilir
         ↓
    Rol Seçir + Ad + Kod daxil edir
         ↓
    POST /api/auth/login
         ↓
         ├─ Uğun (200)
         │   ↓
         │   Token + User alır
         │   ↓
         │   localStorage saxla
         │   ↓
         │   Rol əsasında yönləndir
         │   ├─ admin    → /admin    (AdminDashboard)
         │   ├─ store    → /store    (StoreDashboard)
         │   └─ courier  → /courier  (CourierDashboard)
         │
         └─ Xəta (401)
             ↓
             Red Mesaj: "İstifadəçi adı və ya kod yanlışdır"
```

## 📝 Admin Mağaza Əlavə Sırası

```
AdminDashboard açılır
         ↓
"Mağaza Əlavə Et" Tab-ə basın
         ↓
    Form Göstərilir:
    - Mağaza Adı
    - Kod
    - Telefon
    - Ünvan
    - Metro Qiyməti
    - Xaric Qiyməti
         ↓
    Formu doldur
         ↓
    "Mağaza Əlavə Et" bash
         ↓
    POST /api/admin/store/create
    + Header: Authorization: Bearer <TOKEN>
    + Body: form data
         ↓
         ├─ Validasyon OK (201)
         │   ↓
         │   Store əlavə edilir
         │   ↓
         │   Green Mesaj: "Mağaza uğurla əlavə edildi"
         │   ↓
         │   Form sıfırlandı
         │   ↓
         │   3 saniyə sonra mesaj yox olur
         │
         └─ Validasyon XƏTA (400/409)
             ↓
             Red Mesaj: 
             - "Bu adla mağaza artıq mövcuddur"
             - "Bu kodla mağaza artıq mövcuddur"
             - "Qiymətlər müsbət rəqəm olmalıdır"
             - "Bütün sahələr doldurulmalıdır"
             ↓
             Form burulur
```

## 🧑‍💼 Yaradılan Mağaza Login Sırası

```
Logout → /login qayıdır
         ↓
Yaradılan mağaza məlumatları:
- Ad: Bakı Merkez
- Kod: BAK_MERKEZ_001
- Rol: Mağaza
         ↓
    POST /api/auth/login
         ↓
    Mağaza tapıldı ✅
         ↓
    StoreDashboard
         ↓
    Mağaza panel göstərilir
```

## 📊 Database (In-Memory)

```
Users Array:
┌────────────────────────────────────────┐
│ id:1, name:"admin", code:"1234"        │
│ id:2, name:"Store1", code:"STORE001"   │
│ id:3, name:"Courier1", code:"COURIER001"
└────────────────────────────────────────┘

Stores Array:
┌──────────────────────────────────────────────────┐
│ id:1, name:"Bakı Mağazası",                      │
│     code:"BAK001", phone:"+994505555555",        │
│     address:"Nizami k., 1A",                     │
│     metroPrice:50, outsidePrice:100,             │
│     balance:0, createdAt:2026-04-05             │
│                                                  │
│ id:1712282400000, name:"Bakı Merkez",           │
│     code:"BAK_MERKEZ_001", phone:"+994505555501",
│     address:"28 May k., 5",                      │
│     metroPrice:50, outsidePrice:100,             │
│     balance:0, createdAt:2026-04-05             │
└──────────────────────────────────────────────────┘

Couriers Array:
┌──────────────────────────────────────────────────┐
│ id:1, name:"Əli Kuryer",                         │
│     code:"COURIER001", phone:"+994507777777",   │
│     balance:0, createdAt:2026-04-05             │
│                                                  │
│ id:1712282450000, name:"Murad Qahraman",        │
│     code:"MURAD_QAH_001", phone:"+994517777701",
│     balance:0, createdAt:2026-04-05             │
└──────────────────────────────────────────────────┘
```

## 🎨 Frontend Components Ağacı

```
App.js (Router)
│
├─ LoginPage (/login)
│   ├─ Role Select
│   ├─ Name Input
│   ├─ Code Input
│   └─ API Call (POST /api/auth/login)
│
├─ AdminDashboard (/admin) [Protected]
│   ├─ Tabs
│   │   ├─ Home
│   │   ├─ Store Creation Form
│   │   │   ├─ Name Input
│   │   │   ├─ Code Input
│   │   │   ├─ Phone Input
│   │   │   ├─ Address Input
│   │   │   ├─ Metro Price Input
│   │   │   ├─ Outside Price Input
│   │   │   └─ API Call (POST /api/admin/store/create)
│   │   └─ Courier Creation Form
│   │       ├─ Name Input
│   │       ├─ Code Input
│   │       ├─ Phone Input
│   │       └─ API Call (POST /api/admin/courier/create)
│   │
│   ├─ Messages
│   │   ├─ Success Message (Green, 3sec)
│   │   └─ Error Message (Red)
│   │
│   └─ Loading State
│
├─ StoreDashboard (/store) [Protected]
│   └─ Store Info
│
└─ CourierDashboard (/courier) [Protected]
    └─ Courier Info
```

## 📡 API Endpoints

```
┌────────────────────────────────────────────────────┐
│              Authentication                        │
├────────────────────────────────────────────────────┤
│ POST /api/auth/login                              │
│   Input: { name, code, role }                     │
│   Output: { token, user }                         │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│              Admin Endpoints                       │
├────────────────────────────────────────────────────┤
│ POST /api/admin/store/create                      │
│   Headers: Authorization: Bearer <TOKEN>          │
│   Input: {                                        │
│     name, code, phone, address,                   │
│     metroPrice, outsidePrice                      │
│   }                                               │
│   Output: { message, store }                      │
│                                                  │
│ POST /api/admin/courier/create                    │
│   Headers: Authorization: Bearer <TOKEN>          │
│   Input: { name, code, phone }                    │
│   Output: { message, courier }                    │
└────────────────────────────────────────────────────┘
```

## 🔐 Security Flow

```
Client Request
       ↓
Check Headers (Authorization: Bearer <token>)
       ↓
       ├─ Token yoxdur → 401 Unauthorized
       │
       └─ Token var → Verify JWT
             ↓
             ├─ Token invalid → 403 Forbidden
             │
             └─ Token valid → Check Role
                   ↓
                   ├─ User not admin → 403 Forbidden
                   │
                   └─ Is admin → Allow Request
                         ↓
                         Process Request
```

## 📱 Frontend File Structure

```
frontend/
├── public/
│   └── index.html (CORS setup, styles)
│
├── src/
│   ├── index.js (Entry point)
│   │
│   ├── App.js
│   │   ├── React Router setup
│   │   ├── State management (user, token)
│   │   └── Route protection
│   │
│   ├── pages/
│   │   ├── LoginPage.js (Login form + API)
│   │   ├── LoginPage.css (Login styles)
│   │   │
│   │   ├── AdminDashboard.js (Admin with tabs)
│   │   ├── StoreDashboard.js (Store panel)
│   │   ├── CourierDashboard.js (Courier panel)
│   │   │
│   │   ├── Dashboard.css (Common dashboard)
│   │   └── AdminPanel.css (Admin tabs + forms)
│   │
│   └── App.css
│
└── package.json
```

## 🔧 Backend File Structure

```
src/
├── app.js (Express setup, CORS, routes)
│
├── routes/
│   ├── authRoutes.js (POST /api/auth/login)
│   └── adminRoutes.js (Admin endpoints)
│
├── controllers/
│   ├── authController.js (login logic)
│   └── adminController.js (createStore, createCourier)
│
├── models/
│   ├── userModel.js (users array + functions)
│   ├── storeModel.js (stores array + functions)
│   └── courierModel.js (couriers array + functions)
│
└── middlewares/
    └── authMiddleware.js (JWT verify, role check)
```

## ✨ Texnoloji Stack

```
Frontend:
├─ React 18.2.0
├─ React Router Dom 6.14.0
├─ Axios 1.4.0
└─ CSS3 (Grid, Flexbox)

Backend:
├─ Node.js
├─ Express 4.18.2
├─ JWT (jsonwebtoken)
├─ CORS
└─ dotenv

Data Storage:
└─ In-Memory Arrays (stores, couriers, users)
```

## 🎯 Workflow Summary

```
1. User açır frontend → LoginPage
                            ↓
2. Role seçir + Ad + Kod daxil edir
                            ↓
3. Backend-ə login istəyi
                            ↓
4. Validasiya → JWT token
                            ↓
5. localStorage-ə token saxla
                            ↓
6. Rol əsasında yönləndir (admin/store/courier)
                            ↓
7. Admin → AdminDashboard açılır
                            ↓
8. Mağaza/Kuryer formu doldur
                            ↓
9. Backend-ə POST istəyi
                            ↓
10. Validasiya (duplikat check, input validation)
                            ↓
11. Mağaza/Kuryer yaradılır
                            ↓
12. Success mesaj göstərilir
                            ↓
13. Yaradılan mağaza/kuryer artık login edə bilər
```

---

**Tam sistem hazır! 🚀**
