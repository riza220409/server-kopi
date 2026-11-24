// GANTI SEMUA ISINYA JADI SEPERTI INI
const licenses = require('./licenses.json');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }
        
        const licenseCode = body ? body.licenseCode : null;
        
        try {
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
            return res.status(500).json({ status: "error", message: "Error sistem: " + error.message });
        }
    }
    
    return res.status(405).json({ error: "Method not allowed" });
};
