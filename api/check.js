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
            // URL GITHUB LU UDAH OTOMATIS MASUK DI SINI
            const githubRawUrl = "https://raw.githubusercontent.com/riza220409/server-kopi/main/api/licenses.json";
            
            const response = await fetch(githubRawUrl);
            if(!response.ok) throw new Error("File licenses.json belum ada di GitHub");
            
            const licenses = await response.json();

            if (licenses[licenseCode]) {
                const expiredDate = new Date(licenses[licenseCode]);
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
