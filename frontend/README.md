# Kargo Sistemi - Frontend

Sadə React frontend ilə tam işləyən login sistemi.

## Quraşdırma

```bash
npm install
```

## Başlama

Frontend-in backend-i (http://localhost:4000) ilə birləşə biləcəyinə əmin olun.

```bash
npm start
```

Brauzer avtomatik olaraq `http://localhost:3000` ünvanına açılacaq.

## Test Kredentiallər

### Admin
- **Ad:** admin
- **Kod:** 1234
- **Rol:** Admin

### Mağaza
- **Ad:** Store1
- **Kod:** STORE001
- **Rol:** Mağaza

### Kuryer
- **Ad:** Courier1
- **Kod:** COURIER001
- **Rol:** Kuryer

## Xüsusiyyətlər

✅ Rol seçimi (Admin, Mağaza, Kuryer)  
✅ Backend ilə API inteqrasiyası  
✅ Rol əsasında yönləndirmə  
✅ Azərbaycanca UI  
✅ Sadə və səhvsiz kod  
✅ Session saxlama (localStorage)  

## Struktur

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── LoginPage.css
│   │   ├── AdminDashboard.js
│   │   ├── StoreDashboard.js
│   │   ├── CourierDashboard.js
│   │   └── Dashboard.css
│   ├── App.js
│   ├── App.css
│   └── index.js
└── package.json
```
