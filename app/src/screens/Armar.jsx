import { useContext, useEffect, useState } from 'react'
import { Alert, Image, ScrollView, View } from 'react-native'
import { Button, IconButton, TextInput } from 'react-native-paper'
import AuthContext from '../context/AuthContext'
import { prendasApi } from '../api/prendas'
import { outfitsApi } from '../api/outfits'
import { listarCategorias } from '../api/categorias'

// Las cuatro partes fijas del outfit
const CATS = ['superior', 'inferior', 'calzado', 'accesorios']

export default function Armar() {
    const { auth } = useContext(AuthContext)
    const [prendas, setPrendas] = useState([])
    const [categorias, setCategorias] = useState([])
    const [pos, setPos] = useState(Object.fromEntries(CATS.map((c) => [c, 0])))
    const [nombre, setNombre] = useState('')

    useEffect(() => {
        prendasApi.listar(auth.jwt, '?pagination[pageSize]=100').then(setPrendas)
        listarCategorias(auth.jwt).then(setCategorias)
    }, [])

    // Prendas de todas las categorías cuyo tipo es esta parte del outfit
    const lista = (cat) => {
        const nombres = categorias.filter((c) => c.tipo === cat).map((c) => c.nombre)
        return prendas.filter((p) => nombres.includes(p.categoria))
    }

    // Foto que se muestra en cada categoría (da la vuelta al llegar al final)
    const foto = (cat) => {
        const n = lista(cat).length
        return lista(cat)[((pos[cat] % n) + n) % n]?.foto
    }

    // Avanza entre 1 y (n-1) lugares, así siempre cambia de prenda
    const sorprendeme = () =>
        setPos(Object.fromEntries(CATS.map((c) => [c, pos[c] + 1 + Math.floor(Math.random() * Math.max(lista(c).length - 1, 1))])))

    const guardar = () =>
        outfitsApi
            .crear(auth.jwt, { nombre: nombre || 'Mi look', ...Object.fromEntries(CATS.map((c) => [c, foto(c) || ''])) })
            .then(() => {
                setNombre('')
                Alert.alert('¡Outfit guardado!')
            })

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            <Button mode="contained" onPress={sorprendeme}>Sorpréndeme</Button>

            {CATS.map((c) => (
                <View key={c} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton icon="chevron-left" onPress={() => setPos({ ...pos, [c]: pos[c] - 1 })} />
                    <Image source={foto(c) ? { uri: foto(c) } : null} style={{ flex: 1, height: 120 }} resizeMode="contain" />
                    <IconButton icon="chevron-right" onPress={() => setPos({ ...pos, [c]: pos[c] + 1 })} />
                </View>
            ))}

            <TextInput label="Nombre del outfit" value={nombre} onChangeText={setNombre} />
            <Button mode="contained" onPress={guardar}>Me gusta, guardar outfit</Button>
        </ScrollView>
    )
}
