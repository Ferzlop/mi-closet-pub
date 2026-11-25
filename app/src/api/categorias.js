import { crudApi } from './client';

export const categoriasApi = crudApi('/categorias');

// Categorías base: siempre existen y cada una pertenece a una parte del outfit
export const BASE = [
    { nombre: 'superior', tipo: 'superior' },
    { nombre: 'inferior', tipo: 'inferior' },
    { nombre: 'calzado', tipo: 'calzado' },
    { nombre: 'accesorios', tipo: 'accesorios' },
];

// Categorías base + las que creó el usuario
export async function listarCategorias(token) {
    const propias = await categoriasApi.listar(token, '?sort=createdAt:asc');
    return [...BASE, ...propias.map((c) => ({ nombre: c.nombre, tipo: c.tipo }))];
}
