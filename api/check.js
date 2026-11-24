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
            // TRIK: Decode Base64 jadi Token Asli secara diam-diam
            // Ganti teks di dalam Buffer.from dengan Base64 lu
            const GITHUB_TOKEN = Buffer.from("BASE64_TOKEN_LU_DISINI", "base64").toString("utf8");
            
            const GITHUB_USER = "riza220409";
            const GITHUB_REPO = "server-kopi";

            // Tetap pakai API Github (Anti Cache, Instan)
            const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/api/licenses.json`;
            
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Vercel-Serverless'
                }
            });

            if(!response.ok) {
                throw new Error(`Gagal ambil data GitHub. Status: ${response.status}`);
            }
            
            const fileData = await response.json();
            const content = Buffer.from(fileData.content, 'base64').toString('utf8');
            
            const licenses = JSON.parse(content);
            const data = licenses[licenseCode];

            if (data) {
                let expiredDate = (typeof data === 'string') ? new Date(data) : new Date(data.exp);

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
