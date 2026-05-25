const DotacionFirmaService = require('../../services/dotacion/dotacionFirma.service');

const getFirmas = async (req, res) => {
    try {
        const firmas = await DotacionFirmaService.getAllSignatures();
        res.json({ success: true, data: firmas });
    } catch (error) {
        console.error('Error in getFirmas:', error);
        res.status(500).json({ success: false, message: 'Error obteniendo datos de firmas', error: error.message });
    }
};

const sendSignature = async (req, res) => {
    try {
        const { id } = req.params;
        const originHost = req.headers.origin || req.headers.referer || 'http://localhost:5173';
        const result = await DotacionFirmaService.sendSignatureRequest(id, originHost);
        res.json(result);
    } catch (error) {
        console.error('Error in sendSignature:', error);
        res.status(500).json({ success: false, message: 'Error enviando firma', error: error.message });
    }
};

const getPublicSignature = async (req, res) => {
    try {
        const { token } = req.params;
        const data = await DotacionFirmaService.getSignatureByToken(token);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error in getPublicSignature:', error);
        res.status(404).json({ success: false, message: error.message });
    }
};

const savePublicSignature = async (req, res) => {
    try {
        const { token } = req.params;
        const { firmaBase64 } = req.body;
        const result = await DotacionFirmaService.saveSignature(token, firmaBase64);
        res.json(result);
    } catch (error) {
        console.error('Error in savePublicSignature:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getFirmas,
    sendSignature,
    getPublicSignature,
    savePublicSignature
};
