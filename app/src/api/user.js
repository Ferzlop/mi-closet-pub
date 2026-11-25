import { API_URL, request } from './client';

async function post(path, body) {
    const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(body),
    });
    return response.json();
}

export function registerApi(formData) {
    return post('/auth/local/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
    });
}

export function loginApi(formData) {
    return post('/auth/local', {
        identifier: formData.identifier,
        password: formData.password,
    });
}

// Datos del usuario conectado, incluido su rol (Admin o Authenticated)
export function me(token) {
    return request('/users/me?populate=role', token);
}

// Lista de usuarios (solo el admin tiene permiso)
export function listarUsuarios(token) {
    return request('/users', token);
}

// Cambia el nombre de usuario (el servidor solo deja editar al usuario conectado)
export function cambiarNombre(token, id, username) {
    return request(`/users/${id}`, token, { method: 'PUT', body: JSON.stringify({ username }) });
}

// Cambia la contraseña (función que ya trae Strapi)
export function cambiarPassword(token, actual, nueva) {
    return request('/auth/change-password', token, {
        method: 'POST',
        body: JSON.stringify({ currentPassword: actual, password: nueva, passwordConfirmation: nueva }),
    });
}


// Guarda la URL de la foto de perfil
export function cambiarFoto(token, id, foto) {
    return request(`/users/${id}`, token, { method: 'PUT', body: JSON.stringify({ foto }) });
}
