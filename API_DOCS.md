# PharmaCare API Reference

Base URL (local): `http://localhost:5000/api`

Auth: most endpoints require `Authorization: Bearer <accessToken>`. The refresh token lives in an httpOnly cookie set automatically on login/register — the frontend's axios instance already handles refreshing it.

All responses follow the shape:
```json
{ "success": true, "message": "...", "data": {}, "pagination": {}, "errors": [] }
```

---

## Auth — `/auth`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/register/customer` | none | name, email, phone, password | Sends OTP email |
| POST | `/register/chemist` | none | name, email, phone, password, shopName, licenseNumber, gstNumber, shopAddress, openingHours | Sends OTP email |
| POST | `/verify-email` | none | email, otp | Returns accessToken + user on success |
| POST | `/login` | none | email, password, rememberMe | `rememberMe: true` → 30-day session, else browser-session cookie |
| POST | `/refresh` | cookie | — | Rotates refresh token, returns new accessToken |
| POST | `/logout` | cookie | — | Clears refresh token |
| POST | `/forgot-password` | none | email | Always returns success (no email enumeration) |
| POST | `/reset-password` | none | token, password | Invalidates all existing sessions |
| GET | `/me` | Bearer | — | Current user profile |

## Medicines / Inventory — `/medicines`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | none | Public catalog. Query: `search, category, sort, page, limit, minPrice, maxPrice` |
| GET | `/:id` | none | Single medicine detail |
| GET | `/inventory/mine` | chemist | Own inventory, includes out-of-stock/expired |
| GET | `/analytics/summary` | chemist | Stock health counts + inventory value |
| POST | `/` | chemist | multipart/form-data with `images[]`; name, category, batchNumber, expiryDate, mrp, sellingPrice, discountPercent, stockQuantity required |
| PATCH | `/:id` | chemist (owner) | Same fields, partial update |
| DELETE | `/:id` | chemist (owner) | Also removes Cloudinary images |

## Orders — `/orders`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | customer | `items: [{medicineId, quantity}], deliveryAddress, paymentMethod ('cod'\|'razorpay'), razorpayOrderId?, razorpayPaymentId?, razorpaySignature?`. All items must be from one chemist. For `razorpay`, the signature is verified server-side before the order is created. |
| GET | `/mine` | customer | Own order history. Query: `status, page, limit` |
| GET | `/shop` | chemist | Incoming orders. Query: `status, page, limit` |
| GET | `/customers` | chemist | Aggregated customer list (orders, spend, last order) |
| GET | `/:id` | owner or fulfilling chemist | Full order detail |
| GET | `/:id/invoice` | owner or fulfilling chemist | Streams a PDF invoice |
| PATCH | `/:id/cancel` | customer (owner) | Only while `status === 'pending'` |
| PATCH | `/:id/status` | chemist (fulfilling) | `status: accepted\|rejected\|dispatched\|delivered`. Stock decrements automatically on `accepted`. |

## Reviews — `/reviews`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/medicine/:medicineId` | none | All reviews for a medicine |
| GET | `/chemist/:chemistId` | none | All reviews for a pharmacy |
| GET | `/reviewable/:orderId` | customer | Whether this order still needs a review |
| POST | `/` | customer | `orderId, medicineId, rating (1-5), comment`. Order must be `delivered`. One review per order. |

## Users — `/users`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/chemists/nearby` | none | Query: `lat, lng, radiusKm`. Haversine-sorted |
| PATCH | `/profile` | Bearer | name, phone, shopDetails (chemist), avatar (multipart) |
| POST | `/addresses` | Bearer (customer) | label, line1, city, state, pincode |
| DELETE | `/addresses/:addressId` | Bearer (customer) | — |
| GET | `/wishlist` | Bearer (customer) | Populated medicine list |
| POST | `/wishlist/:medicineId` | Bearer (customer) | Toggles on/off |
| POST | `/favorites/:chemistId` | Bearer (customer) | Toggles on/off |

## Notifications — `/notifications`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | Bearer | Last 50 + unread count |
| PATCH | `/:id/read` | Bearer | Mark one as read |
| PATCH | `/read-all` | Bearer | Mark all as read |

## Admin — `/admin`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/overview` | admin | Platform-wide counts |
| GET | `/users` | admin | Query: `role, page, limit` |
| PATCH | `/users/:id/verify` | admin | Marks a chemist's shop details verified |
| PATCH | `/users/:id/toggle-active` | admin | Activate/deactivate any account |

Bootstrap the first admin with: `cd backend && npm run seed:admin -- "Admin Name" admin@pharmacare.com "StrongPass123"`

## AI Assistant — `/ai`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/chat` | none (guest + logged-in) | `message: string, history?: [{role: 'user'\|'assistant', content: string}]` | Rate-limited to 30 messages/10min per client. Returns `{ reply, configured }` — `configured: false` means `GEMINI_API_KEY` isn't set yet and the reply is a friendly placeholder. |

## Payments — `/payments`

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/config` | none | — | `{ configured: boolean, keyId: string\|null }` — lets the frontend show/hide the "Pay Online" option |
| POST | `/razorpay/order` | customer | `amount` (rupees) | Creates a real Razorpay order server-side; returns `{ orderId, amount, currency, keyId }` for the Checkout modal |

Payment verification isn't a separate endpoint — it happens inside `POST /orders`: when `paymentMethod: 'razorpay'` is sent along with `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature` from the Checkout callback, the backend verifies the HMAC-SHA256 signature before creating the order and marking it paid. An order is never created as "paid" from client input alone.

## Real-time (Socket.IO)

Connect with `io(SOCKET_URL, { auth: { token: accessToken } })`. Each user joins a room named `user:<id>`.

| Event | Direction | Payload |
|---|---|---|
| `order:new` | server → chemist | `{ orderId, orderNumber }` |
| `order:status` | server → customer/chemist | `{ orderId, status }` |
