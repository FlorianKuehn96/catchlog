# Stripe Integrationsplan

## Überblick

**Ziel:** Subscription-basierte Premium-Mitgliedschaften implementieren  
**Zeitrahmen:** 1-2 Tage Entwicklung + Testing  
**Kosten:** Stripe Gebühren (1,5% + 0,25€ pro europäische Karte)  

---

## 1. Stripe Account Setup

### Schritte
1. **Account erstellen:** https://stripe.com/de
2. **Business-Typ:** "Einzelunternehmer" oder "Kleines Unternehmen"
3. **Bankkonto verifizieren** (Auszahlungen)
4. **Steuer-Informationen:** EU-USt-IdNr. (falls vorhanden)

### Wichtige Einstellungen
- **Währung:** EUR (Standard)
- **Automatische Auszahlungen:** Täglich (7 Tage Delay für erste)
- **E-Mail-Benachrichtigungen:** Abonnements, Zahlungsfehler

---

## 2. Stripe Produkte & Preise

### Produkt: CatchLog Premium

```javascript
// Stripe Dashboard → Produkte → Produkt erstellen

Produkt: "CatchLog Premium"
Beschreibung: "Unbegrenzte Fänge, Export, Premium-Features"

Preise:
1. Monthly Subscription
   - Preis: 4,99€
   - Abrechnung: Monatlich
   - ID: price_monthly

2. Yearly Subscription  
   - Preis: 39,99€
   - Abrechnung: Jährlich
   - Ersparnis: 33%
   - ID: price_yearly

3. Lifetime (optional, später)
   - Preis: 99,99€
   - Einmalzahlung
   - ID: price_lifetime
```

### Empfohlene Preisgestaltung

| Plan | Preis | Features |
|------|-------|----------|
| **Free** | 0€ | 50 Fänge, Basis-Statistiken, keine Exporte |
| **Premium Monthly** | 4,99€/Monat | Unbegrenzte Fänge, CSV/Excel Export, Premium-Statistiken |
| **Premium Yearly** | 39,99€/Jahr | Gleich wie Monthly, 33% Rabatt |

---

## 3. Technische Integration

### 3.1 Environment Variables

```bash
# .env.local (bereits vorhanden, erweitern)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
NEXT_PUBLIC_APP_URL=https://catchlog.app
```

### 3.2 Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 3.3 Database Schema (Redis)

```typescript
// User Subscription-Status speichern
interface UserSubscription {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  plan: 'monthly' | 'yearly' | 'lifetime';
  currentPeriodStart: number; // Unix timestamp
  currentPeriodEnd: number;   // Unix timestamp
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

// Redis Keys
const userSubscriptionKey = (userId: string) => `user:${userId}:subscription`;
```

### 3.4 API Routes

#### POST /api/stripe/checkout-session
Erstellt Checkout-Session für Subscription

```typescript
import { getStripe } from '@/lib/stripe';
import { getRedis } from '@/lib/redis';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await req.json();
  
  const stripe = getStripe();
  
  // Stripe Customer erstellen oder holen
  let customerId = await getRedis().get(`user:${session.user.id}:stripe_customer`);
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id }
    });
    customerId = customer.id;
    await getRedis().set(`user:${session.user.id}:stripe_customer`, customerId);
  }

  // Checkout Session erstellen
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    subscription_data: {
      metadata: { userId: session.user.id }
    }
  });

  return Response.json({ url: checkoutSession.url });
}
```

#### POST /api/stripe/webhook
Verarbeitet Stripe Events

```typescript
import { getStripe } from '@/lib/stripe';
import { getRedis } from '@/lib/redis';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get('stripe-signature');
  
  const stripe = getStripe();
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription;
      
      // Subscription in Redis speichern
      await getRedis().set(`user:${userId}:subscription`, JSON.stringify({
        stripeCustomerId: session.customer,
        stripeSubscriptionId: subscriptionId,
        status: 'active',
        plan: session.mode === 'subscription' ? 'monthly' : 'lifetime',
        currentPeriodStart: Date.now() / 1000,
        currentPeriodEnd: Date.now() / 1000 + 30 * 24 * 60 * 60, // +30 Tage
        createdAt: new Date().toISOString()
      }));
      
      break;
    }
    
    case 'invoice.payment_succeeded': {
      // Zahlung erfolgreich - Subscription verlängern
      const invoice = event.data.object;
      // Update period_end in Redis
      break;
    }
    
    case 'invoice.payment_failed': {
      // Zahlung fehlgeschlagen
      const invoice = event.data.object;
      const userId = invoice.metadata?.userId;
      
      await getRedis().set(`user:${userId}:subscription:status`, 'past_due');
      
      // Email-Benachrichtigung senden (später)
      break;
    }
    
    case 'customer.subscription.deleted': {
      // Subscription gekündigt oder abgelaufen
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      
      await getRedis().set(`user:${userId}:subscription:status`, 'canceled');
      break;
    }
  }

  return Response.json({ received: true });
}
```

#### GET /api/user/subscription
Prüft Subscription-Status

```typescript
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscriptionData = await getRedis().get(`user:${session.user.id}:subscription`);
  
  if (!subscriptionData) {
    return Response.json({ 
      status: 'free',
      catchLimit: 50,
      canExport: false
    });
  }

  const subscription = JSON.parse(subscriptionData);
  
  return Response.json({
    status: subscription.status,
    plan: subscription.plan,
    currentPeriodEnd: subscription.currentPeriodEnd,
    catchLimit: subscription.status === 'active' ? Infinity : 50,
    canExport: subscription.status === 'active'
  });
}
```

#### POST /api/stripe/cancel
Kündigt Subscription

```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscriptionData = await getRedis().get(`user:${session.user.id}:subscription`);
  
  if (!subscriptionData) {
    return Response.json({ error: 'No active subscription' }, { status: 400 });
  }

  const subscription = JSON.parse(subscriptionData);
  const stripe = getStripe();

  // Subscription am Period-Ende kündigen (nicht sofort)
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true
  });

  await getRedis().set(`user:${session.user.id}:subscription`, JSON.stringify({
    ...subscription,
    cancelAtPeriodEnd: true
  }));

  return Response.json({ success: true, message: 'Subscription will be canceled at period end' });
}
```

### 3.5 Frontend Components

#### Pricing Page

```typescript
// src/app/pricing/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PricingPage() {
  const { data: session } = useSession();

  const handleSubscribe = async (priceId: string) => {
    if (!session) {
      // Redirect to login
      return;
    }

    const response = await fetch('/api/stripe/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Wähle deinen Plan</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="text-3xl font-bold my-4">0€</p>
          <ul className="space-y-2">
            <li>✓ Bis zu 50 Fänge</li>
            <li>✓ Basis-Statistiken</li>
            <li>✓ GPS-Spot-Tracking</li>
            <li className="text-gray-400">✗ Kein Export</li>
          </ul>
        </div>

        {/* Premium Plan */}
        <div className="border-2 border-blue-500 rounded-lg p-6">
          <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full inline-block mb-4">
            Empfohlen
          </div>
          <h2 className="text-xl font-semibold">Premium</h2>
          <p className="text-3xl font-bold my-4">4,99€/Monat</p>
          <p className="text-sm text-gray-600 mb-4">oder 39,99€/Jahr (33% Rabatt)</p>
          
          <ul className="space-y-2">
            <li>✓ Unbegrenzte Fänge</li>
            <li>✓ CSV/Excel Export</li>
            <li>✓ Erweiterte Statistiken</li>
            <li>✓ Premium-Support</li>
          </ul>

          <button
            onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY)}
            className="w-full bg-blue-600 text-white py-2 rounded mt-6 hover:bg-blue-700"
          >
            Jetzt upgraden
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Subscription Check Hook

```typescript
// src/hooks/useSubscription.ts
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useSubscription() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch('/api/user/subscription')
      .then(res => res.json())
      .then(data => {
        setSubscription(data);
        setLoading(false);
      });
  }, [session]);

  return { subscription, loading };
}

// Verwendung in CatchForm.tsx
const { subscription } = useSubscription();

if (subscription?.status !== 'active' && catchCount >= 50) {
  return <UpgradePrompt />;
}
```

---

## 4. Webhook Testing

### Stripe CLI installieren

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# oder Download für Windows/Linux: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Webhook forwarding einrichten
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Webhook Secret speichern

Die Ausgabe des `stripe listen` Befehls enthält das Webhook Secret:
```
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxx...
```

In `.env.local` eintragen:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 5. Testing Checklist

### Test-Szenarien

- [ ] **Checkout erfolgreich:**
  - Kunde kann Bezahlung durchführen
  - Subscription wird in Redis gespeichert
  - User sieht Premium-Features

- [ ] **Zahlung fehlgeschlagen:**
  - Testkarte `4000000000000002` (declined)
  - Fehlermeldung wird angezeigt
  - User bleibt auf Free-Plan

- [ ] **Subscription verlängern:**
  - Nächste Zahlung erfolgreich
  - Period end wird aktualisiert

- [ ] **Kündigung:**
  - Kunde kündigt Subscription
  - Bleibt bis Period-Ende Premium
  - Danach Fallback auf Free

- [ ] **Grace Period:**
  - Zahlung fehlt
  - User behält Premium für 3 Tage
  - Danach Einschränkung auf Free

---

## 6. Go-Live Checklist

### Vor dem Launch

- [ ] Stripe Account verifiziert (Bankkonto)
- [ ] Produkt/Preise im Live-Modus erstellt
- [ ] Environment Variables auf Production aktualisiert
- [ ] Webhook Endpoint in Stripe Dashboard registriert
- [ ] Test-Zahlungen erfolgreich
- [ ] Terms of Service + Cancellation Policy verlinkt
- [ ] DSGVO-konforme Zahlungs-Emails (Stripe erledigt das)

### Post-Launch Monitoring

- [ ] Stripe Dashboard regelmäßig checken
- [ ] Fehlgeschlagene Zahlungen bearbeiten
- [ ] Churn-Rate monatlich analysieren
- [ ] Support-Anfragen zu Billing tracken

---

## 7. Integration Timeline

| Tag | Aktivität | Zeit |
|-----|-----------|------|
| 1 | Stripe Account Setup, Produkte erstellen | 1h |
| 1 | API Routes implementieren | 2-3h |
| 1 | Frontend (Pricing Page, Subscription Check) | 2h |
| 2 | Webhook Testing, Edge Cases | 2h |
| 2 | Integration Tests, Bugfixes | 2h |
| **Gesamt** | | **9-10h** |

---

## 8. Wichtige Hinweise

### Sicherheit
- Stripe Secret Key niemals im Frontend verwenden
- Webhook Signature immer validieren
- Subscription-Status serverseitig prüfen (nicht Client)

### DSGVO
- Stripe verarbeitet Zahlungsdaten (PCI-compliant)
- Speichere nur Stripe Customer ID, keine Kreditkarten-Daten
- Klare Billing-Informationen in Privacy Policy

### Wirtschaftlichkeit
- Bei Stripe-Kosten von ~2,5% + 0,25€ pro Transaktion:
  - 4,99€ Abo → ~4,62€ netto
  - 39,99€ Jahresabo → ~38,74€ netto
- Deckung bei ~15 zahlenden Kunden/Monat

---

**Erstellt:** 2026-03-19  
**Status:** Bereit für Implementation
**Nächster Schritt:** Stripe Account erstellen & Test-Modus aufsetzen
