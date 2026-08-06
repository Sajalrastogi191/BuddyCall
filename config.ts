// ─── Backend URL ─────────────────────────────────────────────────────────────
// Android Emulator   → use 10.0.2.2 (maps to your PC's localhost)
// Physical Device    → replace with your PC's LAN IP, e.g. 192.168.1.10
// Deployed backend   → replace with your public URL
const BASE_URL = 'http://10.22.0.229:5000';

export const API_URL = BASE_URL;
export const WS_BASE = BASE_URL.replace(/^http/, 'ws') + '/ws';

