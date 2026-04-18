# 🏗️ Sistem Arxitekturası

## Sistem Diaqramı

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE (Browser)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │   Admin UI     │  │   Store UI     │  │   Courier UI   │        │
│  │   (React)      │  │   (React)      │  │   (React)      │        │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘        │
│           │                   │                    │                 │
│           └───────────────────┼────────────────────┘                 │
│                               │                                      │
│                      ┌────────▼────────┐                             │
│                      │   API Service   │                             │
│                      │   (axios.js)    │                             │
│                      └────────┬────────┘                             │
│                               │                                      │
│                      ┌────────▼────────┐                             │
│                      │   HTTP Requests │                             │
│                      │  PORT 3000 ◄──► │                             │
│                      │ localhost:3000  │                             │
│                      └────────┬────────┘                             │
│                               │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │ HTTP
                    ┌───────────▼──────────┐
                    │   Backend (Node.js)  │
                    │   PORT 4000          │
                    │ localhost:4000       │
                    └───────────┬──────────┘
                                │
        ┌───────────────────────┼──────────────────────┐
        │                       │                      │
    ┌───▼─────┐          ┌──────▼──────┐          ┌───▼──────┐
    │  Routes │          │ Controllers │          │  Models  │
    │         │          │             │          │          │
    │ ├─admin │─────────►├─adminCtrl   │◄────────┤├─store   │
    │ ├─store │          ├─storeCtrl   │         │├─order    │
    │ └─courier         └─courierCtrl  │         │└─user     │
    └─────────┘          └──────▲──────┘         └───┬──────┘
                                │                    │
                                │                    │
                        ┌───────▴─────────┐          │
                        │  In-Memory DB   │◄─────────┘
                        │  (JavaScript)   │
                        │                 │
                        │ ├─ stores[]     │
                        │ ├─ orders[]     │
                        │ └─ users[]      │
                        └─────────────────┘
```

---

## 📡 Request-Response Axını

### Sifariş Yaratma Axını (1-3. addım)

```
┌─────────────────────┐
│  STORE PANEL        │
│  "Sifariş Yarat"    │
│  Düyməsinə Basma    │
└────────────┬────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│  Frontend (React)                               │
│  - Form məlumatları yəmləməsi                  │
│  - Validation                                   │
│  - Loading state göstərişi                      │
└────────────┬────────────────────────────────────┘
             │
             │ HTTP POST
             │ /api/store/orders
             │ {customerName, type, metroName/address}
             │
             ▼
┌─────────────────────────────────────────────────┐
│  Backend (Express)                              │
│  Route: POST /api/store/orders                  │
│  Controller: storeController.createOrder()      │
│  - Validasiya                                   │
│  - Fiyat hesablaması                           │
│  - Order Model-ə əlavə etmə                     │
└────────────┬────────────────────────────────────┘
             │
             │ JavaScript Object yaradılması
             │ orders[] qrupuna əlavə
             │
             ▼
┌─────────────────────┐
│  In-Memory DB       │
│  orders.push({      │
│    id: 1234567890,  │
│    status: 'created'│
│    ...              │
│  })                 │
└────────────┬────────┘
             │
             │ Cavab dönüşü
             │ {201, order: {...}}
             │
             ▼
┌──────────────────────────────────┐
│  Frontend (React)                │
│  - Success mesajı                │
│  - Table-ə sifariş əlavə         │
│  - loading state reset           │
└──────────────────────────────────┘
```

---

## 🔄 Sifariş Lifecycle

```
┌────────────┐
│  YARADILDI │  Store panel-dən sifariş yaradılır
└─────┬──────┘
      │
      │ Admin təsdiq edir
      ▼
┌────────────┐
│  TƏSDİQLƏN │  Admin panel-dən təsdiq edilir
└─────┬──────┘
      │
      │ Kuryerin qəbul edir
      ▼
┌────────────┐
│   ALINDI   │  Courier panel-dən picked seçilir
└─────┬──────┘
      │
      │ Kuryerin yoldadır dəyişdirir
      ▼
┌────────────┐
│  YOLDADIR  │  Courier panel-dən onTheWay seçilir
└─────┬──────┘
      │
      │ Kuryerin təhvil verir
      ▼
┌────────────┐
│ TƏHVİL V.  │  Courier panel-dən delivered seçilir
└────────────┘
  ✅ Tamamlandı!
```

---

## 🎭 Rollar və İcazələr

```
┌─────────────────────────────────────────────────┐
│              ADMIN (👨‍⚖️)                         │
├─────────────────────────────────────────────────┤
│ ✅ Mağaza yaratma                               │
│ ✅ Bütün sifarişləri görünə                     │
│ ✅ Sifarişləri təsdiqləmə                       │
│ ✅ Admin paneline giriş                         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              STORE (🏪)                         │
├─────────────────────────────────────────────────┤
│ ✅ Mağaza girişi (ad+kod)                       │
│ ✅ Sifariş yaratma                              │
│ ✅ Öz sifarişləri görünə                        │
│ ✅ Balans kontrol                               │
│ ❌ Başqa mağaza sifarişlərini görmə             │
│ ❌ Admin əməliyyatları                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              COURIER (🚚)                       │
├─────────────────────────────────────────────────┤
│ ✅ Kuryerin girişi                              │
│ ✅ Təsdiqlənmiş sifarişləri görünə              │
│ ✅ Sifarişi qəbul etmə                          │
│ ✅ Status dəyişdirmə                            │
│ ✅ Mənim sifarişləri görünə                     │
│ ❌ Sifariş yaratma                              │
│ ❌ Balans kontrol                               │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Məlumat Axını

### Store Login Məlumatları
```
Frontend Form → React State → API Payload
                               ↓
                        SERVER Side
                            ↓
                     Validation
                            ↓
                     Model'dən axtarış
                            ↓
                     Cavab dönüşü (success/error)
                            ↓
                        Response → Frontend
                                     ↓
                        UI Update → Display Store Info
```

### Order Creation Məlumatları
```
Frontend Form 
  ├─ customerName
  ├─ deliveryType (metro/outside)
  ├─ metroName (if metro)
  ├─ address (if outside)
  └─ storeId
       ↓
    Validation
       ├─ Bütün field-lər dolularaq?
       ├─ Qiymətlər rəqəm?
       └─ StoreId mövcud?
       ↓
    Price Calculation
       ├─ if metro → metroPrice
       ├─ if outside → outsidePrice
       ↓
    Order Object Yaradılması
       {
         id: Date.now(),
         customerName,
         deliveryType,
         price,
         status: 'created',
         storeId,
         courierId: null
       }
       ↓
    orders[] qrupuna əlavə
       ↓
    Cavab: 201 Created + Order Info
```

---

## 💾 Məlumat Modeli

### In-Memory Storage Struktur

```
┌───────────────────────────────────────────────────┐
│  STORES verilənlər bazası                         │
├───────────────────────────────────────────────────┤
│ [{                                                 │
│   id: 1,                                           │
│   name: "Bakı Mağazası",                          │
│   code: "BAK001",                                 │
│   phone: "+994505555555",                         │
│   address: "Nizami küçəsi, 1A",                   │
│   metroPrice: 50,                                 │
│   outsidePrice: 100,                              │
│   balance: 0,                                     │
│   createdAt: Date                                 │
│ }]                                                │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  ORDERS verilənlər bazası                        │
├───────────────────────────────────────────────────┤
│ [{                                                 │
│   id: 1234567890,                                 │
│   customerName: "Rəsul",                          │
│   deliveryType: "metro",                          │
│   metroName: "Avtovağzal",                        │
│   address: null,                                  │
│   price: 50,                                      │
│   status: "created",                              │
│   storeId: 1,                                     │
│   courierId: null,                                │
│   createdAt: Date,                                │
│   updatedAt: Date                                 │
│ }]                                                │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  USERS verilənlər bazası                         │
├───────────────────────────────────────────────────┤
│ [{                                                 │
│   id: 1,                                          │
│   username: "admin",                              │
│   password: "admin123",                           │
│   role: "admin"                                   │
│ }]                                                │
└───────────────────────────────────────────────────┘
```

---

## 🔄 Komponentlər Arası Əlaqə

```
┌─────────────────┐
│   App.jsx       │ (Main Router + Layout)
│  - State        │
│  - Navigation   │
└────────┬────────┘
         │
    ┌────┴──────────────────────────┐
    │                               │
┌───▼────────────┐      ┌──────────▼──┐      ┌──────────────┐
│  AdminPanel    │      │ StorePanel  │      │CourierPanel  │
│                │      │             │      │              │
│ - Event        │      │ - State     │      │ - State      │
│ - Api calls    │      │ - API calls │      │ - API calls  │
│ - Render       │      │ - Render    │      │ - Render     │
└────────────────┘      └─────────────┘      └──────────────┘
         │                    │                      │
         │                    │                      │
         └────────┬───────────┴──────────────────────┘
                  │
            ┌─────▼──────┐
            │  api.js    │
            │            │
            │ - storeAPI │
            │ - adminAPI │
            │ - courierAPI
            └─────┬──────┘
                  │
                  │ (axios)
                  │ HTTP Requests
                  │
            ┌─────▼──────┐
            │ Backend    │
            │ localhost  │
            │ :4000      │
            └────────────┘
```

---

## 📊 Performance Yaw

```
Frontend Load Flow:
1. App.jsx yükünsüz (100ms)
2. Material-UI tematı yüklənir (50ms)
3. Components mount olur (80ms)
4. API calls (depends on backend)

Backend Response Flow:
1. Request qəbulu (5ms)
2. Routing (2ms)
3. Validation (10ms)
4. Model operasiyası (5ms)
5. Response göndərişi (5ms)
Total: ~27ms ortalama
```

---

**Arxitektura tamamlanıb! 🏗️**

