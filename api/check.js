const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // 1. Baca Body (jaga-jaga kalau Vercel ngirimnya dalam bentuk string)
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }
        const licenseCode = body ? body.licenseCode : null;
        
        try {
            // 2. PAKAI __dirname (Biar dia nyari file licenses.json di folder yang sama)
            const jsonPath = path.join(__dirname, 'licenses.json');
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
            return res.status(500).json({ status: "error", message: "Gagal baca database. Pastikan file api/licenses.json ada. Error: " + error.message });
        }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
};
