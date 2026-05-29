const KEY = "bincycle:booking:draft";

export const loadDraft = () => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const saveDraft = (draft) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(draft));
        return true;
    } catch (e) {
        // Most likely quota exceeded due to a large image dataURL.
        console.warn("Could not persist booking draft:", e?.message);
        return false;
    }
};

export const clearDraft = () => {
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
};

export const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
