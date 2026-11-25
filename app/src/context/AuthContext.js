import { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { me } from '../api/user';

const AuthContext = createContext({
    auth: undefined,
    listo: false,
    login: async () => {},
    logout: async () => {},
});

export function AuthProvider({ children }) {
    const [auth, setAuth] = useState(undefined);
    const [listo, setListo] = useState(false);

    // Al abrir la app: recupera la sesión guardada
    useEffect(() => {
        (async () => {
            try {
                const guardado = await AsyncStorage.getItem('sesion');
                if (guardado) {
                    const sesion = JSON.parse(guardado);
                    try {
                        const user = await me(sesion.jwt);
                        setAuth({ jwt: sesion.jwt, user });
                    } catch (error) {
                        if (error.status === 401) {
                            await AsyncStorage.removeItem('sesion');
                        } else {
                            // Sin internet: entra con lo que estaba guardado
                            setAuth(sesion);
                        }
                    }
                }
            } catch (error) {
                // si algo falla, se muestra el login
            } finally {
                setListo(true);
            }
        })();
    }, []);

    const login = async (data) => {
        let user = data.user;
        try {
            user = await me(data.jwt);
        } catch (error) {
            // si falla, usamos los datos del login
        }
        const sesion = { jwt: data.jwt, user };
        setAuth(sesion);
        await AsyncStorage.setItem('sesion', JSON.stringify(sesion));
    };

    const logout = async () => {
        setAuth(undefined);
        await AsyncStorage.removeItem('sesion');
    };

    return (
        <AuthContext.Provider value={{ auth, listo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
