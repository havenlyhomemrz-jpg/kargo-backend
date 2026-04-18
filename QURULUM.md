# 🚀 Kargo Delivery System - Tam Qurulum Qaydası

Bu həvəsilə **Kargo Delivery System**-in həm backend, həm də frontend-i tamamı qurulacaq.

## 📁 Layihə Структурası

```
Kargo system/
├── src/                    # Backend
│   ├── app.js
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   └── ...
├── frontend/               # React Frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
├── package.json            # Backend package.json
└── QURULUM.md             # Bu faylı
```

## ⚙️ Qurulum Addımları

### Addım 1️⃣: Backend Qurulum

#### 1.1. Backend Dependencies Yükləmə

Backend direktoriyasında:

```bash
cd "Kargo system"
npm install
```

**Lazım olan paketlər:**
- express
- dotenv
- (və digərləri)

#### 1.2. Backend Serveri Başlatma

```bash
npm start
# veya
node src/app.js
```

✅ Backend `http://localhost:4000` portunda işləməlidir

**Kontrol:**
```bash
GET http://localhost:4000/ 
# Cavab: { message: 'Kargo system backend is running.' }
```

---

### Addım 2️⃣: Frontend Qurulum

#### 2.1. Frontend Direktoriyasına Geçmə

```bash
cd frontend
```

#### 2.2. Frontend Dependencies Yükləmə

```bash
npm install
```

**Lazım olan paketlər:**
- react
- react-dom
- @mui/material
- @mui/icons-material
- axios

#### 2.3. Frontend Serveri Başlatma

```bash
npm start
```

✅ Frontend `http://localhost:3000` portunda açılacaq

---

## 📝 İstifadə Qaydası

### 1. Admin Panel Sınaqı ✅

1. Frontend açılsa `http://localhost:3000` adresində
2. Sol menyudan **Admin Panel** seçin
3. Yeni mağaza yaratın:
   - **Adı:** Gəncə Mağazası
   - **Kod:** GEN001
   - **Telefon:** +994505555555
   - **Ünvan:** Atatürk prospekti, 5
   - **Metro Qiyməti:** 40 AZN
   - **Xarici Qiyməti:** 80 AZN

4. "Mağaza Yarat" düyməsinə basın
5. Cavab: ✅ "Mağaza uğurla yaradıldı!"

### 2. Store Panel Sınaqı 🏪

1. Sol menyudan **Mağaza Panel** seçin
2. Mağaza girişi:
   - **Adı:** Bakı Mağazası
   - **Kod:** BAK001
3. "Daxil Ol" düyməsinə basın
4. Sifariş yaratın:
   - **Müşteri Adı:** Rəsul Qasımov
   - **Çatdırılma Tipi:** 🚇 Metro Daxilində
   - **Metro Stansiyası:** Avtovağzal
5. "Sifariş Yarat" düyməsinə basın
6. Cavab: ✅ "Sifariş uğurla yaradıldı!"

### 3. Admin Panel - Sifarişi Təsdiqləmə 📋

1. Admin Panel-ə keçin
2. "Sifarişlər" cədvəlində yaradılan sifarişi görün
3. "Təsdiq et" düyməsinə basın
4. Status dəyişər: 🟡 Yaradıldı → ✅ Təsdiqləndi

### 4. Courier Panel Sınaqı 🚚

1. Sol menyudan **Kuryerin Panel** seçin
2. Kuryerin girişi:
   - **ID:** 1
3. "Daxil Ol" düyməsinə basın
4. "Təsdiqlənmiş Sifarişlər" cədvəlində sifarişi görün
5. "Qəbul et" düyməsinə basın
6. Sifariş "Mənim Sifarişlərimə" əlavə olunur (Status: 📦 Alındı)
7. Sifariş satırında "Yenilə" düyməsini basın
8. Status seçin:
   - 📦 Alındı
   - 🚚 Yoldadır
   - ✔️ Təhvil Verildi
9. "Yenilə" düyməsinə basın

---

## 🔍 API Endpoints Sınaqı (cURL/Postman)

### Store Login
```bash
POST http://localhost:4000/api/store/login
Body: {
  "name": "Bakı Mağazası",
  "code": "BAK001"
}
```

### Sifariş Yaratma
```bash
POST http://localhost:4000/api/store/orders
Body: {
  "customerName": "İlham Əliyev",
  "deliveryType": "metro",
  "metroName": "Avtovağzal",
  "storeId": 1
}
```

### Sifarişi Təsdiqləmə (Admin)
```bash
POST http://localhost:4000/api/admin/orders/{id}/approve
```

### Kuryerin Sifarişi Qəbul Etməsi
```bash
POST http://localhost:4000/api/courier/orders/{id}/take
Body: {
  "courierId": 1
}
```

### Statusu Yeniləmə (Courier)
```bash
PUT http://localhost:4000/api/courier/orders/{id}/status
Body: {
  "status": "delivered",
  "courierId": 1
}
```

---

## 🛠️ Problem Həlli

### ❌ "Cannot GET /api/store/login"
- Backend serveri başladılmadı
- **Həll:** `npm start` ilə backend serverini yenidən başladın

### ❌ "localhost:3000 bağlantısı rədd edildi"
- Frontend serveri başladılmadı
- **Həll:** Frontend direktoriyasında `npm start` əmrini çalıştır

### ❌ "Mağaza tapılmadı"
- Mağaza adı və ya kodu səhvdir
- **Həll:** Doğru məlumatları istifadə et:
  - Adı: `Bakı Mağazası`
  - Kod: `BAK001`

### ❌ CORS Xətası
- Backend və frontend fərqli portlarda işləməlidir
- **Həll:** Backend `4000`, frontend `3000` portunda işləməlidir

---

## 📊 Sistem Axını

```
Admin → Mağaza Yaratma
          ↓
Store → Sifariş Yaratma
          ↓
Admin → Sifarişi Təsdiqləmə
          ↓
Courier → Sifarişi Qəbul Etmə
            ↓
Courier → Status Yeniləmə:
            - picked (📦 Alındı)
            - onTheWay (🚚 Yoldadır)
            - delivered (✔️ Təhvil Verildi)
              ↓
          ✅ Tamamlandı!
```

---

## 🎯 Test Ssenariası

1. **Admin** → Mağaza yaratma
2. **Store** → Daxil ol → Sifariş yarat → 3 sifariş yarat
3. **Admin** → Sifarişləri gör → 3 sifarişi təsdiq et
4. **Courier** → Daxil ol → 3 sifarişi qəbul et
5. **Courier** → Hər sifariş üçün status dəyişş:
   - picked
   - onTheWay
   - delivered

---

## 🚀 Next Steps

- [ ] Database (MongoDB/PostgreSQL) əlavə etmə
- [ ] Autentifikasiya (JWT) əlavə etmə
- [ ] Email/SMS bildərişləri
- [ ] Mobile App
- [ ] Advanced Reporting

---

## 📞 Dəstək

Hər hansı problem qarşıla gəlsə:

1. Browser console-nu açın (F12)
2. Network tab-ında API çağrışlarını yoxlayın
3. Backend loglarını yoxlayın

---

**Qurulum Tamamlandı! 🎉**

Backend: http://localhost:4000 ✅
Frontend: http://localhost:3000 ✅

