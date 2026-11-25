export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Hace una petición a Strapi. Si hay token, lo manda para saber quién eres.
export async function request(path, token, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) {
        const error = new Error(data?.error?.message || 'Error en el servidor');
        error.status = response.status;
        throw error;
    }
    return data;
}

// Operaciones CRUD para una colección de Strapi
export function crudApi(ruta) {
    return {
        listar: async (token, query = '') => (await request(`${ruta}${query}`, token)).data,
        crear: (token, datos) =>
            request(ruta, token, { method: 'POST', body: JSON.stringify({ data: datos }) }),
        actualizar: (token, documentId, datos) =>
            request(`${ruta}/${documentId}`, token, { method: 'PUT', body: JSON.stringify({ data: datos }) }),
        borrar: (token, documentId) => request(`${ruta}/${documentId}`, token, { method: 'DELETE' }),
    };
}