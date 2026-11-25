module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        let body = req.body;
        if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) {} }
        const licenseCode = body ? body.licenseCode : null;

        try {
            // URL FIREBASE LU
            const FIREBASE_URL = "https://server-kopi-default-rtdb.asia-southeast1.firebasedatabase.app/licenses.json";
            
            const response = await fetch(FIREBASE_URL);
            
            if (response.status === 404) {
                 return res.status(404).json({ status: "error", message: "Belum ada lisensi di database." });
            }
            if (!response.ok) throw new Error("Gagal konek ke Firebase.");

            const licenses = await response.json();
            const data = licenses ? licenses[licenseCode] : null;

            if (data) {
                let expiredDate = new Date(data.exp);

                if (new Date() > expiredDate) {
                    return res.status(403).json({ status: "expired", message: "Lisensi sudah expired." });
                }
                return res.status(200).json({ status: "success", expired_at: expiredDate.toISOString() });
            } else {
                return res.status(404).json({ status: "error", message: "Kode tidak ditemukan." });
            }
        } catch (error) {
            return res.status(500).json({ status: "error", message: error.message });
        }
    }
    return res.status(405).json({ error: "Method not allowed" });
};
