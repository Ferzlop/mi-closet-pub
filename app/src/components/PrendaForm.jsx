import { useEffect, useState } from 'react'
import { Alert, Image, ScrollView, View } from 'react-native'
import { Button, Chip, Text, TextInput } from 'react-native-paper'
import { prendasApi } from '../api/prendas'
import { categoriasApi, listarCategorias, BASE } from '../api/categorias'
import { elegirYSubirFoto } from '../api/upload'

// Las cuatro partes del outfit: cada categoría nueva se asigna a una de ellas
const TIPOS = BASE.map((c) => c.nombre)
const TEMPORADAS = ['primavera', 'verano', 'otoño', 'invierno']
const COLORES = {
    blanco: '#ffffff', negro: '#000000', gris: '#9e9e9e', beige: '#e8dccb', café: '#6d4c41', rojo: '#e53935',
    rosa: '#f06292', naranja: '#fb8c00', amarillo: '#fdd835', verde: '#43a047', azul: '#1e88e5', morado: '#8e24aa',
}
const CAMPOS = ['nombre', 'categoria', 'color', 'temporadas', 'marca', 'foto']

// Título + fila de opciones
const Fila = ({ titulo, children }) => (
    <>
        <Text variant="labelLarge">{titulo}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{children}</View>
    </>
)

export default function PrendaForm({ token, prenda, onSaved, onCancel }) {
    const [v, setV] = useState(Object.fromEntries(CAMPOS.map((c) => [c, prenda?.[c] ?? ''])))
    const [categorias, setCategorias] = useState([])
    const [creando, setCreando] = useState(false)
    const [nueva, setNueva] = useState({ nombre: '', tipo: '' })
    const set = (campo, valor) => setV((antes) => ({ ...antes, [campo]: valor }))

    useEffect(() => {
        listarCategorias(token).then(setCategorias)
    }, [])

    const subir = (desde) =>
        elegirYSubirFoto(token, desde)
            .then((url) => url && set('foto', url))
            .catch((e) => Alert.alert(e.message))

    const crearCategoria = () => {
        const nombre = nueva.nombre.trim().toLowerCase()
        if (!nombre || !nueva.tipo) return Alert.alert('Escribe el nombre y elige a qué parte del outfit pertenece')
        if (categorias.some((c) => c.nombre === nombre)) return Alert.alert('Ya existe una categoría con ese nombre')
        categoriasApi
            .crear(token, { nombre, tipo: nueva.tipo })
            .then(() => {
                setCategorias([...categorias, { nombre, tipo: nueva.tipo }])
                set('categoria', nombre)
                setNueva({ nombre: '', tipo: '' })
                setCreando(false)
            })
            .catch((e) => Alert.alert(e.message))
    }

    const guardar = () =>
        (prenda ? prendasApi.actualizar(token, prenda.documentId, v) : prendasApi.crear(token, v)).then(onSaved)

    return (
        <ScrollView contentContainerStyle={{ gap: 8 }}>
            <TextInput label="Nombre" value={v.nombre} onChangeText={(t) => set('nombre', t)} />
            <TextInput label="Marca" value={v.marca} onChangeText={(t) => set('marca', t)} />

            <Fila titulo="Categoría">
                {categorias.map((c) => (
                    <Chip key={c.nombre} selected={v.categoria === c.nombre} onPress={() => set('categoria', c.nombre)}>
                        {c.nombre}
                    </Chip>
                ))}
                <Chip icon="plus" onPress={() => setCreando(!creando)}>Nueva</Chip>
            </Fila>

            {creando ? (
                <View style={{ gap: 8 }}>
                    <TextInput
                        label="Nombre de la categoría"
                        value={nueva.nombre}
                        onChangeText={(t) => setNueva({ ...nueva, nombre: t })}
                    />
                    <Fila titulo="¿A qué parte del outfit pertenece?">
                        {TIPOS.map((t) => (
                            <Chip key={t} selected={nueva.tipo === t} onPress={() => setNueva({ ...nueva, tipo: t })}>
                                {t}
                            </Chip>
                        ))}
                    </Fila>
                    <Button mode="contained-tonal" onPress={crearCategoria}>Crear categoría</Button>
                </View>
            ) : null}

            <Fila titulo="Color">
                {Object.entries(COLORES).map(([c, hex]) => (
                    <Chip
                        key={c}
                        selected={v.color === c}
                        avatar={<View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: hex, borderWidth: 1, borderColor: '#ccc' }} />}
                        onPress={() => set('color', c)}
                    >
                        {c}
                    </Chip>
                ))}
            </Fila>

            <Fila titulo="Temporada">
                {TEMPORADAS.map((t) => (
                    <Chip key={t} selected={v.temporadas === t} onPress={() => set('temporadas', t)}>{t}</Chip>
                ))}
            </Fila>

            {v.foto ? <Image source={{ uri: v.foto }} style={{ height: 220 }} resizeMode="contain" /> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button mode="outlined" style={{ flex: 1 }} onPress={() => subir('galeria')}>Galería</Button>
                <Button mode="outlined" style={{ flex: 1 }} onPress={() => subir('camara')}>Cámara</Button>
            </View>

            <Button mode="contained" disabled={!v.nombre || !v.categoria} onPress={guardar}>Guardar</Button>
            <Button onPress={onCancel}>Cancelar</Button>
        </ScrollView>
    )
}
