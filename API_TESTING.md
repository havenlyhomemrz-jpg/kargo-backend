# API Testing - Backend Endpoint-ləri

Backend endpoints-ləri birbaşa test etmək üçün qısaltmalar.

## Authentication - Login Etmə

Əvvəldən token almaq lazımdır:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "code": "1234",
    "role": "admin"
  }'
```

**Cavab:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "admin",
    "role": "admin",
    "code": "1234"
  }
}
```

Token-i saxlayın, bütün admin istəklərdə istifadə olunacaq:
```
Authorization: Bearer <YOUR_TOKEN>
```

## Store Endpoints

### 1. Mağaza Yaratmak - POST /api/admin/store/create

```bash
curl -X POST http://localhost:4000/api/admin/store/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "name": "Bakı Merkez Mağaza",
    "code": "BAK_MERKEZ_001",
    "phone": "+994505555501",
    "address": "28 May kuçəsi, 5",
    "metroPrice": 50,
    "outsidePrice": 100
  }'
```

**Cavab (201 Created):**
```json
{
  "message": "Mağaza uğurla yaradıldı",
  "store": {
    "id": 1712282400000,
    "name": "Bakı Merkez Mağaza",
    "code": "BAK_MERKEZ_001",
    "phone": "+994505555501",
    "address": "28 May kuçəsi, 5",
    "metroPrice": 50,
    "outsidePrice": 100,
    "balance": 0,
    "createdAt": "2026-04-05T10:20:00.000Z"
  }
}
```

### Test Nümunələri

#### Mağaza 1
```bash
curl -X POST http://localhost:4000/api/admin/store/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Gəncə Filiali",
    "code": "GANJA_FIL_001",
    "phone": "+994505665501",
    "address": "Atatürk prospekti, 10",
    "metroPrice": 45,
    "outsidePrice": 95
  }'
```

#### Mağaza 2
```bash
curl -X POST http://localhost:4000/api/admin/store/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Sumqayıt Mağazası",
    "code": "SUMGAIT_MAG_001",
    "phone": "+994545775501",
    "address": "Lenin Prospekti, 20",
    "metroPrice": 40,
    "outsidePrice": 90
  }'
```

### Error Nümunələri

#### Boş Sahələr
```bash
curl -X POST http://localhost:4000/api/admin/store/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Test Mağaza",
    "code": "TEST_001"
  }'
```

**Cavab (400):**
```json
{
  "error": "Bütün sahələr doldurulmalıdır"
}
```

#### Duplikat Ad
```bash
curl -X POST http://localhost:4000/api/admin/store/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Bakı Merkez Mağaza",
    "code": "DUPLIKAT_001",
    "phone": "+994505555502",
    "address": "test",
    "metroPrice": 50,
    "outsidePrice": 100
  }'
```

**Cavab (409):**
```json
{
  "error": "Bu adla mağaza artıq mövcuddur"
}
```

#### Mənfi Qiymət
```bash
curl -X POST http://localhost:4000/api/admin/store/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Qiymət Testi",
    "code": "PRICE_TEST_001",
    "phone": "+994505555503",
    "address": "Test",
    "metroPrice": -50,
    "outsidePrice": 100
  }'
```

**Cavab (400):**
```json
{
  "error": "Qiymətlər müsbət rəqəm olmalıdır"
}
```

## Courier Endpoints

### 1. Kuryer Yaratmak - POST /api/admin/courier/create

```bash
curl -X POST http://localhost:4000/api/admin/courier/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Murad Qahraman",
    "code": "MURAD_001",
    "phone": "+994517777701"
  }'
```

**Cavab (201 Created):**
```json
{
  "message": "Kuryer uğurla yaradıldı",
  "courier": {
    "id": 1712282450000,
    "name": "Murad Qahraman",
    "code": "MURAD_001",
    "phone": "+994517777701",
    "balance": 0,
    "createdAt": "2026-04-05T10:20:50.000Z"
  }
}
```

### Test Nümunələri

#### Kuryer 1
```bash
curl -X POST http://localhost:4000/api/admin/courier/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Əli Əzimov",
    "code": "ALI_AZIMOV_001",
    "phone": "+994507889701"
  }'
```

#### Kuryer 2
```bash
curl -X POST http://localhost:4000/api/admin/courier/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Elmir Hüseynov",
    "code": "ELMIR_HUS_001",
    "phone": "+994512233701"
  }'
```

### Error Nümunələri

#### Boş Sahələr
```bash
curl -X POST http://localhost:4000/api/admin/courier/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Test Kuryer",
    "code": "TEST_001"
  }'
```

**Cavab (400):**
```json
{
  "error": "Bütün sahələr doldurulmalıdır"
}
```

#### Duplikat Ad
```bash
curl -X POST http://localhost:4000/api/admin/courier/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Murad Qahraman",
    "code": "DUPLIKAT_KURYER",
    "phone": "+994517777702"
  }'
```

**Cavab (409):**
```json
{
  "error": "Bu adla kuryer artıq mövcuddur"
}
```

## Login Test - Yeni İstifadəçilər

### Yeni Mağaza ilə Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bakı Merkez Mağaza",
    "code": "BAK_MERKEZ_001",
    "role": "store"
  }'
```

**Cavab:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1712282400000,
    "name": "Bakı Merkez Mağaza",
    "role": "store",
    "code": "BAK_MERKEZ_001"
  }
}
```

### Yeni Kuryer ilə Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Murad Qahraman",
    "code": "MURAD_001",
    "role": "courier"
  }'
```

**Cavab:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1712282450000,
    "name": "Murad Qahraman",
    "role": "courier",
    "code": "MURAD_001"
  }
}
```

## Postman Collection (JSON)

Postman-da istifadə etmək üçün:

```json
{
  "info": {
    "name": "Kargo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Admin Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:4000/api/auth/login",
        "body": {
          "raw": "{\"name\": \"admin\", \"code\": \"1234\", \"role\": \"admin\"}"
        }
      }
    },
    {
      "name": "2. Create Store",
      "request": {
        "method": "POST",
        "header": {
          "Authorization": "Bearer <TOKEN>"
        },
        "url": "http://localhost:4000/api/admin/store/create",
        "body": {
          "raw": "{\"name\": \"Bakı Merkez\", \"code\": \"BAK001\", \"phone\": \"+994505555501\", \"address\": \"28 May\", \"metroPrice\": 50, \"outsidePrice\": 100}"
        }
      }
    },
    {
      "name": "3. Create Courier",
      "request": {
        "method": "POST",
        "header": {
          "Authorization": "Bearer <TOKEN>"
        },
        "url": "http://localhost:4000/api/admin/courier/create",
        "body": {
          "raw": "{\"name\": \"Murad\", \"code\": \"MURAD001\", \"phone\": \"+994517777701\"}"
        }
      }
    }
  ]
}
```

## Command Line Test Script

Bütün istəqləri avtomatik test etmək üçün:

```bash
#!/bin/bash

# De token almaq
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "admin", "code": "1234", "role": "admin"}' | jq -r '.token')

echo "Token: $TOKEN"

# Mağaza yaratmak
echo "Mağaza yaradılır..."
curl -X POST http://localhost:4000/api/admin/store/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Store",
    "code": "TEST_STORE_001",
    "phone": "+994505555501",
    "address": "Test Address",
    "metroPrice": 50,
    "outsidePrice": 100
  }' | jq '.'

# Kuryer yaratmak
echo "Kuryer yaradılır..."
curl -X POST http://localhost:4000/api/admin/courier/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Courier",
    "code": "TEST_COURIER_001",
    "phone": "+994517777701"
  }' | jq '.'
```

Bu script-i `test.sh` olaraq saxlayıb çalışdırın:
```bash
chmod +x test.sh
./test.sh
```

---

**Bütün endpoint-lər tam işlək! 🚀**
