# HotelSync — Plateforme de réservation hôtelière

Architecture microservices Node.js avec gRPC, Kafka, REST et GraphQL.

---

## Architecture

```
Client (Postman / Web)
    │
    │  REST + GraphQL (HTTP/1.1 · JSON)
    ▼
API Gateway (port 4000)
    │
    ├── gRPC → MS Users        (port 50051) → SQLite3
    ├── gRPC → MS Bookings     (port 50052) → SQLite3
    └── gRPC → MS Notifications(port 50053) → RxDB
              ▲       ▲
              │       │  Kafka (topics: reservation.*, user.*)
              └───────┘
           Kafka Broker (port 9092)
```

---

## Prérequis

- Node.js v18+
- Docker + Docker Compose

---

## Installation et démarrage

### Avec Docker (recommandé)

```bash
git clone https://github.com/<votre-org>/hotelsync.git
cd hotelsync
docker-compose up --build
```

### Sans Docker (développement)

```bash
# Démarrer Kafka manuellement (Zookeeper + Kafka)
# Puis dans 4 terminaux séparés :

cd ms-users && npm install && node index.js
cd ms-bookings && npm install && node index.js
cd ms-notifications && npm install && node index.js
cd api-gateway && npm install && node index.js
```

Copier `.env.example` en `.env` dans chaque service.

---

## Endpoints REST

| Méthode | Route                        | Auth | Description              |
|---------|------------------------------|------|--------------------------|
| POST    | /auth/register               | —    | Inscription              |
| POST    | /auth/login                  | —    | Connexion → JWT          |
| GET     | /rooms                       | ✓    | Liste des chambres       |
| GET     | /rooms/:id/availability      | ✓    | Disponibilité            |
| POST    | /bookings                    | ✓    | Créer une réservation    |
| GET     | /bookings/my                 | ✓    | Mes réservations         |
| GET     | /bookings/:id                | ✓    | Détail réservation       |
| DELETE  | /bookings/:id                | ✓    | Annuler réservation      |
| GET     | /notifications               | ✓    | Mes notifications        |
| PATCH   | /notifications/:id/read      | ✓    | Marquer comme lu         |

Ajouter le header : `Authorization: Bearer <token>`

---

## Exemples REST (Postman / curl)

```bash
# Inscription
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali Ben","email":"ali@test.com","password":"secret123"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ali@test.com","password":"secret123"}'

# Créer une réservation
curl -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"room_id":"room-1","check_in":"2025-08-01","check_out":"2025-08-05"}'
```

---

## Schéma GraphQL

Accessible sur `http://localhost:4000/graphql`

```graphql
# Requête combinée : profil + réservations + notifications
query {
  me {
    name
    email
    bookings {
      id
      check_in
      check_out
      status
      room { name price type }
    }
  }
  myNotifications {
    type
    message
    read
    created_at
  }
}

# Vérifier disponibilité d'une chambre
query {
  checkAvailability(
    room_id: "room-1"
    check_in: "2025-08-01"
    check_out: "2025-08-05"
  )
}
```

---

## Topics Kafka

| Topic                  | Producteur    | Consommateur       | Payload                                      |
|------------------------|---------------|--------------------|----------------------------------------------|
| `user.registered`      | ms-users      | ms-notifications   | `{userId, email, name}`                      |
| `reservation.created`  | ms-bookings   | ms-notifications   | `{bookingId, userId, roomName, checkIn, ...}`|
| `reservation.cancelled`| ms-bookings   | ms-notifications   | `{bookingId, userId, reason}`                |

---

## Bases de données

| Service           | Technologie | Tables / Collections         |
|-------------------|-------------|------------------------------|
| ms-users          | SQLite3      | `users`                     |
| ms-bookings       | SQLite3      | `rooms`, `bookings`         |
| ms-notifications  | RxDB (NoSQL) | `notifications`             |

---

## Fichiers .proto

Les contrats gRPC sont dans `proto/` :
- `users.proto` — 5 méthodes (RegisterUser, LoginUser, GetUserProfile, UpdateProfile, ValidateToken)
- `bookings.proto` — 7 méthodes (CheckAvailability, CreateBooking, CancelBooking, GetBooking, ListUserBookings, UpdateBooking, ListRooms)
- `notifications.proto` — 3 méthodes (SendNotification, GetUserNotifs, MarkAsRead)

---

## Auteurs

- Dev A — API Gateway, MS Users
- Dev B — MS Bookings, MS Notifications, Kafka
