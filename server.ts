import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  MENU_ITEMS,
  DEAL_ITEMS,
  ALL_PRODUCTS,
  MenuItem,
  DealItem,
} from './src/data/menuData.ts';
import {
  INITIAL_DELIVERY_ZONES,
  DeliveryZone,
  matchDeliveryZone,
} from './src/data/deliveryZones.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());

// --- Supabase Setup & Detection ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
    console.log('[Best Food Cottage] Connected to Supabase at:', supabaseUrl);
  } catch (err) {
    console.warn('[Best Food Cottage] Supabase initialization failed:', err);
  }
} else {
  console.log('[Best Food Cottage] Running in server local persistent fallback mode.');
}

// --- Data Interfaces ---
interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  default_address?: string;
  default_landmark?: string;
  created_at: string;
}

interface OrderRecord {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark?: string;
  notes?: string;
  delivery_zone_id?: string;
  delivery_zone_name?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: 'Unpaid (COD)' | 'Paid on Delivery' | 'Cancelled';
  order_status: 'Pending' | 'Accepted' | 'Preparing' | 'Out for delivery' | 'Delivered' | 'Rejected';
  client_idempotency_key?: string;
  created_at: string;
  items: Array<{
    id: string;
    menu_item_id: string;
    item_name: string;
    unit_price: number;
    quantity: number;
    item_subtotal: number;
  }>;
}

interface ReviewRecord {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// --- Persistent Collections in Memory ---
let memoryUsers: UserRecord[] = [
  {
    id: 'user-demo-1',
    name: 'Muhammad Usman',
    email: 'demo@bestfoodcottage.pk',
    phone: '03001234567',
    password: 'sialkotfood123',
    default_address: 'House #45, Model Town, near Khadim Ali Road, Sialkot',
    default_landmark: 'Opposite Mehtaab Garments',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let memoryDeliveryZones: DeliveryZone[] = [...INITIAL_DELIVERY_ZONES];

let memoryMenuItems: MenuItem[] = [...MENU_ITEMS];
let memoryDealItems: DealItem[] = [...DEAL_ITEMS];
let memoryAllProducts: Array<MenuItem | DealItem> = [...ALL_PRODUCTS];

let memoryOrders: OrderRecord[] = [
  {
    id: 'demo-order-1',
    order_number: 'BFC-2026-1001',
    user_id: 'user-demo-1',
    customer_name: 'Muhammad Usman',
    phone: '03001234567',
    address: 'House #45, Model Town, near Khadim Ali Road, Sialkot',
    landmark: 'Opposite Mehtaab Garments',
    notes: 'Please bring extra garlic sauce',
    delivery_zone_id: 'zone-central',
    delivery_zone_name: 'Zone 1: Khadim Ali Road & Vicinity (0–3 km)',
    subtotal: 1150,
    delivery_fee: 80,
    total: 1230,
    payment_method: 'Cash on Delivery',
    payment_status: 'Unpaid (COD)',
    order_status: 'Preparing',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-demo-1',
        menu_item_id: 'sig-cottage-special-11',
        item_name: 'Cottage Special Pizza (Medium 11")',
        unit_price: 1150,
        quantity: 1,
        item_subtotal: 1150,
      },
    ],
  },
];

let memoryReviews: ReviewRecord[] = [
  {
    id: 'rev-1',
    reviewer_name: 'Hamza Malik (Sialkot)',
    rating: 5,
    comment: 'Best Cottage Special and Lazania pizza in Sialkot! Piping hot delivery, crisp crust and real mozzarella cheese pull. Highly recommended!',
    status: 'approved',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-2',
    reviewer_name: 'Ayesha Tariq',
    rating: 5,
    comment: 'Deal 7 with 2 Zingers, fries and drink for Rs. 750 is incredible value for money. Very crispy and fresh.',
    status: 'approved',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const businessSettings = {
  storeOpen: true,
  address: 'Khadim Ali Road, Opp. Classic School System (near Mehtaab Garments), Sialkot',
  phone: '0329-2000505',
  alternatePhones: ['0311-0777181', '052-3574900', '0300-8114422'],
};

// Anti-duplicate debounce
const recentSubmissions = new Map<string, number>();

// --- AUTH HELPER FUNCTIONS ---
function generateToken(userId: string): string {
  return `bfc_token_${userId}_${Buffer.from(String(Date.now())).toString('base64')}`;
}

function extractUserFromHeader(req: express.Request): UserRecord | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const parts = token.split('_');
  if (parts.length >= 3) {
    const userId = parts[2];
    const user = memoryUsers.find((u) => u.id === userId);
    return user || null;
  }
  return null;
}

// =======================================================================
// AUTHENTICATION & USER ACCOUNTS API
// =======================================================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, landmark } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid phone number (e.g. 0300 1234567).' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    const existing = memoryUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail ||
        u.phone.replace(/\D/g, '') === cleanPhone
    );
    if (existing) {
      return res.status(400).json({
        error: 'An account with this email or phone number already exists. Please log in instead.',
      });
    }

    const newUser: UserRecord = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password,
      default_address: address?.trim() || undefined,
      default_landmark: landmark?.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    memoryUsers.push(newUser);

    const token = generateToken(newUser.id);
    const { password: _, ...userSafe } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Best Food Cottage.',
      token,
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide both your email/phone and password.' });
    }

    const cleanIdent = identifier.trim().toLowerCase();
    const cleanDigits = identifier.trim().replace(/\D/g, '');

    const user = memoryUsers.find((u) => {
      const matchEmail = u.email.toLowerCase() === cleanIdent;
      const matchPhone = cleanDigits.length >= 7 && u.phone.replace(/\D/g, '').endsWith(cleanDigits.slice(-7));
      return matchEmail || matchPhone;
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email/phone and password.' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userSafe } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userSafe,
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = extractUserFromHeader(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

app.put('/api/auth/profile', (req, res) => {
  const user = extractUserFromHeader(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { name, phone, default_address, default_landmark } = req.body;
  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();
  if (default_address !== undefined) user.default_address = default_address.trim();
  if (default_landmark !== undefined) user.default_landmark = default_landmark.trim();

  const { password: _, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

app.get('/api/auth/orders', (req, res) => {
  const user = extractUserFromHeader(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to view your account order history.' });
  }

  const cleanPhone = user.phone.replace(/\D/g, '');
  const userOrders = memoryOrders.filter((ord) => {
    if (ord.user_id && ord.user_id === user.id) return true;
    const ordPhone = ord.phone.replace(/\D/g, '');
    return cleanPhone.length >= 7 && (ordPhone === cleanPhone || ordPhone.endsWith(cleanPhone.slice(-7)));
  });

  res.json({ orders: userOrders });
});

// =======================================================================
// DELIVERY ZONES API
// =======================================================================

app.get('/api/delivery-zones', (_req, res) => {
  res.json({ zones: memoryDeliveryZones });
});

app.post('/api/admin/delivery-zones', (req, res) => {
  const { name, description, deliveryFee, minOrderAmount, estimatedMinutes, postcodes, keywords } = req.body;
  if (!name || deliveryFee === undefined) {
    return res.status(400).json({ error: 'Zone name and delivery fee are required.' });
  }

  const newZone: DeliveryZone = {
    id: `zone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    description: description?.trim() || '',
    deliveryFee: Number(deliveryFee),
    minOrderAmount: Number(minOrderAmount || 0),
    estimatedMinutes: estimatedMinutes?.trim() || '30-45 mins',
    postcodes: Array.isArray(postcodes) ? postcodes : (postcodes ? [postcodes] : []),
    keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map((k: string) => k.trim()) : []),
    isActive: true,
  };

  memoryDeliveryZones.push(newZone);
  res.status(201).json({ success: true, zone: newZone });
});

app.patch('/api/admin/delivery-zones/:id', (req, res) => {
  const { id } = req.params;
  const zone = memoryDeliveryZones.find((z) => z.id === id);
  if (!zone) return res.status(404).json({ error: 'Delivery zone not found.' });

  const { name, description, deliveryFee, minOrderAmount, estimatedMinutes, postcodes, keywords, isActive } = req.body;
  if (name !== undefined) zone.name = name.trim();
  if (description !== undefined) zone.description = description.trim();
  if (deliveryFee !== undefined) zone.deliveryFee = Number(deliveryFee);
  if (minOrderAmount !== undefined) zone.minOrderAmount = Number(minOrderAmount);
  if (estimatedMinutes !== undefined) zone.estimatedMinutes = estimatedMinutes.trim();
  if (postcodes !== undefined) zone.postcodes = Array.isArray(postcodes) ? postcodes : [postcodes];
  if (keywords !== undefined) {
    zone.keywords = Array.isArray(keywords) ? keywords : keywords.split(',').map((k: string) => k.trim());
  }
  if (isActive !== undefined) zone.isActive = Boolean(isActive);

  res.json({ success: true, zone });
});

app.delete('/api/admin/delivery-zones/:id', (req, res) => {
  const { id } = req.params;
  memoryDeliveryZones = memoryDeliveryZones.filter((z) => z.id !== id);
  res.json({ success: true, message: 'Delivery zone deleted.' });
});

// =======================================================================
// SYSTEM STATUS & MENU / DEALS API
// =======================================================================

app.get('/api/status', async (_req, res) => {
  res.json({
    appName: 'Best Food Cottage',
    location: businessSettings.address,
    hotline: businessSettings.phone,
    alternatePhones: businessSettings.alternatePhones,
    supabaseConfigured: isSupabaseConfigured,
    supabaseUrl: supabaseUrl ? `${supabaseUrl.slice(0, 15)}...` : null,
    businessSettings,
    deliveryZonesCount: memoryDeliveryZones.length,
    usersCount: memoryUsers.length,
    menuItemsCount: memoryMenuItems.length,
    dealsCount: memoryDealItems.length,
    ordersCount: memoryOrders.length,
    approvedReviewsCount: memoryReviews.filter((r) => r.status === 'approved').length,
  });
});

// Regular menu items (exclusively single items - deals removed)
app.get('/api/menu', async (_req, res) => {
  res.json({ items: memoryMenuItems, source: 'poster_database' });
});

// Dedicated deals endpoint
app.get('/api/deals', async (_req, res) => {
  res.json({ deals: memoryDealItems, source: 'poster_database' });
});

// =======================================================================
// CREATE ORDER (With Delivery Zone Matching & Exact Price Verification)
// =======================================================================

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      address,
      landmark,
      notes,
      items,
      selectedZoneId,
      idempotencyKey,
    } = req.body;

    const authenticatedUser = extractUserFromHeader(req);

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return res.status(400).json({ error: 'Please enter a valid phone number (e.g. 0300-1234567).' });
    }
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide your complete delivery address in Sialkot.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Please add items before checking out.' });
    }

    // SERVER-SIDE DELIVERY FEE DETERMINATION
    // Official delivery fee is Rs. 100 as specified for Best Food Cottage
    const STANDARD_DELIVERY_FEE = 100;
    let matchedZone: DeliveryZone | null = null;

    if (selectedZoneId) {
      matchedZone = memoryDeliveryZones.find((z) => z.id === selectedZoneId && z.isActive) || null;
    }

    if (!matchedZone) {
      matchedZone = matchDeliveryZone(address, memoryDeliveryZones);
    }

    // Check if the customer explicitly entered a non-Sialkot distant city
    const lowerAddress = (address || '').toLowerCase();
    const distantCities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'peshawar', 'multan', 'quetta', 'gujranwala'];
    const isOutsideSialkotCity = distantCities.some((city) => lowerAddress.includes(city) && !lowerAddress.includes('sialkot'));

    if (isOutsideSialkotCity) {
      return res.status(422).json({
        error: 'OUTSIDE_DELIVERY_ZONE',
        message:
          'Best Food Cottage only delivers within Sialkot, Pakistan. For catering or outside deliveries, please call us directly at 0329-2000505.',
      });
    }

    const deliveryFee = STANDARD_DELIVERY_FEE;
    const deliveryZoneName = matchedZone ? matchedZone.name : 'Sialkot City Delivery (Standard Rs. 100)';
    const deliveryZoneId = matchedZone ? matchedZone.id : 'zone-central';

    // Anti-duplicate submission protection
    const submissionKey = `${phone.trim()}_${JSON.stringify(items.map((i) => ({ id: i.id, q: i.quantity })))}`;
    const now = Date.now();
    const lastSub = recentSubmissions.get(submissionKey);
    if (lastSub && now - lastSub < 20000) {
      return res.status(429).json({
        error: 'Duplicate order detected. Your order was already received a moment ago. Please check My Orders.',
      });
    }
    recentSubmissions.set(submissionKey, now);

    // SERVER-SIDE PRICE VALIDATION (Never trust totals from client)
    let calculatedSubtotal = 0;
    const validatedOrderItems: OrderRecord['items'] = [];

    for (const cartItem of items) {
      // Find matching item from canonical products or size variants
      let foundProduct =
        memoryAllProducts.find((p) => p.id === cartItem.id) ||
        memoryAllProducts.find((p) => cartItem.id.startsWith(p.id)) ||
        memoryAllProducts.find((p) => p.name.toLowerCase() === (cartItem.name || '').toLowerCase());

      let unitPrice = Number(cartItem.price) || 0;

      if (foundProduct) {
        unitPrice = foundProduct.price;
        // Check if there are size options in base menu item
        const baseItem = memoryMenuItems.find(
          (m) => m.id === foundProduct?.id || cartItem.id.startsWith(m.id)
        );
        if (baseItem && baseItem.sizeOptions && baseItem.sizeOptions.length > 0) {
          const matchedSizeOpt = baseItem.sizeOptions.find(
            (opt) =>
              cartItem.id.toLowerCase().includes(opt.size.replace(/\s+/g, '-').toLowerCase()) ||
              (cartItem.name && cartItem.name.toLowerCase().includes(opt.size.toLowerCase()))
          );
          if (matchedSizeOpt) {
            unitPrice = matchedSizeOpt.price;
          }
        }
      }

      const qty = Math.max(1, Math.floor(Number(cartItem.quantity) || 1));
      const itemSubtotal = unitPrice * qty;
      calculatedSubtotal += itemSubtotal;

      validatedOrderItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        menu_item_id: cartItem.id,
        item_name: cartItem.name || foundProduct?.name || 'Item',
        unit_price: unitPrice,
        quantity: qty,
        item_subtotal: itemSubtotal,
      });
    }

    if (matchedZone && matchedZone.minOrderAmount > 0 && calculatedSubtotal < matchedZone.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order for ${matchedZone.name} is Rs. ${matchedZone.minOrderAmount}. Please add more items to your cart.`,
      });
    }

    const finalTotal = calculatedSubtotal + deliveryFee;
    const currentYear = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BFC-${currentYear}-${randomDigits}`;

    const newOrder: OrderRecord = {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      order_number: orderNumber,
      user_id: authenticatedUser?.id,
      customer_name: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      landmark: landmark?.trim() || undefined,
      notes: notes?.trim() || undefined,
      delivery_zone_id: deliveryZoneId,
      delivery_zone_name: deliveryZoneName,
      subtotal: calculatedSubtotal,
      delivery_fee: deliveryFee,
      total: finalTotal,
      payment_method: 'Cash on Delivery',
      payment_status: 'Unpaid (COD)',
      order_status: 'Pending',
      client_idempotency_key: idempotencyKey || undefined,
      created_at: new Date().toISOString(),
      items: validatedOrderItems,
    };

    if (authenticatedUser && !authenticatedUser.default_address) {
      authenticatedUser.default_address = address.trim();
      authenticatedUser.default_landmark = landmark?.trim();
    }

    memoryOrders.unshift(newOrder);

    // If Supabase is connected, persist to Supabase asynchronously
    if (supabase) {
      try {
        const { error: ordErr } = await supabase.from('orders').insert({
          id: newOrder.id,
          order_number: newOrder.order_number,
          user_id: newOrder.user_id || null,
          customer_name: newOrder.customer_name,
          phone: newOrder.phone,
          address: newOrder.address,
          landmark: newOrder.landmark || null,
          notes: newOrder.notes || null,
          delivery_zone_id: newOrder.delivery_zone_id || null,
          delivery_zone_name: newOrder.delivery_zone_name || null,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.delivery_fee,
          total: newOrder.total,
          payment_method: newOrder.payment_method,
          payment_status: newOrder.payment_status,
          order_status: newOrder.order_status,
          client_idempotency_key: newOrder.client_idempotency_key || null,
          created_at: newOrder.created_at,
        });

        if (ordErr) {
          console.warn('[Supabase] Warning inserting order:', ordErr.message);
        } else if (newOrder.items && newOrder.items.length > 0) {
          const itemsPayload = newOrder.items.map((it) => ({
            order_id: newOrder.id,
            menu_item_id: it.menu_item_id || null,
            item_name: it.item_name,
            unit_price: it.unit_price,
            quantity: it.quantity,
            item_subtotal: it.item_subtotal,
          }));
          const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
          if (itemsErr) console.warn('[Supabase] Warning inserting order items:', itemsErr.message);
        }
      } catch (dbErr: any) {
        console.warn('[Supabase] DB insert exception:', dbErr?.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Order placed successfully! Delivery Zone: ${deliveryZoneName}. Pay cash when your order arrives.`,
      order: newOrder,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order. Please try again.' });
  }
});

app.post('/api/orders/lookup', async (req, res) => {
  const { orderNumber, phone } = req.body;

  if (!orderNumber || !phone) {
    return res.status(400).json({
      error: 'Please provide both your Order Number (e.g. BFC-2026-1001) and Contact Phone number.',
    });
  }

  const cleanInputPhone = phone.replace(/\D/g, '');
  const cleanOrderNum = orderNumber.trim().toUpperCase();

  const foundOrder = memoryOrders.find((ord) => {
    const matchNumber = ord.order_number.toUpperCase() === cleanOrderNum;
    const ordPhone = ord.phone.replace(/\D/g, '');
    const matchPhone =
      ordPhone === cleanInputPhone ||
      ordPhone.endsWith(cleanInputPhone.slice(-7)) ||
      cleanInputPhone.endsWith(ordPhone.slice(-7));
    return matchNumber && matchPhone;
  });

  if (!foundOrder) {
    return res.status(404).json({
      error: 'No matching order found for this Order Number and Phone. Please verify your details.',
    });
  }

  res.json({ order: foundOrder });
});

// Reviews API
app.get('/api/reviews', async (_req, res) => {
  const approved = memoryReviews.filter((r) => r.status === 'approved');
  const total = approved.reduce((acc, r) => acc + r.rating, 0);
  const average = approved.length > 0 ? Number((total / approved.length).toFixed(1)) : 0;
  res.json({ reviews: approved, count: approved.length, averageRating: average });
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { reviewerName, rating, comment } = req.body;
    const numRating = Number(rating);

    if (!reviewerName || typeof reviewerName !== 'string' || reviewerName.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Please select a star rating between 1 and 5.' });
    }
    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return res.status(400).json({ error: 'Please write a review comment (minimum 5 characters).' });
    }

    const newReview: ReviewRecord = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reviewer_name: reviewerName.trim(),
      rating: Math.round(numRating),
      comment: comment.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    memoryReviews.unshift(newReview);

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your review has been submitted for owner approval.',
      review: newReview,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// Admin Credentials & Authentication
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'BESTFOODCOTTAGE01';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ADMIN12345';

// Admin Login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const adminToken = `bfc_adm_${Buffer.from(`${ADMIN_USERNAME}:${Date.now()}`).toString('base64')}`;
    return res.json({
      success: true,
      message: 'Owner authentication successful.',
      token: adminToken,
      admin: {
        username: ADMIN_USERNAME,
        role: 'owner',
      },
    });
  }

  return res.status(401).json({ error: 'Invalid admin username or password.' });
});

// Admin verify session endpoint
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer bfc_adm_')) {
    return res.json({ valid: true, role: 'owner' });
  }
  return res.status(401).json({ valid: false, error: 'Unauthorized admin session.' });
});

// Admin API
app.get('/api/admin/orders', async (_req, res) => {
  if (supabase) {
    try {
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });
      if (!error && dbOrders && dbOrders.length > 0) {
        return res.json({ orders: dbOrders });
      }
    } catch (e: any) {
      console.warn('[Admin] Supabase orders fetch error:', e?.message);
    }
  }
  res.json({ orders: memoryOrders });
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const order = memoryOrders.find((o) => o.id === id || o.order_number === id);
  if (order) {
    if (status) order.order_status = status;
    if (paymentStatus) order.payment_status = paymentStatus;
  }

  if (supabase) {
    try {
      const updateData: Record<string, any> = {};
      if (status) updateData.order_status = status;
      if (paymentStatus) updateData.payment_status = paymentStatus;
      await supabase
        .from('orders')
        .update(updateData)
        .or(`id.eq.${id},order_number.eq.${id}`);
    } catch (e: any) {
      console.warn('[Admin] Supabase order patch error:', e?.message);
    }
  }

  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, order });
});

app.get('/api/admin/reviews', async (_req, res) => {
  if (supabase) {
    try {
      const { data: dbReviews, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && dbReviews && dbReviews.length > 0) {
        return res.json({ reviews: dbReviews });
      }
    } catch (e: any) {
      console.warn('[Admin] Supabase reviews fetch error:', e?.message);
    }
  }
  res.json({ reviews: memoryReviews });
});

app.patch('/api/admin/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const review = memoryReviews.find((r) => r.id === id);
  if (review && status) {
    review.status = status;
  }

  if (supabase && status) {
    try {
      await supabase.from('reviews').update({ status }).eq('id', id);
    } catch (e: any) {
      console.warn('[Admin] Supabase review patch error:', e?.message);
    }
  }

  if (!review) return res.status(404).json({ error: 'Review not found' });
  res.json({ success: true, review });
});

// Frontend Middleware
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Best Food Cottage] Server running on http://localhost:${PORT}`);
});
