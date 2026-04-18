# Kargo Sistemi - Login Sisteminin Tətbiq Edilməsi

## Nə Yaradıldı?

### Backend (Node.js + Express)
1. ✅ **POST /api/auth/login** endpoint
   - name, code, role qəbul edir
   - JWT token qaytarır
   - Azərbaycanca səhv mesajı: "İstifadəçi adı və ya kod yanlışdır"

2. ✅ Default Admin User
   - **Ad:** admin
   - **Kod:** 1234
   - **Rol:** admin

3. ✅ CORS Dəstəyi
   - Frontend-backend inteqrasiyası

### Frontend (React)
1. ✅ **Login Səhifəsi** (LoginPage.js)
   - Rol seçimi (Admin, Mağaza, Kuryer)
   - Ad girişi
   - Kod girişi
   - Backend ilə API inteqrasiyası
   - Error mesajı göstərişi

2. ✅ **Dashboard Səhifələri**
   - AdminDashboard.js - Admin paneli
   - StoreDashboard.js - Mağaza paneli
   - CourierDashboard.js - Kuryer paneli
   - Hər birinə Çıxış düyməsi

3. ✅ **Routing** (React Router)
   - /login → Login səhifəsi
   - /admin → Admin paneli (Auth lazım)
   - /store → Mağaza paneli (Auth lazım)
   - /courier → Kuryer paneli (Auth lazım)

4. ✅ **Session Saxlama**
   - localStorage ilə user məlumatı
   - localStorage ilə token

## Quraşdırma və Başlama

### 1. Backend Quraşdırması ve Başlaması

```bash
# Layihə kökünə keçin
cd "c:\Users\serxa\Downloads\Kargo system"

# Backend asılılıklarını quraşdırın
npm install

# Backend serveri başladın (Terminal 1)
npm run dev
```

Backend `http://localhost:4000` ünvanında çalışacaq.

### 2. Frontend Quraşdırması və Başlaması

```bash
# Frontend dizininə keçin (Terminal 2)
cd frontend

# Frontend asılılıklarını quraşdırın
npm install

# Frontend təmənnasını başladın
npm start
```

Frontend `http://localhost:3000` ünvanında açılacaq.

## Test Edilən Kredentiallər

### 1. Admin (əsas)
```
Ad: admin
Kod: 1234
Rol: Admin (seçin)
```
→ Admin Panelə yönlənir

### 2. Mağaza
```
Ad: Store1
Kod: STORE001
Rol: Mağaza (seçin)
```
→ Mağaza Panelə yönlənir

### 3. Kuryer
```
Ad: Courier1
Kod: COURIER001
Rol: Kuryer (seçin)
```
→ Kuryer Panelə yönlənir

### 4. Səhv Kredential
```
Ad: anyadı
Kod: 9999
```
→ Mesaj: "İstifadəçi adı və ya kod yanlışdır"

## Fayllar Nə Üçün Əlavə Edildi?

### Backend Dəyişiklikləri
- ✅ **src/models/userModel.js** - admin/1234 yaradıldı
- ✅ **src/controllers/authController.js** - Azərbaycanca error mesajı
- ✅ **src/app.js** - CORS middleware əlavə edildi
- ✅ **package.json** - cors asılılığı əlavə edildi

### Frontend Yaradılanlar
- ✅ **frontend/package.json** - axios, react-router-dom əlavə edildi
- ✅ **frontend/src/App.js** - React Router ilə routing
- ✅ **frontend/src/pages/LoginPage.js** - Login formu + API call
- ✅ **frontend/src/pages/AdminDashboard.js** - Admin paneli
- ✅ **frontend/src/pages/StoreDashboard.js** - Mağaza paneli
- ✅ **frontend/src/pages/CourierDashboard.js** - Kuryer paneli
- ✅ **frontend/src/pages/Dashboard.css** - Dashboard stilləri
- ✅ **frontend/src/pages/LoginPage.css** - Login stilləri (error mesajı, loading)

## Sistemin İş Axını

1. İstifadəçi `/login` səhifəsinə açılır
2. Rol seçir, ad yazır, kod yazır
3. "Giriş" düyməsinə basır
4. Frontend `/api/auth/login`-ə POST request göndərir
5. Backend məlumatları yoxlayır:
   - ✅ Düzgün → JWT token + user məlumatı qaytarır
   - ❌ Yanlış → "İstifadəçi adı və ya kod yanlışdır" qaytarır
6. Frontend token və user məlumatını localStorage-ə saxlayır
7. Roleya əsasən yönləndir:
   - admin → `/admin` (Admin Paneli)
   - store → `/store` (Mağaza Paneli)
   - courier → `/courier` (Kuryer Paneli)

## Vacib Xülasə

| Komponent | Файл | Məqsəd |
|-----------|------|--------|
| Login | `/frontend/src/pages/LoginPage.js` | Giriş formu + API call |
| Router | `/frontend/src/App.js` | Səhifə yönləndirmə |
| Dashboards | `/frontend/src/pages/*Dashboard.js` | Rol panelləri |
| Backend | `/src/controllers/authController.js` | Login logic |
| Models | `/src/models/userModel.js` | Admin user (admin/1234) |

## Xətas Durumunda

Əgər error baş verərsə:
- Backend serveri işləyiries? (npm run dev)
- Frontend serveri işləyiries? (npm start)
- Porta istifadəçilər port 4000 və 3000 erişə bilir?
- Tarayıcının cache-i sildin?

---

**Sistem tam hazırdır və istifadəyə hazırdır!** 🚀

Hər bir səhifə Azərbaycanca, sadə kod, səhvsiz!
