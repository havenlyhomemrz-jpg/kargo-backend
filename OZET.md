# 📚 Kargo Delivery System - ÖZET

Tam qurulu, production-ready Kargo Delivery System!

---

## 📦 Nə Quruldu?

### ✅ Backend (Node.js + Express)
- **3 Model:** Store, Order, User
- **3 Controller:** Admin, Store, Courier
- **3 Route Set:** Admin, Store, Courier
- **Database:** In-Memory (Asanlıqla upgradeya)
- **15+ API Endpoints**

### ✅ Frontend (React + Material-UI)
- **3 Panel:** Admin, Store, Courier
- **5 Components:** AdminPanel, StorePanel, CourierPanel, api.js, App.jsx
- **Premium UI:** Material Design
- **Responsive:** Mobile/Tablet/Desktop
- **Azərbaycan Dili:** Tam yerli

---

## 🎯 Sistem Axını

```
┌──────────────────────────────────────────────────────────┐
│                  KARGO DELIVERY SYSTEM                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ADMIN                  STORE                 COURIER    │
│  ─────                  ─────                 ───────   │
│  │                      │                      │         │
│  ├─ Mağaza Yarat        ├─ Giriş              ├─ Giriş  │
│  │  └─ name             │  └─ name+code      │  └─ ID  │
│  │  └─ code             │                      │         │
│  │  └─ phone            ├─ Sifariş Yarat      ├─ Əlçat. │
│  │  └─ address          │  └─ customerName   │  Sifarış │
│  │  └─ metroPrice      │  └─ deliveryType   │         │
│  │  └─ outsidePrice    │  └─ location       ├─ Qəbul Et │
│  │                     │                      │  └─ Pick │
│  ├─ Sifarişi Görüş     ├─ Sifarişləri Gör  ├─ Status  │
│  │  └─ Cəmiyyət        │  └─ List tables    │  ├─ Pick │
│  │                     │                      │  ├─ Way │
│  ├─ Təsdiq Et          ├─ Balans             │  └─ Del. │
│  │  └─ approve         │  └─ View             │         │
│  │                     │                      ├─ Tamamlı │
│  └─ Test               └─ Test               │  Sifarış │
│                                              │         │
│  ✅ Sifarişi Təsdiq    →  📦 Qəbul Et  →   ✔️ Təhvil  │
│                                              │         │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Başlama (30 saniyə)

### Terminal 1 - Backend
```bash
cd "Kargo system"
npm start
```

### Terminal 2 - Frontend
```bash
cd "Kargo system\frontend"
npm install
npm start
```

✅ Hər ikisi açılacaq!

---

## 📁 Layihə Strukturası

```
Kargo system/
│
├── 📄 QURULUM.md .................. Tam qurulum qaydası
├── 📄 TEZLE_BASLAMA.md ........... 5 dəqiqəlik başlama
├── 📄 FRONTEND_UI.md ............. UI/UX Dokumentasiyası
│
├── src/ ........................... BACKEND
│   ├── app.js ..................... Ana server
│   ├── models/
│   │   ├── storeModel.js .......... Mağaza model
│   │   ├── orderModel.js .......... Sifariş model
│   │   └── userModel.js ........... İstifadəçi model
│   ├── controllers/
│   │   ├── adminController.js ..... Admin kontroller
│   │   ├── storeController.js ..... Mağaza kontroller
│   │   └── courierController.js ... Kuryerin kontroller
│   ├── routes/
│   │   ├── adminRoutes.js ......... Admin routları
│   │   ├── storeRoutes.js ......... Mağaza routları
│   │   └── courierRoutes.js ....... Kuryerin routları
│   └── middlewares/
│       └── authMiddleware.js ...... Autentifikasiya
│
└── frontend/ ...................... REACT FRONTEND
    ├── 📄 package.json ............ Dependencies
    ├── 📄 README.md ............... Frontend docs
    ├── public/
    │   └── index.html ............. HTML shablonu
    └── src/
        ├── index.js ............... React entry point
        ├── App.jsx ................ Ana komponenti
        ├── pages/
        │   ├── AdminPanel.jsx ...... 👨‍⚖️ Admin paneli
        │   ├── StorePanel.jsx ...... 🏪 Mağaza paneli
        │   └── CourierPanel.jsx .... 🚚 Kuryerin paneli
        └── services/
            └── api.js ............. API çağrışları
```

---

## 🔗 API Endpoints

### 🔐 Store APIs
| Method | Endpoint | Məqsəd |
|--------|----------|--------|
| POST | `/api/store/login` | Mağaza girişi |
| POST | `/api/store/orders` | Sifariş yaratma |
| GET | `/api/store/orders` | Sifarişləri görmə |
| GET | `/api/store/balance` | Balans görmə |

### 👨‍⚖️ Admin APIs
| Method | Endpoint | Məqsəd |
|--------|----------|--------|
| GET | `/api/admin/` | Dashboard |
| POST | `/api/admin/stores/create` | Mağaza yaratma |
| GET | `/api/admin/orders/:id` | Sifarişi görmə |
| POST | `/api/admin/orders/:id/approve` | Sifarişi təsdiqləmə |

### 🚚 Courier APIs
| Method | Endpoint | Məqsəd |
|--------|----------|--------|
| GET | `/api/courier/` | Dashboard |
| GET | `/api/courier/orders/available` | Əlçatarlı sifarişlər |
| POST | `/api/courier/orders/:id/take` | Sifarişi qəbul etmə |
| PUT | `/api/courier/orders/:id/status` | Status yeniləmə |
| GET | `/api/courier/orders` | Mənim sifarişlərim |

---

## 📊 Model Sxemləri

### Store Model
```javascript
{
  id: Number,
  name: String,
  code: String,
  phone: String,
  address: String,
  metroPrice: Number,
  outsidePrice: Number,
  balance: Number,
  createdAt: Date
}
```

### Order Model
```javascript
{
  id: Number,
  customerName: String,
  deliveryType: "metro" | "outside",
  metroName: String | null,
  address: String | null,
  price: Number,
  status: "created" | "approved" | "picked" | "onTheWay" | "delivered",
  storeId: Number,
  courierId: Number | null,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Test Qaydası

### 1️⃣ Admin Test
```bash
POST http://localhost:4000/api/admin/stores/create
Body: {
  "name": "Sınaç Mağazası",
  "code": "TEST001",
  "phone": "+994505555555",
  "address": "Bakı",
  "metroPrice": 50,
  "outsidePrice": 100
}
Response: ✅ Mağaza uğurla yaradıldı!
```

### 2️⃣ Store Test
```bash
POST http://localhost:4000/api/store/login
Body: {
  "name": "Bakı Mağazası",
  "code": "BAK001"
}
Response: ✅ Uğurla daxil oldunuz!
```

### 3️⃣ Order Test
```bash
POST http://localhost:4000/api/store/orders
Body: {
  "customerName": "Rəsul",
  "deliveryType": "metro",
  "metroName": "Avtovağzal",
  "storeId": 1
}
Response: ✅ Sifariş uğurla yaradıldı!
```

### 4️⃣ Approve Test
```bash
POST http://localhost:4000/api/admin/orders/{id}/approve
Response: ✅ Sifariş təsdiqləndi!
```

### 5️⃣ Courier Test
```bash
POST http://localhost:4000/api/courier/orders/{id}/take
Body: { "courierId": 1 }
Response: ✅ Sifariş qəbul edildi!
```

---

## ✨ Xüsusiyyətlər

### ✅ Backend
- [x] 3 fərqli panel (Admin, Store, Courier)
- [x] CRUD əməliyyatları
- [x] Sifariş idarəetməsi
- [x] Balans yönetimi
- [x] Status yönetimi
- [x] Validasiya
- [x] Azərbaycan dili

### ✅ Frontend
- [x] React + Material-UI
- [x] 3 Panel komponenti
- [x] Form validasyonu
- [x] API integrasyonu
- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] Azərbaycan dili
- [x] Premium UI

---

## 🚀 Next Steps (İstəkli)

1. **Database Əlavə Et**
   - MongoDB yə keç
   - Məlumatlar persistent ol

2. **JWT Autentifikasiyası**
   - Token-based auth
   - Daha güvənli

3. **Email/SMS**
   - Bildərişlər göndər
   - Üzərində tetikləmə

4. **Admin Dashboard**
   - Raporlar
   - Statistika

5. **Mobile App**
   - React Native
   - iOS/Android

6. **Advanced Features**
   - Real-time updates (Socket.io)
   - Map integration
   - Payment gateway

---

## 📞 Dəstək

**Hər hansı problem?**

1. Logları yoxla
2. Browser console-u açıraq (F12)
3. Network tab'da API çağrışlarına bak
4. Backend loglarını yoxla

**URL-lər:**
- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000`
- API Docs: `http://localhost:4000/api/admin/store/test`

---

## 📝 Məlumat

- **Backend:** Node.js + Express
- **Frontend:** React + Material-UI
- **Database:** In-Memory (Upgrade mümkün)
- **Dil:** Azərbaycan
- **API:** RESTful

---

## 🎉 TAMAMLANDI!

**Kargo Delivery System hazırdır istifadəyə!**

```
Backend:   ✅ http://localhost:4000
Frontend:  ✅ http://localhost:3000
Database:  ✅ In-Memory
UI:        ✅ Material Design
Language:  ✅ Azərbaycan
```

**Xoş istifadələr! 🚀**

