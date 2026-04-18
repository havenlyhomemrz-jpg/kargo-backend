# REFERENCE CARD - Admin Panel Quick Guide

## 🚀 BAŞLAMA (2 Terminal)

### Terminal 1
```bash
cd "c:\Users\serxa\Downloads\Kargo system"
npm install
npm run dev
```
✅ Backend: http://localhost:4000

### Terminal 2
```bash
cd frontend
npm install
npm start
```
✅ Frontend: http://localhost:3000

## 🔐 ADMIN LOGIN

```
Ad: admin
Kod: 1234
Rol: Admin
→ Giriş
```

## ➕ MAĞAZA ƏLAVƏ ET

Tab: **"Mağaza Əlavə Et"**

```
Mağaza Adı: [text]
Kod: [unique text]
Telefon: [+994...]
Ünvan: [text]
Metro Qiyməti: [number]
Xaric Qiyməti: [number]

→ Mağaza Əlavə Et
```

**Result:** ✅ "Mağaza uğurla əlavə edildi"

## ➕ KURYER ƏLAVƏ ET

Tab: **"Kuryer Əlavə Et"**

```
Kuryer Adı: [text]
Kod: [unique text]
Telefon: [+994...]

→ Kuryer Əlavə Et
```

**Result:** ✅ "Kuryer uğurla əlavə edildi"

## 🔓 YARADILAN İSTİFADƏÇİ LOGIN

### Yeni Mağaza
```
Ad: [created store name]
Kod: [created store code]
Rol: Mağaza
→ StoreDashboard
```

### Yeni Kuryer
```
Ad: [created courier name]
Kod: [created courier code]
Rol: Kuryer
→ CourierDashboard
```

## 📝 ERROR MESAJLARI

```
❌ "Bütün sahələr doldurulmalıdır"
   → Boş sahə var, hamısını doldur

❌ "Bu adla mağaza artıq mövcuddur"
   → Başqa ad aç + cəhd et

❌ "Bu kodla mağaza artıq mövcuddur"
   → Başqa kod aç + cəhd et

❌ "Qiymətlər müsbət rəqəm olmalıdır"
   → Mənfi rəqəm girdim, müsbət yaz
```

## ✅ SUCCESS MESAJLARI

```
✅ "Mağaza uğurla əlavə edildi"
   → Form sıfırlanır, 3 sec sonra yox olur

✅ "Kuryer uğurla əlavə edildi"
   → Form sıfırlanır, 3 sec sonra yox olur
```

## 🎯 TESTLƏMƏ ADIMLAR

- [ ] Backend çalışır
- [ ] Frontend çalışır
- [ ] Admin login oldu
- [ ] Mağaza formunu gördüm
- [ ] Mağaza əlavə etdim
- [ ] Success mesajı göründü
- [ ] Kuryer formunu gördüm
- [ ] Kuryer əlavə etdim
- [ ] Success mesajı göründü
- [ ] Yeni mağaza login etdim
- [ ] Yeni kuryer login etdim

## 📞 SUALLAR?

| Fayl | Məqsəd |
|------|--------|
| QUICK_START.md | 5 dəqiqəlik intro |
| ADMIN_COMPLETE_GUIDE.md | Tam tətbiq |
| API_TESTING.md | cURL test |
| SYSTEM_ARCHITECTURE.md | Sistem |
| FINAL_COMPLETION.md | Tamamlama |

## 📊 TEST USERS

| Role | Ad | Kod |
|------|----|----|
| Admin | admin | 1234 |
| Store | Store1 | STORE001 |
| Courier | Courier1 | COURIER001 |

## 🛠️ FIX PROBLEMS

| Problem | Solve |
|---------|-------|
| Port istifadə | PORT=5000 npm run dev |
| Module yoxdur | npm install |
| CORS xətası | Backend restart |
| Token yoxdur | Login yenidin et |

## 🎨 UI TABS

```
┌─────────────────────────────────┐
│ Əsas │ Mağaza Əlavə Et │ Kuryer Əlavə Et │
└─────────────────────────────────┘
```

## 🔗 BACKEND ENDPOINTS

```
POST /api/auth/login
POST /api/admin/store/create
POST /api/admin/courier/create
```

## 💾 STORAGE

- **Frontend:** localStorage (token, user)
- **Backend:** In-Memory Arrays (stores, couriers)

## 🎯 HATIRLA

1. **2 Terminal lazım** (backend + frontend)
2. **Admin login lazım** (admin/1234)
3. **Kod unikal olmalı** (duplikat olmuş)
4. **Success mesajı 3 sec** (sonra yox olur)
5. **Yaradılan user login edə bilər** (artıq)

---

**HAZIR? BAŞLA!** 🚀

```bash
npm run dev          # Terminal 1
cd frontend && npm start  # Terminal 2
```

**localhost:3000** açın!

**Admin Paneli:** HAZIR ✅
