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
            const GITHUB_TOKEN = process.env.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;
            const GITHUB_USER = "riza220409";
            const GITHUB_REPO = "server-kopi";

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
            
            // DECODE PAKAI BUFFER NODE.JS (Biar gak crash)
            const content = Buffer.from(fileData.content, 'base64').toString('utf8');
            
            const licenses = JSON.parse(content);
            const data = licenses[licenseCode];

            if (data) {
                let expiredDate;
                if (typeof data === 'string') {
                    expiredDate = new Date(data);
                } else {
                    expiredDate = new Date(data.exp);
                }

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
