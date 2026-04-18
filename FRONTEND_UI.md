# 🎨 Frontend UI Xüsusiyyətləri

## 📐 Dizayn Yanaşması

**Framework:** Material-UI (MUI)  
**Dil:** Azərbaycan  
**Tema:** Light + Professional Blue/Green

---

## 🎯 3 Ana Panel

### 1️⃣ Admin Panel (`/admin`)

**Rəng Sxemi:** 🔵 Mavi + 📊 Gri

#### Əlavə Mağaza:
```
✅ Mağaza Adı
✅ Giriş Kodu
✅ Telefon
✅ Ünvan
✅ Metro Qiyməti
✅ Xarici Qiyməti
→ Mağaza Yarat Düyməsi
```

#### Sifarişləri Təsdiq Etmə:
```
📋 Cədvəl:
┌─────┬──────────┬────────┬─────────────┐
│ ID  │ Müşteri  │ Status │ Əməliyyat   │
├─────┼──────────┼────────┼─────────────┤
│ 123 │ Rəsul    │ 🟡 Yeni│ Təsdiq Et   │
└─────┴──────────┴────────┴─────────────┘
```

#### Yaradılmış Mağazalar:
```
📊 Cədvəl:
- Mağaza Adı
- Kod
- Telefon
- Ünvan
- Qiymətlər
```

---

### 2️⃣ Store Panel (`/store`)

**Rəng Sxemi:** 🟢 Yaşıl + 📦 Sarı

#### Giriş Formu (Birinci ekran):
```
🔐 Mağaza Girişi

Mağaza Adı: [_____________]
Giriş Kodu: [_____________]

         [Daxil Ol]

💡 Sınaq:
- Adı: Bakı Mağazası
- Kod: BAK001
```

#### Mağaza Paneli (Login sonrası):
```
🏪 Bakı Mağazası
├─ 📞 Telefon: +994505555555
├─ 📍 Ünvan: Nizami küçəsi
├─ 💰 Balans: 0 AZN
│  └─ Əməliyyat
│     └─ Metro: 50 AZN
│     └─ Xarici: 100 AZN
└─ [ÇIXIŞ]
```

#### Sifariş Yaratma:
```
➕ Yeni Sifariş

Müşteri Adı: [_____________]
Çatdırılma:  [Metro / Xarici ▼]
  
Metro Varsa:
  Stansiya: [_____________]
  
Xarici Varsa:
  Ünvan: [_____________
          _____________]

         [Sifariş Yarat]
```

#### Sifarişlərim Cədvəli:
```
📦 Sifarişlərim

┌────┬────────┬────┬───────┬─────┬────────┐
│ID  │Müşteri │Tip │Məkan  │Qiym│Status  │
├────┼────────┼────┼───────┼─────┼────────┤
│1   │Rəsul   │🚇  │Atatürk│50  │🟡Yeni  │
│2   │Ayşe    │🚗  │Xalqlar│100 │✅Təsdiq│
└────┴────────┴────┴───────┴─────┴────────┘
```

#### Balans Kartı:
```
💰 Cari Balans

┌──────────────────────────────┐
│ Balans: 50 AZN              │
│ Səbəb: 1 dəfə təhvil edildi │
└──────────────────────────────┘
```

---

### 3️⃣ Courier Panel (`/courier`)

**Rəng Sxemi:** 🟠 Narıncı + ✅ Yaşıl

#### Giriş Formu:
```
🚚 Kuryerin Girişi

Kuryerin ID: [____]

💡 Sınaq: 1

     [Daxil Ol]
```

#### Kuryerin Paneli:
```
🚚 Kuryerin Panel
   ID: #1                    [ÇIXIŞ]
```

#### Əlçatarlı Sifarişlər (Sol):
```
📋 Təsdiqlənmiş Sifarişlər

┌──────────┬───────┬──────────┐
│ Müşteri  │ Məkan │ Əməliyyat│
├──────────┼───────┼──────────┤
│ Rəsul    │ 🚇 A. │[Qəbul Et]│
│ Ayşe     │ 🏢 X. │[Qəbul Et]│
└──────────┴───────┴──────────┘
```

#### İstatistika (Sağ):
```
📊 Statistika

┌─────────────────┐
│ Cəmi: 5         │
│ Aktiv: 3        │
│ Tamamlanan: 2   │
│                 │
│ ✅ Bütün hazır! │
└─────────────────┘
```

#### Mənim Sifarişlərim:
```
🚚 Mənim Sifarişlərim

┌────┬────────┬───┬──────┬─────┬────────┬──────┐
│ID  │Müşteri │Tip│Məkan │Qiym │Status  │Eytml │
├────┼────────┼───┼──────┼─────┼────────┼──────┤
│1   │Rəsul   │🚇 │Autov.│50   │📦Alındı│[S.  ]│
│2   │Ayşe    │🚗 │Xalq  │100  │🚚Yolda│[S.  ]│
│3   │Sevil   │🚇 │Fil.  │50   │✔️Təhvil│  -  │
└────┴────────┴───┴──────┴─────┴────────┴──────┘

S. = Status Yenilə düyməsi
```

#### Status Dəyişdirmə Dialog:
```
┌─────────────────────────────────┐
│ Sifariş Statusunu Yenilə        │
├─────────────────────────────────┤
│ Müşteri: Rəsul                  │
│                                 │
│ Yeni Status: [🎯 ▼]             │
│ ├─ 📦 Alındı                    │
│ ├─ 🚚 Yoldadır                  │
│ └─ ✔️ Təhvil Verildi            │
│                                 │
│ Cari: [📦 Alındı]              │
│                                 │
│       [Ləğv Et]  [Yenilə]       │
└─────────────────────────────────┘
```

---

## 🎨 Rəng Palitesi

| Element | Rəng | Hex |
|---------|------|-----|
| Primary | Mavi | #1976d2 |
| Secondary | Qırmızı | #dc004e |
| Success | Yaşıl | #4caf50 |
| Warning | Sarı | #ff9800 |
| Error | Qırmızı | #f44336 |
| Background | Gümüş | #f5f5f5 |

---

## 🏗️ Komponentin Struktur

```
App.jsx
├── AppBar (Header)
├── Drawer (Sol Meny)
└── Main Content
    ├── AdminPanel.jsx
    │   ├── Store Create Form
    │   └── Orders Table
    ├── StorePanel.jsx
    │   ├── Login Form
    │   ├── Store Dashboard
    │   ├── Order Form
    │   └── Orders List
    └── CourierPanel.jsx
        ├── Login Form
        ├── Available Orders
        ├── Stats Card
        └── My Orders Table
```

---

## 📱 Responsive Dizayn

- **xs (0-600px):** Mobile - Single Column
- **sm (600-960px):** Tablet - 2 Column
- **md (960-1264px):** Desktop - 3 Column
- **lg (1264px+):** Large - Full Layout

---

## ✨ UI/UX Xüsusiyyətləri

✅ **Material Design** prinsipləri  
✅ **Emoji** istifadəsi vizual rahatlığı  
✅ **Color-coded Status** - asanlıqla tanıma  
✅ **Hover Effects** - interaktiv hiss  
✅ **Loading States** - uyğun feedback  
✅ **Error Handling** - aydın mesajlar  
✅ **Ariund-about** - heç bir dezorientasiya  
✅ **Azərbaycan Dili** - tam yerli qurulum  

---

## 🎯 İteraktiv Elements

- 🔘 **Düymələr** - Clear Action
- 📋 **Cədvəllər** - Hover highlight
- 📢 **Alerts** - Color-coded (Success/Error)
- 📝 **Formlar** - Label + Placeholder
- 🏷️ **Chips** - Status göstəricisi
- 🎛️ **Select Box** - Dropdown seçim
- 📱 **Dialog** - Modal action confirmations

---

**Frontend Premium UI ilə tamamlanmışdır! 🎨✨**

