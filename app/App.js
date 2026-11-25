import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useContext } from 'react';
import Auth from './src/screens/Auth';
import Main from './src/screens/Main';
import AuthContext, { AuthProvider } from './src/context/AuthContext';

// Colores del mockup
const tema = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#5B4B8A',
        onPrimary: '#FFFFFF',
        secondary: '#E7E0F3',
        background: '#F5F2EC',
        surface: '#FFFFFF',
        onSurface: '#1E1B18',
        error: '#B3261E',
    },
};

function Root() {
    const { auth, listo } = useContext(AuthContext);
    if (!listo) return <ActivityIndicator style={{ flex: 1 }} />;
    return auth ? <Main /> : <Auth />;
}

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={tema}>
                <AuthProvider>
                    <Root />
                    <StatusBar style="dark" />
                </AuthProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}