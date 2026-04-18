# Admin Paneli - Mağaza və Kuryer Əlavə Etmə

## Nə Yaradıldı?

### Backend Endpoints

✅ **POST /api/admin/store/create**
- Yeni mağaza yaratmaq üçün
- Parametrlər: name, code, phone, address, metroPrice, outsidePrice
- Validasyon: Duplikat ad/kod yoxlayır, fiyatları yoxlayır
- Cavab: "Mağaza uğurla yaradıldı"

✅ **POST /api/admin/courier/create**
- Yeni kuryer yaratmaq üçün
- Parametrlər: name, code, phone
- Validasyon: Duplikat ad/kod yoxlayır
- Cavab: "Kuryer uğurla yaradıldı"

### Frontend Components

✅ **AdminDashboard.js (Yeniləndi)**
- 3 Tab: Əsas, Mağaza Əlavə Et, Kuryer Əlavə Et
- Mağaza formu: 6 sahə (ad, kod, telefon, ünvan, metronu, xarici qiymət)
- Kuryer formu: 3 sahə (ad, kod, telefon)
- Uğun mesajı: "Mağaza uğurla əlavə edildi" / "Kuryer uğurla əlavə edildi"
- Xəta göstərişi
- Loading state

✅ **AdminPanel.css (Yeni)**
- Tab dizaynı
- Form stilləri
- Success/Error mesaj stilləri
- Responsive dizayn

## Sistem Möhüm Xüsusiyyətləri

### 1. Mağaza Yaratma
```
POST /api/admin/store/create

Parametrlər:
{
  "name": "Gəncə Mağazası",
  "code": "GEN001",
  "phone": "+994505555551",
  "address": "Atatürk Prospekti, 10",
  "metroPrice": 45,
  "outsidePrice": 95
}

Cavab (Uğun):
{
  "message": "Mağaza uğurla yaradıldı",
  "store": {
    "id": 1712282400000,
    "name": "Gəncə Mağazası",
    "code": "GEN001",
    "phone": "+994505555551",
    "address": "Atatürk Prospekti, 10",
    "metroPrice": 45,
    "outsidePrice": 95,
    "balance": 0,
    "createdAt": "2026-04-05T..."
  }
}

Cavab (Xəta):
{
  "error": "Bu adla mağaza artıq mövcuddur"
}
```

### 2. Kuryer Yaratma
```
POST /api/admin/courier/create

Parametrlər:
{
  "name": "Elman Kuryer",
  "code": "COURIER002",
  "phone": "+994507777778"
}

Cavab (Uğun):
{
  "message": "Kuryer uğurla yaradıldı",
  "courier": {
    "id": 1712282400001,
    "name": "Elman Kuryer",
    "code": "COURIER002",
    "phone": "+994507777778",
    "balance": 0,
    "createdAt": "2026-04-05T..."
  }
}

Cavab (Xəta):
{
  "error": "Bu kodla kuryer artıq mövcuddur"
}
```

## Admin Panelində İstifadə

### Mağaza Əlavə Etmə
1. Admin login-ə gir (admin/1234)
2. "Mağaza Əlavə Et" Tab-ə basın
3. Formu doldurun:
   - Mağaza Adı: "Baki Merkez Mağaza"
   - Kod: "BAK_MERKEZ_01" (Unikal olmalıdır)
   - Telefon: "+994505555501"
   - Ünvan: "28 May küçəsi, 5"
   - Metro Qiyməti: 50
   - Xaric Qiyməti: 100
4. "Mağaza Əlavə Et" düyməsinə basın
5. Mesaj: "Mağaza uğurla əlavə edildi"
6. Artıq bu mağazaya login edə bilərsiniz!

### Kuryer Əlavə Etmə
1. Admin login-ə gir (admin/1234)
2. "Kuryer Əlavə Et" Tab-ə basın
3. Formu doldurun:
   - Kuryer Adı: "Murad Qahraman"
   - Kod: "MURAD_QAH_01" (Unikal olmalıdır)
   - Telefon: "+994517777701"
4. "Kuryer Əlavə Et" düyməsinə basın
5. Mesaj: "Kuryer uğurla əlavə edildi"
6. Artıq bu kuryerə login edə bilərsiniz!

## Validasyon Qaydaları

### Mağaza Yaratma
- ❌ Boş ad → "Bütün sahələr doldurulmalıdır"
- ❌ Duplikat ad → "Bu adla mağaza artıq mövcuddur"
- ❌ Duplikat kod → "Bu kodla mağaza artıq mövcuddur"
- ❌ Mənfi qiymət → "Qiymətlər müsbət rəqəm olmalıdır"
- ✅ Bütün sahələr düzgün → Mağaza yaradılır

### Kuryer Yaratma
- ❌ Boş ad → "Bütün sahələr doldurulmalıdır"
- ❌ Duplikat ad → "Bu adla kuryer artıq mövcuddur"
- ❌ Duplikat kod → "Bu kodla kuryer artıq mövcuddur"
- ✅ Bütün sahələr düzgün → Kuryer yaradılır

## Yaradılan İstifadəçi Login Edə Bilər

Mağaza yaratdıqdan sonra:
```
Ad: "Baki Merkez Mağaza"
Kod: "BAK_MERKEZ_01"
Rol: Mağaza (seçin)
```
→ Mağaza Panelə yönlənir

Kuryer yaratdıqdan sonra:
```
Ad: "Murad Qahraman"  
Kod: "MURAD_QAH_01"
Rol: Kuryer (seçin)
```
→ Kuryer Panelə yönlənir

## Fayllar

| Fayl | Dəyişiklik |
|------|----------|
| `frontend/src/pages/AdminDashboard.js` | ✅ Yeniləndi - Formlar əlavə edildi |
| `frontend/src/pages/AdminPanel.css` | ✅ Yaradıldı - Tab və form stilləri |
| `src/controllers/adminController.js` | ✅ Mövcud - createStore və createCourier |
| `src/routes/adminRoutes.js` | ✅ Mövcud - Endpointlər artıq var |
| `src/models/storeModel.js` | ✅ Mövcud - createStore funksiyası var |
| `src/models/courierModel.js` | ✅ Mövcud - createCourier funksiyası var |

## Testləmə Addımları

### 1. Frontend-i başlayın
```bash
cd frontend
npm start
```

### 2. Mağaza Əlavə Edin
- Admin login: admin / 1234
- "Mağaza Əlavə Et" basın
- Form doldurun
- "Mağaza Əlavə Et" basın
- ✅ Mesaj görünəcək

### 3. Kuryer Əlavə Edin
- "Kuryer Əlavə Et" basın
- Form doldurun
- "Kuryer Əlavə Et" basın
- ✅ Mesaj görünəcək

### 4. Yeni İstifadəçiyə Login Edin
- Logout edin
- Yeni mağaza/kuryer səlahiyyətləri ilə login edin
- ✅ Panellərə yönlənməlidir

## Möhüm Qeydlər

1. **Kod Unikal Olmalıdır** - Hər mağaza/kuryer üçün fərqli kod lazımdır
2. **Success Mesajı 3 Saniyə Göstərılir** - Sonra avtomatik yox olur
3. **Loading State** - Düymə deaktiv olur, "Yüklənir..." yazılır
4. **Responsive** - Mobil cihazlarda da işləyir
5. **LocalStorage Token** - Backend request-də token lazımdır

---

**Admin Paneli tam hazırdır! Mağaza və kuryerlər əlavə edə bilərsiniz!** 🎯
