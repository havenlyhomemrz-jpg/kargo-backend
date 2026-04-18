# Kargo System - Tam İcra

Node.js + React ilə tam işləyən Kargo sisteminin mağaza və kuryer idarəetməsi.

## 🚀 Çabuk Başlama

### 2 Terminal - 5 Dəqiqə

**Terminal 1 - Backend:**
```bash
cd "c:\Users\serxa\Downloads\Kargo system"
npm install
npm run dev
```

Server: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

Frontend: http://localhost:3000

## 🔐 Admin Login

```
Ad: admin
Kod: 1234
Rol: Admin seçin
```

## ➕ Mağaza Əlavə Etmə

Admin panelində "Mağaza Əlavə Et" tab-ə basın:

```
Mağaza Adı: Bakı Merkez
Kod: BAK_MERKEZ_001
Telefon: +994505555501
Ünvan: 28 May kuçəsi 5
Metro Qiyməti: 50
Xaric Qiyməti: 100

→ "Mağaza Əlavə Et" bash
↓
✅ "Mağaza uğurla əlavə edildi"
```

## ➕ Kuryer Əlavə Etmə

Admin panelində "Kuryer Əlavə Et" tab-ə basın:

```
Kuryer Adı: Murad Qahraman
Kod: MURAD_QAH_001
Telefon: +994517777701

→ "Kuryer Əlavə Et" bash
↓
✅ "Kuryer uğurla əlavə edildi"
```

## 🔓 Yaradılan İstifadəçilər Login Edə Bilərlər

### Yeni Mağaza
```
Ad: Bakı Merkez
Kod: BAK_MERKEZ_001
Rol: Mağaza
```
→ Mağaza Paneli açılır

### Yeni Kuryer
```
Ad: Murad Qahraman
Kod: MURAD_QAH_001
Rol: Kuryer
```
→ Kuryer Paneli açılır

## 📚 Backend Endpoints

```
POST /api/auth/login
  Input: { name, code, role }
  Output: { token, user }

POST /api/admin/store/create
  Headers: Authorization: Bearer <TOKEN>
  Input: { name, code, phone, address, metroPrice, outsidePrice }
  Output: { message, store }

POST /api/admin/courier/create
  Headers: Authorization: Bearer <TOKEN>
  Input: { name, code, phone }
  Output: { message, courier }
```

## 📁 Proje Struktura

```
Kargo System/
├── src/
│   ├── app.js (Express entry point)
│   ├── controllers/
│   │   ├── authController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── storeModel.js
│   │   └── courierModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── adminRoutes.js
│   └── middlewares/
│       └── authMiddleware.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── StoreDashboard.js
│   │   │   ├── CourierDashboard.js
│   │   │   ├── LoginPage.css
│   │   │   ├── AdminPanel.css
│   │   │   └── Dashboard.css
│   │   ├── App.js
│   │   └── index.js
│   └── public/
│       └── index.html
│
└── Documentation/
    ├── QUICK_START.md
    ├── ADMIN_COMPLETE_GUIDE.md
    ├── API_TESTING.md
    ├── SYSTEM_ARCHITECTURE.md
    └── COMPLETION_SUMMARY.md
```

## ✨ Sistem Xüsusiyyətləri

- ✅ JWT Authentication
- ✅ Role-based Authorization (Admin, Store, Courier)
- ✅ Mağaza Yaratma (6 sahə)
- ✅ Kuryer Yaratma (3 sahə)
- ✅ Input Validasiyası
- ✅ Duplicate Kontrolü
- ✅ Success/Error Mesajları
- ✅ Responsive UI
- ✅ localStorage Session Storage
- ✅ CORS Support
- ✅ Azərbaycanca Interface

## 🧪 Test Kredentialləri

| Role | Ad | Kod |
|------|----|----|
| Admin | admin | 1234 |
| Store | Store1 | STORE001 |
| Courier | Courier1 | COURIER001 |

## 📖 Şərh Faylları

- **QUICK_START.md** - 5 dəqiqəlik başlama
- **ADMIN_COMPLETE_GUIDE.md** - Tam tətbiq
- **API_TESTING.md** - API test mümunələri
- **SYSTEM_ARCHITECTURE.md** - Sistem qurması
- **COMPLETION_SUMMARY.md** - Tamamlama xülasəsi

## 🔧 Teknoloji Stack

**Frontend:**
- React 18.2.0
- React Router 6.14.0
- Axios 1.4.0

**Backend:**
- Node.js
- Express 4.18.2
- JWT (jsonwebtoken)
- CORS

**StorageDB:**
- In-Memory Arrays

## ⚠️ Xəta Həlli

### Port istifadə olunur
```bash
PORT=5000 npm run dev
```

### Modullar tapılmır
```bash
npm install
```

### CORS xətası
Backend-i restart edin:
```bash
npm run dev
```

## 🎯 Sonraki Addımlar

1. ✅ **Login Sistemi** - Tamamlanmış
2. ✅ **Admin Paneli** - Tamamlanmış (Mağaza + Kuryer)
3. ⏳ **Sifarişlər** - Sonraki
4. ⏳ **Balans Management** - Sonraki
5. ⏳ **Reports** - Sonraki

## 📞 Dəstək

Problemlər varsa:
1. QUICK_START.md oxuyun
2. API_TESTING.md -də cURL nümunələrinə baxın
3. SYSTEM_ARCHITECTURE.md -də sistem qurması baxın

---

**Haza başlaya bilərsiniz! 🚀**


