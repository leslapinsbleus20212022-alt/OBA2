# Security Specification & Payload-First TDD — OBA IMPÉRIAL

## 1. Data Invariants

1. **Public Catalog / Admin-Only Catalog Mutation**: Anyone can read `products/{productId}` to browse the catalog without an account, but only verified administrators (`isAdmin()`) may create, update, or delete products.
2. **Client Order Submission Without Account, Strict PII Isolation**: Unauthenticated wholesale clients can create a document in `orders/{orderId}` ONLY with `status == "nouvelle"`, valid `orderNumber` format (`^OBA-[0-9]{6}-[A-Z0-9]{4}$`), bounded `items` (`1..30`), valid location data (either GPS coordinates or manual address), and server timestamps (`createdAt == request.time`, `updatedAt == request.time`).
3. **Zero Cross-Client Order Leakage**: Non-administrators can NEVER `get` or `list` `orders/{orderId}` (PII isolation: customer names, phone numbers, and GPS coordinates remain strictly restricted to `isAdmin()`).
4. **Immutable Order Core & Admin-Only Status Lifecycle**: Once created, `orderNumber` and `createdAt` are immutable. Only `isAdmin()` can update `status`, `statusHistory`, `adminNote`, and `updatedAt`.
5. **No Self-Assigned Admin Privilege Escalation**: Users cannot write to `admins/{adminId}` unless they are already an authorized `isAdmin()` (or the bootstrapped verified super-admin `agballoc@gmail.com`).

## 2. The "Dirty Dozen" Adversarial Payloads

1. **DD-01 (Status Spoofing on Create)**: Client creates order with `status: "payee"` instead of `"nouvelle"`. Expected: `PERMISSION_DENIED`.
2. **DD-02 (Cross-Client Order Read)**: Unauthenticated client or non-admin calls `get` on `orders/order-123`. Expected: `PERMISSION_DENIED`.
3. **DD-03 (Order Collection Scraping)**: Non-admin calls `list` on `orders`. Expected: `PERMISSION_DENIED`.
4. **DD-04 (Shadow Field Injection on Order)**: Client creates order with extra ghost field `isVerified: true` or `discountOverride: 99`. Expected: `PERMISSION_DENIED`.
5. **DD-05 (Backdated Timestamp Attack on Order)**: Client sends custom `createdAt` or `updatedAt` not equal to `request.time`. Expected: `PERMISSION_DENIED`.
6. **DD-06 (Empty/Negative Order Total)**: Client submits `items: []` or `totalAmount: -5000`. Expected: `PERMISSION_DENIED`.
7. **DD-07 (Resource Poisoning via Oversized ID)**: Client writes to `orders/<150-char-id>` or invalid characters `$bad/id`. Expected: `PERMISSION_DENIED`.
8. **DD-08 (Non-Admin Product Price Tampering)**: Non-admin calls `update` on `products/reserve-royale` to set `price: 1`. Expected: `PERMISSION_DENIED`.
9. **DD-09 (Self-Escalation into Admins Collection)**: Non-admin user writes `admins/<theirUid>` with `role: "admin"`. Expected: `PERMISSION_DENIED`.
10. **DD-10 (Email Spoofing Without Verified Email)**: Authenticated token has `email: "agballoc@gmail.com"` with `email_verified: false`. Expected: `PERMISSION_DENIED`.
11. **DD-11 (Immutable OrderNumber Tampering by Admin Update)**: Admin attempts to overwrite `orderNumber` or `createdAt` during an order status update. Expected: `PERMISSION_DENIED`.
12. **DD-12 (GPS Coordinate Out-of-Bounds Poisoning)**: Client submits `hasGps: true, latitude: 999, longitude: -999`. Expected: `PERMISSION_DENIED`.
