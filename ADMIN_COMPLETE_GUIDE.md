# Admin Paneli - Tam İcra Qılavuzu

## ✅ Nə Hazırlanıb

### 1. Backend Endpoints (Node.js)

#### ✅ POST /api/admin/store/create
```javascript
Parametrlər: {
  "name": string,        // Mağaza adı (Unikal)
  "code": string,        // Kod (Unikal)
  "phone": string,       // Telefon nömrəsi
  "address": string,     // Ünvan
  "metroPrice": number,  // Metro çatdırılma qiyməti
  "outsidePrice": number // Xaric çatdırılma qiyməti
}

Cavab (201):
{
  "message": "Mağaza uğurla yaradıldı",
  "store": { id, name, code, phone, address, metroPrice, outsidePrice, balance, createdAt }
}

Xəta Cavabları:
- 400: "Bütün sahələr doldurulmalıdır"
- 400: "Qiymətlər müsbət rəqəm olmalıdır"
- 409: "Bu adla mağaza artıq mövcuddur"
- 409: "Bu kodla mağaza artıq mövcuddur"
```

#### ✅ POST /api/admin/courier/create
```javascript
Parametrlər: {
  "name": string,  // Kuryer adı (Unikal)
  "code": string,  // Kod (Unikal)
  "phone": string  // Telefon nömrəsi
}

Cavab (201):
{
  "message": "Kuryer uğurla yaradıldı",
  "courier": { id, name, code, phone, balance, createdAt }
}

Xəta Cavabları:
- 400: "Bütün sahələr doldurulmalıdır"
- 409: "Bu adla kuryer artıq mövcuddur"
- 409: "Bu kodla kuryer artıq mövcuddur"
```

### 2. Frontend Components (React)

#### ✅ AdminDashboard.js (Yeniləndi)
**3 Main Features:**

1. **Home Tab** (Əsas)
   - Welcome card ilə user info
   - Feature cards ilə icmaller
   
2. **Store Tab** (Mağaza Əlavə Et)
   - 6 input field
   - Metro və Xaric qiymətləri
   - Form validation
   - Success/Error messages
   - Loading state
   
3. **Courier Tab** (Kuryer Əlavə Et)
   - 3 input field
   - Form validation
   - Success/Error messages
   - Loading state

#### ✅ AdminPanel.css (Yeni)
- Tab styling (active/inactive states)
- Form grid layout (responsive)
- Input focus states
- Success/Error message animation
- Submit button hover effects
- Mobile responsive (@media queries)

### 3. Stylelri

- ✅ Dynamic tab styling (active highlight)
- ✅ Form grid (2 columns, responsive)
- ✅ Success message animation (slideIn)
- ✅ Error message styling
- ✅ Loading button state
- ✅ Mobile friendly (1 column on mobile)

## 🚀 Başlama Prosesi

### Step 1: Terminal 1 - Backend

```bash
cd "c:\Users\serxa\Downloads\Kargo system"
npm install
npm run dev
```

Backend açılacaq: http://localhost:4000

### Step 2: Terminal 2 - Frontend

```bash
cd frontend
npm install
npm start
```

Frontend açılacaq: http://localhost:3000

### Step 3: Admin Login

Frontend açılanda:
1. Default login-ə girin:
   - Ad: `admin`
   - Kod: `1234`
   - Rol: `Admin` seçin
2. "Giriş" basın
3. Admin Panelə yönləndir

## 📝 Admin Panelində İstifadə

### Mağaza Əlavə Etmə

1. "Mağaza Əlavə Et" tab-ə basın
2. Form doldurun:
   ```
   Mağaza Adı: Bakı Merkez
   Kod: BAK_MERKEZ_001
   Telefon: +994505555501
   Ünvan: 28 May kuçəsi 5
   Metro Qiyməti: 50
   Xaric Qiyməti: 100
   ```
3. "Mağaza Əlavə Et" düyməsinə basın
4. **✅ Mesaj:** "Mağaza uğurla əlavə edildi"
5. Form avtomatik sıfırlanır

### Kuryer Əlavə Etmə

1. "Kuryer Əlavə Et" tab-ə basın
2. Form doldurun:
   ```
   Kuryer Adı: Murad Qahraman
   Kod: MURAD_QAH_001
   Telefon: +994517777701
   ```
3. "Kuryer Əlavə Et" düyməsinə basın
4. **✅ Mesaj:** "Kuryer uğurla əlavə edildi"
5. Form avtomatik sıfırlanır

## 🔐 Yaradılan İstifadəçilərə Login

### Yeni Mağaza ilə Login

1. Logout edin (Admin panelində "Çıxış")
2. Login səhifəsinə qayıdın
3. Doldur:
   ```
   Ad: Bakı Merkez
   Kod: BAK_MERKEZ_001
   Rol: Mağaza seçin
   ```
4. "Giriş" basın
5. ✅ Mağaza Panelə yönləndir!

### Yeni Kuryer ilə Login

1. Logout edin
2. Login səhifəsinə qayıdın
3. Doldur:
   ```
   Ad: Murad Qahraman
   Kod: MURAD_QAH_001
   Rol: Kuryer seçin
   ```
4. "Giriş" basın
5. ✅ Kuryer Panelə yönləndir!

## 📊 Frontend Form Details

### Store Form Fields

| Field | Type | Required | Example |
|-------|------|----------|---------|
| Mağaza Adı | text | ✅ | "Bakı Merkez" |
| Kod | text | ✅ | "BAK_001" |
| Telefon | tel | ✅ | "+994505555501" |
| Ünvan | text | ✅ | "28 May k., 5" |
| Metro Qiyməti | number | ✅ | "50" |
| Xaric Qiyməti | number | ✅ | "100" |

### Courier Form Fields

| Field | Type | Required | Example |
|-------|------|----------|---------|
| Kuryer Adı | text | ✅ | "Murad Qahraman" |
| Kod | text | ✅ | "MURAD_001" |
| Telefon | tel | ✅ | "+994517777701" |

## ⚠️ Validasyon Qaydaları

### Mağaza Yaratma Validasiyas

```
Input: Boş sahələr var?
→ ERROR: "Bütün sahələr doldurulmalıdır"

Input: Mağaza adı artıq mövcud?
→ ERROR: "Bu adla mağaza artıq mövcuddur"

Input: Kod artıq mövcud?
→ ERROR: "Bu kodla mağaza artıq mövcuddur"

Input: Mənfi qiymət?
→ ERROR: "Qiymətlər müsbət rəqəm olmalıdır"

Input: Hamısı düzgün?
→ SUCCESS: Mağaza yaradılır, mesaj göstərilir
```

### Kuryer Yaratma Validasiyas

```
Input: Boş sahələr var?
→ ERROR: "Bütün sahələr doldurulmalıdır"

Input: Kuryer adı artıq mövcud?
→ ERROR: "Bu adla kuryer artıq mövcuddur"

Input: Kod artıq mövcud?
→ ERROR: "Bu kodla kuryer artıq mövcuddur"

Input: Hamısı düzgün?
→ SUCCESS: Kuryer yaradılır, mesaj göstərilir
```

## 📁 Yenilənən Fayllar

| Fayl | Tipi | Dəyişiklik |
|------|------|-----------|
| `frontend/src/pages/AdminDashboard.js` | Update | ✅ Tabs, formlar, API calls əlavə edildi |
| `frontend/src/pages/AdminPanel.css` | Create | ✅ Yeni fayl yaradıldı |
| `frontend/package.json` | Check | ✅ axios, react-router-dom mövcud |

## 🔧 Backend Faylları (Mövcud, Dəyişmə Yoxdur)

| Fayl | Status | Məqsəd |
|------|--------|--------|
| `src/controllers/adminController.js` | ✅ | createStore, createCourier logikası |
| `src/routes/adminRoutes.js` | ✅ | POST endpoints istiqamətləndirmə |
| `src/models/storeModel.js` | ✅ | createStore modeli, mağaza array-ı |
| `src/models/courierModel.js` | ✅ | createCourier modeli, kuryer array-ı |
| `src/app.js` | ✅ | CORS, routing konfigürasyonu |

## 🎨 UI Xüsusiyyətləri

1. **Tab Navigation** - 3 tab, active state highlight
2. **Form Layout** - Responsive grid (2 col → 1 col mobile)
3. **Success Message** - Green background, 3 saniyə göstərilir
4. **Error Message** - Red background, form üstündə göstərilir
5. **Loading State** - Düymə deaktiv, "Yüklənir..." yazılır
6. **Form Reset** - Uğurlu submit-də form sıfırlanır

## 🧪 Test Senarileri

### Test 1: Mağaza Yaratmaq
```
1. Admin login-ə girin
2. "Mağaza Əlavə Et" tab-ə basın
3. Formu doldurun
4. ✅ Mesaj: "Mağaza uğurla əlavə edildi"
5. Form sıfırlandı
```

### Test 2: Duplikat Mağaza Adı
```
1. Eyni adla mağaza əlavə etmək cəhdi
2. ❌ Mesaj: "Bu adla mağaza artıq mövcuddur"
```

### Test 3: Kuryer Yaratmak
```
1. "Kuryer Əlavə Et" tab-ə basın
2. Formu doldurun
3. ✅ Mesaj: "Kuryer uğurla əlavə edildi"
4. Form sıfırlandı
```

### Test 4: Yeni Mağaza ilə Login
```
1. Logout edin
2. Yeni mağaza məlumatları ilə login edin
3. ✅ Mağaza Panelə yönləndir
```

### Test 5: Yeni Kuryer ilə Login
```
1. Logout edin
2. Yeni kuryer məlumatları ilə login edin
3. ✅ Kuryer Panelə yönləndir
```

## 📱 Responsive Dizayn

- ✅ Desktop: 2 columns form
- ✅ Tablet: 2 columns form (daha kiçik gap)
- ✅ Mobile: 1 column form
- ✅ Tab buttons: Row desktop, responsive mobile
- ✅ Form container: max-width 800px

## 🎯 Xülasə

✅ Backend endpoints mövcud və işləyir  
✅ Frontend formlar əlavə edildi  
✅ API inteqrasiyası tamamlanmış  
✅ Validasyon quraşdırılmış  
✅ Success/Error mesajları göstərilir  
✅ Yaradılan istifadəçilər login edə bilərlər  
✅ Responsive dizayn  
✅ Azərbaycanca UI  

**Panel tam hazırdır! 🚀**
