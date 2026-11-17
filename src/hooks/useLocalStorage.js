
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue = null) => {

    const [value, setValue] = useState(() => {
        try {
            const stored = localStorage.getItem(key);

            return stored !== null
                ? JSON.parse(stored)
                : initialValue;

        } catch (error) {
            console.error('Error leyendo localStorage:', error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            if (value === null || value === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Error actualizando localStorage:', error);
        }
    }, [key, value]);

    const remove = () => {
        localStorage.removeItem(key);
        setValue(initialValue);
    };

    return [value, setValue, remove];
};
