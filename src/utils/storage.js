
const storage = {
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error guardando ${key}:`, error);
            return false;
        }
    },

    getItem(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) return defaultValue;

            return JSON.parse(value);
        } catch (error) {
            console.error(`Error leyendo ${key}:`, error);
            return defaultValue;
        }
    },

    removeItem(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    },

    hasItem(key) {
        return localStorage.getItem(key) !== null;
    }
};

export default storage;
