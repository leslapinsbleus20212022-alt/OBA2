/**
 * Security Rules Verification Suite (Dirty Dozen Adversarial Payloads)
 * Mirrors the invariants declared in security_spec.md and firestore.rules.
 */

export interface SecurityTestCase {
  id: string;
  name: string;
  operation: 'create' | 'get' | 'list' | 'update';
  path: string;
  auth: { uid?: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const dirtyDozenPayloads: SecurityTestCase[] = [
  {
    id: 'DD-01',
    name: 'Status Spoofing on Create',
    operation: 'create',
    path: 'orders/order-spoof-01',
    auth: null,
    payload: {
      orderNumber: 'OBA-261117-AB12',
      status: 'payee',
      customerName: 'Distribution Royal',
      phone: '+22997000000',
      recipientName: 'Moussa',
      totalAmount: 150000,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-02',
    name: 'Cross-Client Order Read',
    operation: 'get',
    path: 'orders/order-123',
    auth: null,
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-03',
    name: 'Order Collection Scraping',
    operation: 'list',
    path: 'orders',
    auth: { uid: 'guest-user-1', email: 'client@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    name: 'Shadow Field Injection on Order',
    operation: 'create',
    path: 'orders/order-shadow-04',
    auth: null,
    payload: {
      orderNumber: 'OBA-261117-CD34',
      status: 'nouvelle',
      isVerified: true,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    name: 'Backdated Timestamp Attack on Order',
    operation: 'create',
    path: 'orders/order-time-05',
    auth: null,
    payload: {
      orderNumber: 'OBA-261117-EF56',
      status: 'nouvelle',
      createdAt: '2020-01-01T00:00:00Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-06',
    name: 'Empty Items / Negative Total',
    operation: 'create',
    path: 'orders/order-empty-06',
    auth: null,
    payload: {
      orderNumber: 'OBA-261117-GH78',
      status: 'nouvelle',
      items: [],
      totalAmount: -5000,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-07',
    name: 'Resource Poisoning via Oversized ID',
    operation: 'create',
    path: `orders/${'a'.repeat(150)}`,
    auth: null,
    payload: { orderNumber: 'OBA-261117-IJ90', status: 'nouvelle' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-08',
    name: 'Non-Admin Product Price Tampering',
    operation: 'update',
    path: 'products/oba-imperial-whisky',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: { price: 1 },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-09',
    name: 'Self-Escalation into Admins Collection',
    operation: 'create',
    path: 'admins/attacker-uid',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: { email: 'attacker@example.com', displayName: 'Attacker', role: 'admin' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    name: 'Email Spoofing Without Verified Email',
    operation: 'list',
    path: 'orders',
    auth: { uid: 'spoof-uid', email: 'agballoc@gmail.com', email_verified: false },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    name: 'Immutable OrderNumber Tampering by Admin Update',
    operation: 'update',
    path: 'orders/order-123',
    auth: { uid: 'admin-uid', email: 'agballoc@gmail.com', email_verified: true },
    payload: { orderNumber: 'OBA-000000-HACK', status: 'confirmee' },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-12',
    name: 'GPS Coordinate Out-of-Bounds Poisoning',
    operation: 'create',
    path: 'orders/order-gps-12',
    auth: null,
    payload: {
      orderNumber: 'OBA-261117-KL12',
      status: 'nouvelle',
      hasGps: true,
      latitude: 999,
      longitude: -999,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
];
