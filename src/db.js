/* ===== RESET & BASE ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0a0e1a;
  --bg2: #0f1629;
  --bg3: #162040;
  --card: rgba(255,255,255,0.04);
  --card-border: rgba(255,255,255,0.08);
  --cyan: #22d3ee;
  --cyan-dim: rgba(34,211,238,0.12);
  --green: #34d399;
  --green-dim: rgba(52,211,153,0.12);
  --amber: #fbbf24;
  --amber-dim: rgba(251,191,36,0.12);
  --red: #f87171;
  --red-dim: rgba(248,113,113,0.12);
  --purple: #a78bfa;
  --purple-dim: rgba(167,139,250,0.12);
  --text: #e2e8f0;
  --text2: #94a3b8;
  --text3: #64748b;
  --radius: 14px;
  --radius-sm: 8px;
  --radius-lg: 20px;
  --nav-h: 68px;
  --header-h: 60px;
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
}

html { font-size: 16px; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
a { text-decoration: none; color: inherit; }
button { cursor: pointer; font-family: inherit; border: none; background: none; }
input, select, textarea {
  font-family: inherit;
  font-size: 1rem;
  outline: none;
}
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="month"]::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.5);
  cursor: pointer;
}

/* ===== APP SHELL ===== */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  background: var(--bg);
}

/* ===== TOP HEADER ===== */
.top-header {
  position: fixed;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: var(--header-h);
  background: rgba(10,14,26,0.92);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.header-logo { font-size: 26px; }
.header-title { font-size: 15px; font-weight: 700; color: var(--text); }
.header-subtitle { font-size: 11px; color: var(--text3); }
.header-right { display: flex; align-items: center; gap: 8px; }
.header-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 2px solid var(--cyan);
}
.header-avatar-placeholder {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--cyan-dim);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan);
}
.header-logout {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--card);
  border: 1px solid var(--card-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text2);
  transition: all 0.2s;
}
.header-logout:hover { color: var(--red); border-color: var(--red); }

/* ===== MAIN CONTENT ===== */
.main-content {
  margin-top: var(--header-h);
  margin-bottom: var(--nav-h);
  flex: 1;
}
.page-content {
  padding: 16px;
  min-height: calc(100vh - var(--header-h) - var(--nav-h));
}
.page-header { margin-bottom: 18px; }
.page-title { font-size: 22px; font-weight: 800; color: var(--text); }
.page-subtitle { font-size: 13px; color: var(--text3); margin-top: 2px; }
.section-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 18px 0 10px;
}

/* ===== BOTTOM NAV ===== */
.bottom-nav {
  position: fixed;
  bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: var(--nav-h);
  background: rgba(10,14,26,0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  z-index: 100;
  padding: 0 4px;
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 2px;
  color: var(--text3);
  font-size: 10px;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  position: relative;
}
.bottom-nav-item.active { color: var(--cyan); }
.bottom-nav-item.active svg {
  filter: drop-shadow(0 0 6px rgba(34,211,238,0.5));
}

/* ===== SPLASH / LOADER ===== */
.splash-screen {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.splash-icon { font-size: 56px; animation: pulse 1.5s ease-in-out infinite; }
.splash-title { font-size: 18px; font-weight: 600; color: var(--text2); }
.splash-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--card-border);
  border-top-color: var(--cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

/* ===== SPINNER INLINE ===== */
.spinner {
  display: inline-block;
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}
.btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-primary {
  background: linear-gradient(135deg, var(--cyan), #0891b2);
  color: #fff;
  box-shadow: 0 4px 16px rgba(34,211,238,0.25);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,211,238,0.35); }
.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-danger {
  background: linear-gradient(135deg, var(--red), #dc2626);
  color: #fff;
  box-shadow: 0 4px 16px rgba(248,113,113,0.25);
}
.btn-accent {
  background: linear-gradient(135deg, var(--purple), #7c3aed);
  color: #fff;
  box-shadow: 0 4px 16px rgba(167,139,250,0.25);
}
.btn-ghost {
  background: var(--card);
  border: 1px solid var(--card-border);
  color: var(--text2);
}
.btn-ghost:hover { border-color: var(--cyan); color: var(--cyan); }
.btn-income {
  background: linear-gradient(135deg, #059669, #047857);
  color: #fff;
  box-shadow: 0 4px 16px rgba(52,211,153,0.2);
}
.btn-expense {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  box-shadow: 0 4px 16px rgba(248,113,113,0.2);
}
.btn-large { padding: 16px 24px; font-size: 16px; min-height: 56px; }
.btn-medium { padding: 13px 16px; font-size: 14px; min-height: 48px; }
.btn-sm { padding: 8px 12px; font-size: 12px; min-height: 36px; }
.btn-icon-sm {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--card);
  border: 1px solid var(--card-border);
  color: var(--text3);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon-sm:hover { color: var(--text); border-color: var(--cyan); }
.btn-icon-sm.danger:hover { color: var(--red); border-color: var(--red); }
.w-full { width: 100%; }
.flex-1 { flex: 1; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }

/* LOGIN */
.login-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; background:var(--bg); position:relative; overflow:hidden; }
.login-bg-effects { position:fixed; inset:0; pointer-events:none; }
.login-orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.15; }
.login-orb-1 { width:300px; height:300px; background:var(--cyan); top:-100px; right:-80px; }
.login-orb-2 { width:250px; height:250px; background:var(--purple); bottom:-80px; left:-80px; }
.login-orb-3 { width:200px; height:200px; background:var(--green); top:50%; left:50%; transform:translate(-50%,-50%); }
.login-card { position:relative; width:100%; max-width:380px; background:rgba(15,22,41,0.85); backdrop-filter:blur(24px); border:1px solid var(--card-border); border-radius:var(--radius-lg); padding:32px 24px; text-align:center; }
.login-icon-wrap { display:flex; justify-content:center; margin-bottom:16px; }
.login-icon { width:72px; height:72px; border-radius:50%; background:var(--cyan-dim); border:2px solid var(--cyan); display:flex; align-items:center; justify-content:center; color:var(--cyan); box-shadow:0 0 24px rgba(34,211,238,0.25); }
.login-title { font-size:22px; font-weight:800; color:var(--text); margin-bottom:6px; }
.login-subtitle { font-size:13px; color:var(--text2); margin-bottom:12px; }
.login-badge { display:inline-block; font-size:11px; padding:4px 12px; border-radius:20px; background:var(--cyan-dim); color:var(--cyan); border:1px solid rgba(34,211,238,0.2); }
.login-divider { height:1px; background:var(--card-border); margin:20px 0; }
.login-or { text-align:center; margin:16px 0; color:var(--text3); font-size:12px; }
.login-info-box { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius-sm); padding:12px 14px; font-size:12px; color:var(--text2); line-height:1.6; text-align:left; }
.login-info-box ol { padding-left:16px; margin-top:6px; }
.login-info-box code { background:rgba(255,255,255,0.08); padding:1px 5px; border-radius:4px; color:var(--cyan); }
.login-error { margin-top:12px; padding:10px 14px; background:var(--red-dim); border:1px solid rgba(248,113,113,0.3); border-radius:var(--radius-sm); color:var(--red); font-size:13px; }
.login-footer { margin-top:16px; font-size:11px; color:var(--text3); line-height:1.6; }

/* STOCK CARDS */
.stock-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.stock-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:14px; display:flex; gap:10px; align-items:flex-start; transition:all 0.2s; cursor:default; }
.stock-card:hover { transform:translateY(-1px); border-color:rgba(255,255,255,0.15); }
.stock-card.warning { border-color:rgba(251,191,36,0.35); background:rgba(251,191,36,0.05); }
.stock-card.danger { border-color:rgba(248,113,113,0.35); background:rgba(248,113,113,0.05); animation:pulseB 1.5s ease-in-out infinite; }
@keyframes pulseB { 0%,100%{border-color:rgba(248,113,113,0.35)} 50%{border-color:rgba(248,113,113,0.7)} }
.stock-card-icon { width:38px; height:38px; border-radius:10px; background:var(--cyan-dim); display:flex; align-items:center; justify-content:center; color:var(--cyan); flex-shrink:0; }
.stock-card-icon.egg { background:var(--amber-dim); color:var(--amber); }
.stock-card-icon.sack { background:var(--purple-dim); color:var(--purple); }
.stock-card-icon.bird { background:var(--green-dim); color:var(--green); }
.stock-card-label { font-size:11px; color:var(--text3); margin-bottom:4px; }
.stock-card-value { font-size:20px; font-weight:800; color:var(--text); line-height:1; }
.stock-card-value.warning { color:var(--amber); }
.stock-card-value.danger { color:var(--red); }
.stock-unit { font-size:11px; font-weight:500; color:var(--text3); }
.stock-alarm { display:flex; align-items:center; gap:4px; font-size:10px; font-weight:600; margin-top:4px; }
.stock-alarm.warning { color:var(--amber); }
.stock-alarm.danger { color:var(--red); }

/* HPP BANNER */
.hpp-banner { display:flex; align-items:center; gap:12px; background:var(--card); border:1px solid rgba(167,139,250,0.25); border-radius:var(--radius); padding:12px 14px; margin:12px 0; cursor:pointer; transition:all 0.2s; }
.hpp-banner:hover { border-color:var(--purple); }
.hpp-icon { width:36px; height:36px; border-radius:10px; background:var(--purple-dim); display:flex; align-items:center; justify-content:center; color:var(--purple); flex-shrink:0; }
.hpp-info { flex:1; }
.hpp-label { font-size:11px; color:var(--text3); }
.hpp-value { font-size:16px; font-weight:700; color:var(--purple); }
.hpp-unit { font-size:11px; color:var(--text3); }
.hpp-chevron { color:var(--text3); }

/* CHART */
.chart-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:14px; }
.chart-wrapper { height:160px; }

/* FINANCE SUMMARY */
.finance-summary-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:14px; }
.finance-row { display:flex; gap:12px; align-items:center; }
.finance-item { display:flex; gap:10px; align-items:center; flex:1; }
.finance-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
.finance-item.income .finance-icon { background:var(--green-dim); color:var(--green); }
.finance-item.expense .finance-icon { background:var(--red-dim); color:var(--red); }
.finance-divider { width:1px; height:40px; background:var(--card-border); }
.finance-label { font-size:11px; color:var(--text3); }
.finance-amount { font-size:15px; font-weight:700; }
.finance-amount.income { color:var(--green); }
.finance-amount.expense { color:var(--red); }
.finance-net { display:flex; align-items:center; gap:6px; margin-top:10px; padding-top:10px; border-top:1px solid var(--card-border); font-size:13px; color:var(--text2); }
.finance-net-value.positive { color:var(--green); font-weight:700; }
.finance-net-value.negative { color:var(--red); font-weight:700; }

/* QUICK ACTIONS */
.quick-actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.quick-action-btn { display:flex; align-items:center; justify-content:center; gap:8px; padding:14px 8px; border-radius:var(--radius); font-weight:600; font-size:12px; transition:all 0.2s; border:1px solid var(--card-border); background:var(--card); color:var(--text); }
.quick-action-btn.primary { background:linear-gradient(135deg,var(--cyan),#0891b2); border-color:transparent; color:#fff; box-shadow:0 4px 16px rgba(34,211,238,0.25); }
.quick-action-btn:hover { transform:translateY(-1px); }

/* FORMS */
.form-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:16px; margin-bottom:12px; }
.form-card.no-shadow { background:transparent; border:none; padding:0; margin-bottom:0; }
.form-card-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.form-card-icon { color:var(--text3); }
.form-card-icon.egg-color { color:var(--amber); }
.form-card-icon.feed-color { color:var(--green); }
.form-card-title { font-size:15px; font-weight:700; color:var(--text); }
.form-label { font-size:12px; font-weight:600; color:var(--text2); margin-bottom:6px; display:block; }
.form-label-row { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
.form-label-row .form-label { margin-bottom:0; }
.form-input { width:100%; background:rgba(255,255,255,0.06); border:1px solid var(--card-border); border-radius:var(--radius-sm); padding:11px 14px; color:var(--text); font-size:15px; transition:border-color 0.2s; margin-bottom:12px; }
.form-input:focus { border-color:var(--cyan); box-shadow:0 0 0 3px rgba(34,211,238,0.1); }
.form-input option { background:var(--bg2); }
.form-textarea { width:100%; background:rgba(255,255,255,0.06); border:1px solid var(--card-border); border-radius:var(--radius-sm); padding:11px 14px; color:var(--text); font-size:14px; resize:vertical; transition:border-color 0.2s; }
.form-textarea:focus { border-color:var(--cyan); }
.form-hint { font-size:11px; color:var(--text3); margin-bottom:8px; line-height:1.5; }
.form-row { display:flex; gap:10px; }
.form-col { flex:1; }
.input-big-wrapper { position:relative; display:flex; align-items:center; margin-bottom:4px; }
.input-big { flex:1; background:rgba(255,255,255,0.06); border:1px solid var(--card-border); border-radius:var(--radius-sm); padding:16px 60px 16px 16px; color:var(--text); font-size:28px; font-weight:700; transition:border-color 0.2s; -moz-appearance:textfield; }
.input-big::-webkit-outer-spin-button,.input-big::-webkit-inner-spin-button { -webkit-appearance:none; }
.input-big:focus { border-color:var(--cyan); box-shadow:0 0 0 3px rgba(34,211,238,0.1); }
.input-big-unit { position:absolute; right:14px; font-size:13px; color:var(--text3); font-weight:600; }
.unit-picker-btn { display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.06); border:1px solid var(--card-border); border-radius:var(--radius-sm); padding:11px 14px; color:var(--text); font-size:14px; font-weight:600; cursor:pointer; margin-bottom:8px; transition:border-color 0.2s; }
.unit-picker-btn:hover { border-color:var(--cyan); }
.rotate-180 { transform:rotate(180deg); }
.unit-picker-dropdown { background:var(--bg2); border:1px solid var(--card-border); border-radius:var(--radius-sm); overflow:hidden; margin-bottom:8px; }
.unit-option { padding:12px 14px; cursor:pointer; transition:background 0.15s; border-bottom:1px solid var(--card-border); }
.unit-option:last-child { border-bottom:none; }
.unit-option:hover { background:rgba(255,255,255,0.05); }
.unit-option.selected { background:var(--cyan-dim); }
.unit-option-label { font-size:14px; font-weight:600; color:var(--text); }
.unit-option-desc { font-size:11px; color:var(--text3); margin-top:2px; }
.save-btn { margin-top:8px; }

/* INFO BOX */
.info-box { display:flex; align-items:flex-start; gap:8px; background:var(--cyan-dim); border:1px solid rgba(34,211,238,0.2); border-radius:var(--radius-sm); padding:10px 12px; font-size:12px; color:var(--text2); margin-top:4px; }
.info-box code { color:var(--cyan); background:rgba(34,211,238,0.1); padding:1px 4px; border-radius:3px; }

/* MODAL */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn 0.2s; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal-container { width:100%; max-width:480px; background:var(--bg2); border:1px solid var(--card-border); border-radius:var(--radius-lg) var(--radius-lg) 0 0; padding:0 0 env(safe-area-inset-bottom,0); animation:slideUp 0.25s ease-out; max-height:90vh; overflow-y:auto; }
@keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:1px solid var(--card-border); }
.modal-title { font-size:16px; font-weight:700; color:var(--text); }
.modal-close { width:32px; height:32px; border-radius:50%; background:var(--card); border:1px solid var(--card-border); display:flex; align-items:center; justify-content:center; color:var(--text2); cursor:pointer; transition:all 0.2s; }
.modal-close:hover { color:var(--red); border-color:var(--red); }
.modal-body { padding:16px 18px; }
.modal-footer { padding:12px 18px 20px; border-top:1px solid var(--card-border); }
.modal-footer-row { display:flex; gap:10px; }
.modal-form { display:flex; flex-direction:column; gap:4px; }
.modal-calc { background:var(--cyan-dim); border:1px solid rgba(34,211,238,0.2); border-radius:var(--radius-sm); padding:10px 14px; font-size:13px; color:var(--text2); margin-top:4px; }
.modal-calc.success { background:var(--green-dim); border-color:rgba(52,211,153,0.2); }
.modal-info-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--card-border); font-size:13px; color:var(--text2); }

/* TOAST */
.toast-container { position:fixed; top:70px; left:50%; transform:translateX(-50%); width:calc(100% - 32px); max-width:448px; z-index:300; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
.toast { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:var(--radius); backdrop-filter:blur(12px); border:1px solid; pointer-events:all; animation:slideIn 0.3s ease-out; box-shadow:0 4px 20px rgba(0,0,0,0.4); }
@keyframes slideIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
.toast-success { background:rgba(52,211,153,0.15); border-color:rgba(52,211,153,0.35); color:var(--green); }
.toast-error { background:rgba(248,113,113,0.15); border-color:rgba(248,113,113,0.35); color:var(--red); }
.toast-warning { background:rgba(251,191,36,0.15); border-color:rgba(251,191,36,0.35); color:var(--amber); }
.toast-info { background:rgba(34,211,238,0.15); border-color:rgba(34,211,238,0.35); color:var(--cyan); }
.toast-icon { flex-shrink:0; }
.toast-message { flex:1; font-size:13px; font-weight:500; color:var(--text); }
.toast-close { width:20px; height:20px; display:flex; align-items:center; justify-content:center; color:var(--text3); cursor:pointer; background:none; border:none; flex-shrink:0; }

/* STOCK DETAIL PAGE */
.stock-detail-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:16px; margin-bottom:12px; transition:all 0.2s; }
.stock-detail-card.warning { border-color:rgba(251,191,36,0.3); }
.stock-detail-card.danger { border-color:rgba(248,113,113,0.3); }
.stock-detail-header { display:flex; align-items:center; gap:14px; }
.stock-detail-icon-wrap { width:46px; height:46px; border-radius:12px; background:var(--cyan-dim); display:flex; align-items:center; justify-content:center; color:var(--cyan); flex-shrink:0; }
.stock-detail-icon-wrap.sack { background:var(--purple-dim); color:var(--purple); }
.stock-detail-icon-wrap.egg { background:var(--amber-dim); color:var(--amber); }
.stock-detail-icon-wrap.bird { background:var(--green-dim); color:var(--green); }
.stock-detail-info { flex:1; }
.stock-detail-label { font-size:12px; color:var(--text3); margin-bottom:2px; }
.stock-detail-value { font-size:24px; font-weight:800; color:var(--text); line-height:1; }
.stock-detail-value span { font-size:13px; color:var(--text3); font-weight:500; }
.stock-detail-sub { font-size:11px; color:var(--text3); margin-top:2px; }
.stock-detail-value.warning { color:var(--amber); }
.stock-detail-value.danger { color:var(--red); }
.history-section { margin-bottom:14px; }
.history-item { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--card-border); }
.history-item:last-child { border-bottom:none; }
.history-item-title { font-size:14px; font-weight:600; color:var(--text); }
.history-item-date { font-size:12px; color:var(--text3); margin-top:2px; }
.history-amount { font-size:13px; font-weight:600; text-align:right; }
.history-amount.income { color:var(--green); }
.history-total { font-size:11px; color:var(--text3); text-align:right; }

/* ALERT BANNER */
.alert-banner { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:var(--radius-sm); font-size:13px; font-weight:500; margin-bottom:14px; }
.alert-banner.danger { background:var(--red-dim); border:1px solid rgba(248,113,113,0.3); color:var(--red); }
.alert-banner.warning { background:var(--amber-dim); border:1px solid rgba(251,191,36,0.3); color:var(--amber); }

/* FINANCE PAGE */
.month-filter { margin-bottom:14px; }
.finance-cards-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px; }
.finance-mini-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius-sm); padding:10px; display:flex; gap:8px; align-items:center; }
.finance-mini-card.income { border-color:rgba(52,211,153,0.2); }
.finance-mini-card.expense { border-color:rgba(248,113,113,0.2); }
.finance-mini-card.profit { border-color:rgba(34,211,238,0.2); }
.finance-mini-card.loss { border-color:rgba(248,113,113,0.2); }
.finance-mini-label { font-size:10px; color:var(--text3); }
.finance-mini-value { font-size:13px; font-weight:700; }
.finance-mini-value.income { color:var(--green); }
.finance-mini-value.expense { color:var(--red); }
.finance-actions { display:flex; gap:10px; margin-bottom:14px; }
.tab-bar { display:flex; background:rgba(255,255,255,0.04); border-radius:var(--radius-sm); padding:3px; margin-bottom:12px; }
.tab-btn { flex:1; padding:8px; border-radius:6px; font-size:12px; font-weight:600; color:var(--text3); background:none; border:none; cursor:pointer; transition:all 0.2s; }
.tab-btn.active { background:var(--bg3); color:var(--text); box-shadow:0 2px 8px rgba(0,0,0,0.3); }
.transactions-list { display:flex; flex-direction:column; gap:2px; }
.transaction-item { display:flex; align-items:center; gap:10px; padding:12px; background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius-sm); }
.transaction-item.income { border-left:3px solid var(--green); }
.transaction-item.expense { border-left:3px solid var(--red); }
.transaction-cat-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.transaction-info { flex:1; min-width:0; }
.transaction-desc { font-size:13px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.transaction-meta { font-size:11px; color:var(--text3); margin-top:1px; }
.transaction-category { font-size:10px; color:var(--text3); margin-top:2px; }
.transaction-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.transaction-amount { font-size:13px; font-weight:700; }
.transaction-amount.income { color:var(--green); }
.transaction-amount.expense { color:var(--red); }

/* HPP DETAIL */
.hpp-detail { display:flex; flex-direction:column; gap:6px; }
.hpp-detail-row { display:flex; justify-content:space-between; font-size:13px; color:var(--text2); padding:8px 0; border-bottom:1px solid var(--card-border); }
.hpp-divider { height:1px; background:var(--card-border); margin:8px 0; }
.hpp-result { text-align:center; padding:16px; }
.hpp-result-label { font-size:13px; color:var(--text2); margin-bottom:6px; }
.hpp-result-value { font-size:32px; font-weight:800; color:var(--purple); }
.hpp-advice { background:var(--amber-dim); border:1px solid rgba(251,191,36,0.25); border-radius:var(--radius-sm); padding:12px; font-size:12px; color:var(--amber); line-height:1.5; margin-top:8px; }
.hpp-banner.clickable { cursor:pointer; }

/* EMPTY STATE */
.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 16px; color:var(--text3); text-align:center; gap:10px; }
.empty-state span { font-size:40px; }
.empty-state p { font-size:14px; }
.empty-sub { font-size:12px; color:var(--text3); }

/* EQUIPMENT */
.equipment-group { margin-bottom:16px; }
.equipment-group-label { font-size:11px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:8px; padding:0 4px; }
.equipment-item { display:flex; align-items:center; gap:10px; background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius-sm); padding:12px; margin-bottom:6px; }
.equipment-item.critical { border-color:rgba(248,113,113,0.35); background:rgba(248,113,113,0.04); }
.equipment-status-dot { flex-shrink:0; }
.text-red { color:var(--red); }
.text-green { color:var(--green); }
.equipment-info { flex:1; min-width:0; }
.equipment-name { font-size:14px; font-weight:600; color:var(--text); }
.equipment-stats { display:flex; gap:10px; flex-wrap:wrap; margin-top:4px; font-size:11px; color:var(--text3); }
.spare-count.critical { color:var(--red); display:flex; align-items:center; gap:3px; }
.equipment-notes { font-size:11px; color:var(--text3); margin-top:3px; }
.equipment-actions { display:flex; gap:6px; flex-shrink:0; }

/* REPORTS */
.report-type-cards { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
.report-type-card { background:var(--card); border:2px solid var(--card-border); border-radius:var(--radius); padding:18px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; gap:8px; }
.report-type-card.selected { border-color:var(--cyan); background:var(--cyan-dim); }
.report-type-card svg { color:var(--text3); }
.report-type-card.selected svg { color:var(--cyan); }
.report-type-title { font-size:15px; font-weight:700; color:var(--text); }
.report-type-desc { font-size:12px; color:var(--text3); }
.report-type-sheets { display:flex; gap:6px; flex-wrap:wrap; }
.sheet-badge { font-size:11px; padding:3px 8px; border-radius:20px; background:rgba(255,255,255,0.08); color:var(--text2); }
.export-info-card { display:flex; gap:12px; background:rgba(34,211,238,0.06); border:1px solid rgba(34,211,238,0.15); border-radius:var(--radius); padding:14px; margin-bottom:16px; color:var(--text2); }
.export-info-title { font-size:13px; font-weight:600; color:var(--text); margin-bottom:6px; }
.export-info-item { font-size:12px; line-height:1.6; }
.tips-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:14px; margin-top:14px; }
.tips-title { font-size:13px; font-weight:700; color:var(--text); margin-bottom:8px; }
.tips-list { padding-left:18px; color:var(--text3); font-size:12px; line-height:1.8; }

/* SETTINGS */
.settings-section { margin-bottom:20px; }
.settings-section-title { font-size:12px; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:10px; }
.settings-links { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); overflow:hidden; }
.settings-link-item { display:flex; align-items:center; justify-content:space-between; width:100%; padding:14px 16px; font-size:14px; color:var(--text); border-bottom:1px solid var(--card-border); transition:background 0.15s; }
.settings-link-item:last-child { border-bottom:none; }
.settings-link-item:hover { background:rgba(255,255,255,0.04); }
.coming-soon-card { display:flex; align-items:center; gap:14px; background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:16px; opacity:0.6; }
.coming-soon-icon { font-size:28px; }
.coming-soon-title { font-size:14px; font-weight:600; color:var(--text); }
.coming-soon-desc { font-size:12px; color:var(--text3); margin-top:2px; }
.danger-zone { background:rgba(248,113,113,0.05); border:1px solid rgba(248,113,113,0.2); border-radius:var(--radius); padding:16px; margin-top:8px; }
.danger-zone-title { font-size:13px; font-weight:700; color:var(--red); margin-bottom:4px; }
.danger-zone-desc { font-size:12px; color:var(--text3); margin-bottom:12px; }

/* MORE PAGE */
.more-menu-list { display:flex; flex-direction:column; gap:8px; margin-bottom:24px; }
.more-menu-item { display:flex; align-items:center; gap:14px; background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:16px; transition:all 0.2s; }
.more-menu-item:hover { border-color:rgba(255,255,255,0.15); transform:translateY(-1px); }
.more-menu-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.more-menu-info { flex:1; }
.more-menu-label { font-size:15px; font-weight:600; color:var(--text); }
.more-menu-desc { font-size:12px; color:var(--text3); margin-top:2px; }
.more-menu-chevron { color:var(--text3); }
.app-info-card { background:var(--card); border:1px solid var(--card-border); border-radius:var(--radius); padding:20px; text-align:center; }
.app-info-title { font-size:16px; font-weight:700; color:var(--text); }
.app-info-version { font-size:12px; color:var(--text3); margin:4px 0 10px; }
.app-info-desc { font-size:12px; color:var(--text2); line-height:1.6; margin-bottom:12px; }
.app-info-badge { display:inline-block; font-size:11px; padding:4px 12px; border-radius:20px; background:var(--green-dim); color:var(--green); border:1px solid rgba(52,211,153,0.2); }

/* ===== FILTER TABS (HistoryPage) ===== */
.filter-tabs { display:flex; gap:6px; flex-wrap:wrap; margin-top:4px; }
.filter-tabs button { padding:6px 12px; border-radius:20px; font-size:12px; font-weight:500; background:var(--card); border:1px solid var(--card-border); color:var(--text2); cursor:pointer; transition:all 0.2s; }
.filter-tabs button.active { background:var(--cyan-dim); color:var(--cyan); border-color:rgba(34,211,238,0.3); }
.mb-4 { margin-bottom:16px; }

/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */
.sidebar { display: none; }

.sidebar-header { display:flex; align-items:center; gap:12px; padding:24px 20px 20px; border-bottom:1px solid var(--card-border); }
.sidebar-logo { font-size:30px; flex-shrink:0; }
.sidebar-farm-name { font-size:14px; font-weight:700; color:var(--text); line-height:1.2; }
.sidebar-farm-sub { font-size:11px; color:var(--text3); margin-top:2px; }

.sidebar-nav { flex:1; padding:16px 12px; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
.sidebar-nav-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:var(--radius-sm); color:var(--text2); font-size:14px; font-weight:500; transition:all 0.18s; text-decoration:none; }
.sidebar-nav-item:hover { background:var(--card); color:var(--text); }
.sidebar-nav-item.active { background:var(--cyan-dim); color:var(--cyan); font-weight:600; }
.sidebar-nav-item.active svg { filter:drop-shadow(0 0 4px rgba(34,211,238,0.4)); }

.sidebar-footer { padding:16px; border-top:1px solid var(--card-border); display:flex; align-items:center; gap:10px; }
.sidebar-avatar { width:36px; height:36px; border-radius:50%; border:2px solid var(--cyan); flex-shrink:0; object-fit:cover; }
.sidebar-avatar-sm { width:36px; height:36px; border-radius:50%; background:var(--cyan-dim); border:2px solid var(--cyan); display:flex; align-items:center; justify-content:center; color:var(--cyan); flex-shrink:0; }
.sidebar-user-info { flex:1; min-width:0; }
.sidebar-user-name { font-size:13px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sidebar-user-email { font-size:11px; color:var(--text3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sidebar-logout-btn { width:32px; height:32px; border-radius:50%; background:var(--card); border:1px solid var(--card-border); display:flex; align-items:center; justify-content:center; color:var(--text2); transition:all 0.2s; flex-shrink:0; cursor:pointer; }
.sidebar-logout-btn:hover { color:var(--red); border-color:var(--red); }

/* ===== RESPONSIVE: TABLET + LAPTOP (≥768px) ===== */
@media (min-width: 768px) {
  :root { --sidebar-w: 240px; }

  /* App Shell — row layout */
  .app-shell { flex-direction:row; max-width:100vw; width:100%; }

  /* Show sidebar */
  .sidebar {
    display:flex; flex-direction:column;
    position:fixed; left:0; top:0;
    width:var(--sidebar-w); height:100vh;
    background:var(--bg2); border-right:1px solid var(--card-border);
    z-index:200; overflow:hidden;
  }

  /* Hide mobile elements */
  .top-header { display:none; }
  .bottom-nav { display:none; }

  /* Main content — shift right of sidebar */
  .main-content {
    margin-left:var(--sidebar-w);
    margin-top:0; margin-bottom:0;
    width:calc(100% - var(--sidebar-w));
    min-height:100vh;
  }

  /* Page content — comfortable desktop padding with max-width */
  .page-content {
    padding:32px 40px;
    max-width:1000px;
    min-height:100vh;
  }

  /* Page title bigger on desktop */
  .page-title { font-size:28px; }

  /* Stock grid — 4 cols on desktop */
  .stock-grid { grid-template-columns:repeat(4, 1fr); gap:12px; }

  /* Quick actions — 4 cols on desktop */
  .quick-actions { grid-template-columns:repeat(4, 1fr); gap:10px; }
  .quick-action-btn { padding:18px 12px; font-size:13px; }

  /* Finance cards row */
  .finance-cards-row { gap:12px; }

  /* Report cards — horizontal on desktop */
  .report-type-cards { flex-direction:row; }
  .report-type-card { flex:1; }

  /* Modal — centered dialog on desktop */
  .modal-overlay { align-items:center; justify-content:center; }
  .modal-container {
    border-radius:var(--radius-lg);
    max-width:540px; max-height:88vh;
    width:100%;
  }

  /* Toast — top-right corner on desktop */
  .toast-container {
    left:auto; right:24px;
    transform:none;
    top:24px; max-width:360px; width:auto;
  }

  /* Forms — wider spacing */
  .form-row { gap:16px; }
  .input-big { font-size:32px; }

  /* Equipment grid */
  .equipment-group { display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; }
  .equipment-group-label { grid-column:1/-1; }

  /* More menu grid */
  .more-menu-list { display:grid; grid-template-columns:repeat(2, 1fr); }

  /* Settings */
  .settings-section { max-width:600px; }
}

/* ===== RESPONSIVE: LARGE DESKTOP (≥1280px) ===== */
@media (min-width: 1280px) {
  :root { --sidebar-w: 260px; }

  .page-content { max-width:1100px; padding:36px 48px; }

  .stock-grid { grid-template-columns:repeat(4, 1fr); gap:16px; }
  .quick-actions { grid-template-columns:repeat(4, 1fr); gap:12px; }

  /* Finance — show as a wider card */
  .finance-cards-row { grid-template-columns:repeat(3, 1fr); gap:16px; }

  /* More menu — 3 cols */
  .more-menu-list { grid-template-columns:repeat(3, 1fr); }

  /* Equipment — 3 cols */
  .equipment-group { grid-template-columns:repeat(3, 1fr); }
}

