import { useState, useEffect } from "react";

const SUPABASE_URL = "https://lbvbvxbrebornbluvywj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidmJ2eGJyZWJvcm5ibHV2eXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTQ3NjYsImV4cCI6MjA5NjA5MDc2Nn0.RqJyPJQyK7Uwvq3WmO6VXyx1Vk2dHEzooYkdaFhkxJQ";
const IS_DEMO = SUPABASE_URL === "YOUR_SUPABASE_URL";

const sb = {
  async getOrders() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?order=created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },
  async createOrder(order) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  },
  async updateOrder(id, updates) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update");
    return res.json();
  },
  async getOrderById(id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    return data[0] || null;
  },
};

async function sendSMS(to, message) {
  await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to, message }),
  });
}

const demoOrders = [
  { id: "ORD-001", restaurant_name: "Joe's Pizza", restaurant_address: "12 Main St, Canaan, CT", customer_name: "Sarah M.", customer_phone: "(860) 555-3344", dropoff_address: "78 Hollenbeck Ave, North Canaan, CT", order_details: "2x Margherita, 1x Caesar salad", notes: "Leave at door", status: "pending", delivery_fee: 6.00, created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "ORD-002", restaurant_name: "Village Cafe", restaurant_address: "45 Railroad St, Canaan, CT", customer_name: "Tom K.", customer_phone: "(860) 555-7788", dropoff_address: "233 Ashley Falls Rd, Canaan, CT", order_details: "1x Breakfast sandwich, 1x Coffee", notes: "", status: "active", delivery_fee: 7.50, created_at: new Date(Date.now() - 12 * 60000).toISOString() },
];

const sampleRestaurants = {
  "joes-pizza": { name: "Joe's Pizza", address: "12 Main St, Canaan, CT 06018", slug: "joes-pizza" },
  "village-cafe": { name: "Village Cafe", address: "45 Railroad St, Canaan, CT 06018", slug: "village-cafe" },
};

const statusColors = {
  pending: { bg: "#FFF3CD", text: "#856404", dot: "#FFC107" },
  active: { bg: "#D1ECF1", text: "#0C5460", dot: "#17A2B8" },
  delivered: { bg: "#D4EDDA", text: "#155724", dot: "#28A745" },
  cancelled: { bg: "#F8D7DA", text: "#721C24", dot: "#DC3545" },
};

const font = "'DM Mono', monospace";
const serif = "'Playfair Display', serif";
const cream = "#F9F5EE";
const ink = "#1A1612";
const rust = "#C0392B";
const muted = "#7A7065";
const border = "#DDD5C8";

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return diff + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  return Math.floor(diff / 3600) + "h ago";
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  return (
    <div style={{ fontFamily: font, background: cream, minHeight: "100vh", color: ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { font-family: inherit; }
        button { cursor: pointer; font-family: inherit; }
        .nav-btn { background: none; border: none; padding: 8px 16px; font-size: 13px; color: ${muted}; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .nav-btn.active { color: ${rust}; border-bottom: 2px solid ${rust}; }
        .nav-btn:hover { color: ${ink}; }
        .card { background: white; border: 1px solid ${border}; border-radius: 4px; padding: 20px; }
        .order-card { background: white; border: 1px solid ${border}; border-radius: 4px; padding: 18px 20px; transition: box-shadow 0.2s; }
        .order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .btn-primary { background: ${rust}; color: white; border: none; padding: 12px 24px; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 3px; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.88; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-outline { background: none; color: ${ink}; border: 1px solid ${border}; padding: 10px 20px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 3px; transition: all 0.2s; }
        .btn-outline:hover { border-color: ${ink}; }
        .input { width: 100%; padding: 10px 12px; border: 1px solid ${border}; border-radius: 3px; font-size: 14px; background: ${cream}; color: ${ink}; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: ${rust}; background: white; }
        .label { display: block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: ${muted}; margin-bottom: 6px; }
        .tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse { animation: pulse 1.8s infinite; }
      `}</style>
      <header style={{ borderBottom: "1px solid " + border, position: "sticky", top: 0, zIndex: 100, background: "white" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 900, color: rust }}>deliver</span>
            <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: ink }}>canaan</span>
            <span style={{ fontSize: 10, color: muted, letterSpacing: "0.15em", textTransform: "uppercase", marginLeft: 4 }}>CT</span>
            {IS_DEMO && <span style={{ fontSize: 10, background: "#FFF3CD", color: "#856404", padding: "2px 8px", borderRadius: 10, marginLeft: 8 }}>DEMO MODE</span>}
          </div>
          <nav style={{ display: "flex", gap: 4 }}>
            <button className={"nav-btn" + (page === "dashboard" ? " active" : "")} onClick={() => setPage("dashboard")}>Dashboard</button>
            <button className={"nav-btn" + (page === "portal" ? " active" : "")} onClick={() => setPage("portal")}>Restaurant Portal</button>
            <button className={"nav-btn" + (page === "track" ? " active" : "")} onClick={() => setPage("track")}>Track Order</button>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {page === "dashboard" && <Dashboard />}
        {page === "portal" && <RestaurantPortal />}
        {page === "track" && <TrackingPage />}
      </main>
    </div>
  );
}

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      const data = IS_DEMO ? demoOrders : await sb.getOrders();
      setOrders(data);
    } catch (e) {
      setError("Could not load orders. Check your Supabase connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    if (IS_DEMO) { setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o)); return; }
    try {
      await sb.updateOrder(id, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (newStatus === "active") {
        const order = orders.find(o => o.id === id);
        if (order) await sendSMS(order.customer_phone, "Hi " + order.customer_name + "! Your order from " + order.restaurant_name + " is on the way. Track at: delivercanaan.com/track/" + id);
      }
    } catch (e) { alert("Failed to update order."); }
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const pending = orders.filter(o => o.status === "pending").length;
  const active = orders.filter(o => o.status === "active").length;
  const delivered = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 900 }}>Your Deliveries</h1>
          <p style={{ color: muted, fontSize: 13, marginTop: 4 }}>Canaan & surrounding areas · Litchfield County, CT</p>
        </div>
        <button className="btn-outline" onClick={loadOrders} style={{ fontSize: 11 }}>Refresh</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[{ label: "Pending", value: pending, color: "#FFC107" }, { label: "Active", value: active, color: "#17A2B8" }, { label: "Delivered Today", value: delivered, color: "#28A745" }].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontFamily: serif, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "pending", "active", "delivered"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid " + (filter === f ? ink : border), background: filter === f ? ink : "transparent", color: filter === f ? "white" : muted, borderRadius: 3, cursor: "pointer", transition: "all 0.2s" }}>{f}</button>
        ))}
      </div>
      {loading && <div style={{ textAlign: "center", padding: "48px 0", color: muted, fontSize: 13 }}>Loading orders...</div>}
      {error && <div style={{ padding: 16, background: "#FFF3CD", borderRadius: 4, color: "#856404", fontSize: 13 }}>{error}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!loading && filtered.length === 0 && <div style={{ textAlign: "center", padding: "48px 0", color: muted, fontSize: 13 }}>No orders in this category</div>}
        {filtered.map(order => {
          const sc = statusColors[order.status] || statusColors.pending;
          return (
            <div key={order.id} className="order-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 15 }}>{order.restaurant_name}</span>
                    <span className="tag" style={{ background: sc.bg, color: sc.text }}>
                      <span className={"dot" + (order.status === "active" ? " pulse" : "")} style={{ background: sc.dot }} />
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: ink, marginBottom: 3 }}><strong>{order.customer_name}</strong> · {order.customer_phone}</div>
                  <div style={{ fontSize: 13, color: muted, marginBottom: 3 }}>Drop-off: {order.dropoff_address}</div>
                  {order.order_details && <div style={{ fontSize: 12, color: muted, marginBottom: 3 }}>Order: {order.order_details}</div>}
                  {order.notes && <div style={{ fontSize: 12, color: muted, fontStyle: "italic" }}>"{order.notes}"</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ fontSize: 18, fontFamily: serif, fontWeight: 700, color: rust }}>${Number(order.delivery_fee).toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: muted }}>{timeAgo(order.created_at)}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {order.status === "pending" && (<>
                      <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 11 }} onClick={() => updateStatus(order.id, "active")}>Accept</button>
                      <button className="btn-outline" style={{ padding: "8px 14px", fontSize: 11 }} onClick={() => updateStatus(order.id, "cancelled")}>Decline</button>
                    </>)}
                    {order.status === "active" && <button className="btn-primary" style={{ padding: "8px 16px", fontSize: 11 }} onClick={() => updateStatus(order.id, "delivered")}>Mark Delivered</button>}
                    {(order.status === "delivered" || order.status === "cancelled") && <span style={{ fontSize: 11, color: muted }}>Closed</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RestaurantPortal() {
  const restaurant = sampleRestaurants["joes-pizza"];
  const [form, setForm] = useState({ customerName: "", customerPhone: "", dropoffAddress: "", orderDetails: "", notes: "", deliveryFee: "6.00" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone || !form.dropoffAddress) return;
    setLoading(true);
    try {
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 1200));
        setNewOrderId("ORD-" + Math.floor(Math.random() * 9000 + 1000));
      } else {
        const order = { restaurant_name: restaurant.name, restaurant_address: restaurant.address, customer_name: form.customerName, customer_phone: form.customerPhone, dropoff_address: form.dropoffAddress, order_details: form.orderDetails, notes: form.notes, delivery_fee: parseFloat(form.deliveryFee) || 6.00, status: "pending", created_at: new Date().toISOString() };
        const [created] = await sb.createOrder(order);
        setNewOrderId(created.id);
        await sendSMS("+19296908573", "New delivery from " + restaurant.name + "!\nCustomer: " + form.customerName + " (" + form.customerPhone + ")\nDrop-off: " + form.dropoffAddress + "\nFee: $" + form.deliveryFee);
      }
      setSubmitted(true);
    } catch (e) { alert("Error submitting. Please try again."); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Delivery Requested!</h2>
      <p style={{ color: muted, fontSize: 14, marginBottom: 8 }}>The driver has been notified and will confirm shortly.</p>
      {newOrderId && <p style={{ fontSize: 12, color: muted, marginBottom: 24 }}>Order ID: <strong>{newOrderId}</strong></p>}
      <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ customerName: "", customerPhone: "", dropoffAddress: "", orderDetails: "", notes: "", deliveryFee: "6.00" }); }}>New Request</button>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: rust, marginBottom: 4 }}>Restaurant Portal</p>
        <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 900 }}>{restaurant.name}</h1>
        <p style={{ color: muted, fontSize: 13, marginTop: 4 }}>{restaurant.address}</p>
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div><label className="label">Customer Name *</label><input className="input" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Jane Smith" /></div>
        <div><label className="label">Customer Phone *</label><input className="input" name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="(860) 555-0000" /></div>
        <div><label className="label">Drop-off Address *</label><input className="input" name="dropoffAddress" value={form.dropoffAddress} onChange={handleChange} placeholder="123 Main St, North Canaan, CT" /></div>
        <div><label className="label">Order Details</label><textarea className="input" name="orderDetails" value={form.orderDetails} onChange={handleChange} placeholder="2x Margherita, 1x Caesar salad..." rows={3} style={{ resize: "vertical" }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label className="label">Delivery Fee ($)</label><input className="input" name="deliveryFee" value={form.deliveryFee} onChange={handleChange} type="number" min="0" step="0.50" /></div>
          <div><label className="label">Notes</label><input className="input" name="notes" value={form.notes} onChange={handleChange} placeholder="Leave at door..." /></div>
        </div>
        <div style={{ borderTop: "1px solid " + border, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: muted }}>Pickup from <strong>{restaurant.name}</strong></div>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.customerName || !form.customerPhone || !form.dropoffAddress}>{loading ? "Sending..." : "Request Delivery"}</button>
        </div>
      </div>
    </div>
  );
}

function TrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [tracked, setTracked] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const track = async () => {
    if (!orderId) return;
    setLoading(true); setNotFound(false); setTracked(null);
    try {
      if (IS_DEMO) {
        await new Promise(r => setTimeout(r, 800));
        const found = demoOrders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
        found ? setTracked(found) : setNotFound(true);
      } else {
        const found = await sb.getOrderById(orderId);
        found ? setTracked(found) : setNotFound(true);
      }
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  const steps = ["Order Received", "Driver Accepted", "Picked Up", "On The Way", "Delivered"];
  const stepIndex = !tracked ? 0 : tracked.status === "pending" ? 1 : tracked.status === "active" ? 3 : tracked.status === "delivered" ? 5 : 0;

  return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: rust, marginBottom: 4 }}>Order Tracking</p>
        <h1 style={{ fontFamily: serif, fontSize: 28, fontWeight: 900 }}>Track Your Delivery</h1>
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <label className="label">Order ID</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input" value={orderId} onChange={e => setOrderId(e.target.value)} onKeyDown={e => e.key === "Enter" && track()} placeholder={IS_DEMO ? "Try: ORD-001 or ORD-002" : "Enter your order ID"} />
          <button className="btn-primary" onClick={track} disabled={loading || !orderId} style={{ whiteSpace: "nowrap" }}>{loading ? "..." : "Track"}</button>
        </div>
      </div>
      {tracked && (
        <div className="card fade-in">
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 16 }}>{tracked.restaurant_name}</span>
              <span style={{ fontSize: 13, color: muted }}>{tracked.id}</span>
            </div>
            <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>To: {tracked.dropoff_address}</div>
            <div style={{ fontSize: 13, color: muted }}>For: {tracked.customer_name}</div>
          </div>
          {steps.map((step, i) => {
            const done = i < stepIndex, active = i === stepIndex - 1;
            return (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: done || active ? rust : border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {done && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
                    {active && <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "white", display: "block" }} />}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, height: 28, background: done ? rust : border }} />}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
                  <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: done || active ? ink : muted }}>{step}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {notFound && <div style={{ textAlign: "center", color: muted, fontSize: 13, paddingTop: 16 }}>No order found.{IS_DEMO && " Try ORD-001 or ORD-002."}</div>}
    </div>
  );
}
