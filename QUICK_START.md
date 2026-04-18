# 🚀 ÇABUK BAŞLAMA QÖLÜMLÜYÜMÜNDƏ

Mağaza və Kuryer əlavə etməyi tez başlamağa hazırla!

## ⚡ 5 Dəqiqəlik Setup

### Addım 1: Backend Başlat (Terminal 1)

```bash
cd "c:\Users\serxa\Downloads\Kargo system"
npm install
npm run dev
```

✅ Backend http://localhost:4000 ünvanında çalışıyor

### Addım 2: Frontend Başlat (Terminal 2)

```bash
cd frontend
npm install
npm start
```

✅ Frontend http://localhost:3000 ünvanında açılıyor

## 🔐 Admin Login

Brauzer avtomatik olaraq localhost:3000 açılır:

```
Ad: admin
Kod: 1234
Rol: Admin seçin
```

👉 **Login** düyməsinə basın

## ➕ Mağaza Əlavə Etmə

1. **"Mağaza Əlavə Et"** tab-ə basın
2. **Formu doldurun:**
   ```
   Mağaza Adı: Bakı Merkez
   Kod: BAK_MERKEZ_001
   Telefon: +994505555501
   Ünvan: 28 May kuçəsi 5
   Metro Qiyməti: 50
   Xaric Qiyməti: 100
   ```
3. **"Mağaza Əlavə Et"** düyməsinə basın
4. ✅ **Zəlf mesaj:** "Mağaza uğurla əlavə edildi"

## ➕ Kuryer Əlavə Etmə

1. **"Kuryer Əlavə Et"** tab-ə basın
2. **Formu doldurun:**
   ```
   Kuryer Adı: Murad Qahraman
   Kod: MURAD_QAH_001
   Telefon: +994517777701
   ```
3. **"Kuryer Əlavə Et"** düyməsinə basın
4. ✅ **Zəlf mesaj:** "Kuryer uğurla əlavə edildi"

## 🔓 Yeni İstifadəçi Login

### Yeni Mağaza ilə Login

1. Logout edin (Admin panelində "Çıxış")
2. Doldur:
   ```
   Ad: Bakı Merkez
   Kod: BAK_MERKEZ_001
   Rol: Mağaza seçin
   ```
3. **Login** basın → ✅ Mağaza Paneli açılır

### Yeni Kuryer ilə Login

1. Logout edin
2. Doldur:
   ```
   Ad: Murad Qahraman
   Kod: MURAD_QAH_001
   Rol: Kuryer seçin
   ```
3. **Login** basın → ✅ Kuryer Paneli açılır

## 📊 Hazır Test Kredentialləri

| Role | Ad | Kod |
|------|----|----|
| Admin | admin | 1234 |
| Store | Store1 | STORE001 |
| Store | Bakı Merkez | BAK_MERKEZ_001 |
| Courier | Courier1 | COURIER001 |
| Courier | Murad Qahraman | MURAD_QAH_001 |

## ✅ Checklist

- [ ] Backend çalışır (Terminal 1)
- [ ] Frontend çalışır (Terminal 2, localhost:3000)
- [ ] Admin login edə bildim
- [ ] Mağaza əlavə edə bildim
- [ ] Kuryer əlavə edə bildim
- [ ] Yeni mağazaya login edə bildim
- [ ] Yeni kuryerə login edə bildim

## 🆘 Problemləri Fix Etmə

### Terminal 1 xətası: "Port 4000 istifadə olunur"

```bash
# Başqa port-a dəyişdir
PORT=5000 npm run dev
```

### Terminal 2 xətası: "Port 3000 istifadə olunur"

```bash
# Başqa portda başlat
PORT=3001 npm start
```

### "Cannot find module 'axios'"

```bash
cd frontend
npm install
npm start
```

### "CORS xətası"

Backend serveri restartla:
```bash
npm run dev
```

### API çağrı "401 Unauthorized"

- Backend və Frontend aynı ünvanda mı? (localhost:4000)
- Token localStorage-də mövcud mu?
- Admin login etdin mi?

## 📝 Fayllar Nə Üçün Dəyişdi?

| Fayl | Dəyişiklik |
|------|-----------|
| `frontend/src/pages/AdminDashboard.js` | ✅ Formlar + API calls əlavə |
| `frontend/src/pages/AdminPanel.css` | ✅ Yeni CSS fayl |
| Digər fayllar | ✅ Dəyişmədi |

## 🔗 Faydalı Linklar

- Admin Guide: [ADMIN_COMPLETE_GUIDE.md](ADMIN_COMPLETE_GUIDE.md)
- API Testing: [API_TESTING.md](API_TESTING.md)
- Full Setup: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## ⚙️ Backend Endpoints

```
POST /api/auth/login
POST /api/admin/store/create
POST /api/admin/courier/create
```

## 🎉 Hazırsan!

Mağaza və kuryer əlavə etməyə başla!

---

**Hər şey tamam! 🚀**
