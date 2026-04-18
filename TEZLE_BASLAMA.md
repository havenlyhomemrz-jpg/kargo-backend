# ⚡ TEZLƏ BAŞLAMA QAYDASI

Kargo Delivery System-i ⚡ 5 dəqiqəyə başlat!

## 🚀 Addım 1: Backend Başlat (Terminal 1)

```bash
cd "Kargo system\src"
node app.js
```

✅ **Gözləyən, tərəfə daxil ol:** `http://localhost:4000`

Test: `curl http://localhost:4000/`

---

## 🎨 Addım 2: Frontend Başlat (Terminal 2)

```bash
cd "Kargo system\frontend"
npm install
npm start
```

✅ **Frontend açılacaq:** `http://localhost:3000`

---

## 🧪 Addım 3: Sınaq

### Admin Panel
1. Sol menyudan "Admin Panel" seçin
2. Formu doldurun:
   ```
   Mağaza Adı: Test Mağazası
   Kod: TEST001
   Telefon: +994505555555
   Ünvan: Bakı
   Metro Qiyməti: 50
   Xarici Qiyməti: 100
   ```
3. "Mağaza Yarat" düyməsinə basın ✅

### Store Panel  
1. "Mağaza Panel" seçin
2. Giriş:
   ```
   Adı: Bakı Mağazası
   Kod: BAK001
   ```
3. "Daxil Ol" düyməsinə basın
4. Sifariş yaratın ✅

### Courier Panel
1. "Kuryerin Panel" seçin
2. ID: `1` girin
3. "Daxil Ol" düyməsinə basın
4. Sifarişləri qəbul edin ✅
5. Statusu dəyişdirin ✅

---

## 📋 Sınaq Məlumatları

| Panel | Məlumat |
|-------|---------|
| **Store** | Adı: `Bakı Mağazası` |
|  | Kod: `BAK001` |
| **Courier** | ID: `1` |

---

## 🔗 URL-lər

| Servis | URL |
|--------|-----|
| Backend | http://localhost:4000 |
| Frontend | http://localhost:3000 |
| Test API | http://localhost:4000/api/admin/store/test |

---

## ❌ Problem?

### Frontend açılmırsa
```bash
npm install
npm start
```

### Backend xətası
```bash
node app.js
```

### Port dolu
```bash
# Backend: 4000
# Frontend: 3000 (auto-change)
```

---

## ✅ Tamamlandığında

- ✅ Backend işləyir
- ✅ Frontend açılıb
- ✅ 3 panel işləyir
- ✅ CRUD əməliyyatları işləyir

**Xoş oldiniz Kargo Delivery System-ə! 🚀**

