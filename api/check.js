const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // 1. IZIN CORS (Biar APK Android bisa akses)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Balas request OPTIONS (Wajib buat Android WebView)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Logika Utama
    if (req.method === 'POST') {
        const { licenseCode } = req.body;
        
        try {
            // Baca file licenses.json
            const jsonPath = path.join(process.cwd(), 'api', 'licenses.json');
            const fileData = fs.readFileSync(jsonPath, 'utf8');
            const licenses = JSON.parse(fileData);

            if (licenses[licenseCode]) {
                const expiredDate = new Date(licenses[licenseCode]);
                const now = new Date();

                if (now > expiredDate) {
                    return res.status(403).json({ status: "expired", message: "Lisensi sudah expired." });
                } else {
                    return res.status(200).json({ status: "success", expired_at: expiredDate.toISOString() });
                }
            } else {
                return res.status(404).json({ status: "error", message: "Kode tidak ditemukan." });
            }
        } catch (error) {
            return res.status(500).json({ status: "error", message: "Server error: Gagal baca database." });
        }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
};
