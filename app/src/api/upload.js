import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import { API_URL } from './client';

const SERVIDOR = API_URL.replace(/\/api$/, '');

// Pregunta si se quiere quitar el fondo. Regresa true o false.
function preguntarSinFondo() {
    return new Promise((resolve) => {
        Alert.alert(
            'Quitar fondo',
            '¿Quieres quitarle el fondo a la foto?',
            [
                { text: 'No', style: 'cancel', onPress: () => resolve(false) },
                { text: 'Sí', onPress: () => resolve(true) },
            ],
            { cancelable: false }
        );
    });
}

// Manda la foto al servicio rembg del servidor y guarda el PNG sin fondo en la caché. Regresa su uri local.
async function quitarFondo(uri) {
    const form = new FormData();
    form.append('archivo', new File(uri));

    const response = await fetch(`${SERVIDOR}/rembg/remove`, { method: 'POST', body: form });
    if (!response.ok) throw new Error(`No se pudo quitar el fondo (${response.status})`);

    const salida = new File(Paths.cache, `sinfondo-${Date.now()}.png`);
    salida.create();
    salida.write(new Uint8Array(await response.arrayBuffer()));
    return salida.uri;
}

// Abre la galería o la cámara, opcionalmente quita el fondo, sube la foto a Strapi y regresa su URL pública.
// Regresa null si el usuario cancela.
export async function elegirYSubirFoto(token, desde) {
    const esCamara = desde === 'camara';

    const permiso = esCamara
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
        throw new Error(esCamara ? 'Necesito permiso para usar la cámara' : 'Necesito permiso para ver tu galería');
    }

    const opciones = { mediaTypes: ['images'], quality: 0.7, allowsEditing: false };
    const resultado = esCamara
        ? await ImagePicker.launchCameraAsync(opciones)
        : await ImagePicker.launchImageLibraryAsync(opciones);
    if (resultado.canceled) return null;

    let uri = resultado.assets[0].uri;
    if (await preguntarSinFondo()) uri = await quitarFondo(uri);

    // File de Expo se comporta como un archivo real dentro del formulario
    const form = new FormData();
    form.append('files', new File(uri));

    // No ponemos Content-Type: fetch lo arma solo para el formulario
    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
        },
        body: form,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`No se pudo subir la foto (${response.status}): ${data?.error?.message || ''}`);

    // Strapi regresa una ruta relativa (/uploads/...); le ponemos el servidor delante
    return `${SERVIDOR}${data[0].url}`;
}
