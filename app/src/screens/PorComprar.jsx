import { useContext, useEffect, useState } from 'react'
import { Alert, Image, Linking, Pressable, ScrollView, View } from 'react-native'
import { Button, TextInput } from 'react-native-paper'
import AuthContext from '../context/AuthContext'
import { deseosApi } from '../api/deseos'
import { elegirYSubirFoto } from '../api/upload'

export default function PorComprar() {
    const { auth } = useContext(AuthContext)
    const [items, setItems] = useState([])
    const [agregando, setAgregando] = useState(false)
    const [foto, setFoto] = useState('')
    const [tienda, setTienda] = useState('')

    const cargar = () => deseosApi.listar(auth.jwt, '?sort=createdAt:desc').then(setItems)

    useEffect(() => {
        cargar()
    }, [])

    const subir = (desde) =>
        elegirYSubirFoto(auth.jwt, desde)
            .then((url) => url && setFoto(url))
            .catch((e) => Alert.alert(e.message))

    const guardar = () =>
        deseosApi.crear(auth.jwt, { foto, tienda }).then(() => {
            setAgregando(false)
            setFoto('')
            setTienda('')
            cargar()
        })

    const opciones = (item) =>
        Alert.alert('Deseo', '', [
            ...(item.tienda ? [{ text: 'Ver tienda', onPress: () => Linking.openURL(item.tienda) }] : []),
            { text: 'Borrar', style: 'destructive', onPress: () => deseosApi.borrar(auth.jwt, item.documentId).then(cargar) },
            { text: 'Cancelar', style: 'cancel' },
        ])

    if (agregando) {
        return (
            <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: 'center' }}>
                {foto ? <Image source={{ uri: foto }} style={{ height: 220 }} resizeMode="contain" /> : null}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button mode="outlined" style={{ flex: 1 }} onPress={() => subir('galeria')}>Galería</Button>
                    <Button mode="outlined" style={{ flex: 1 }} onPress={() => subir('camara')}>Cámara</Button>
                </View>
                <TextInput label="Link de compra (opcional)" value={tienda} onChangeText={setTienda} autoCapitalize="none" />
                <Button mode="contained" disabled={!foto} onPress={guardar}>Guardar</Button>
                <Button onPress={() => setAgregando(false)}>Cancelar</Button>
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
            <Button mode="contained" style={{ width: '100%' }} onPress={() => setAgregando(true)}>
                Agregar a Deseos
            </Button>
            {items.map((item) => (
                <Pressable key={item.documentId} onPress={() => opciones(item)} style={{ width: '31%' }}>
                    <Image
                        source={item.foto ? { uri: item.foto } : null}
                        style={{ aspectRatio: 1, backgroundColor: '#fff', borderRadius: 12 }}
                        resizeMode="contain"
                    />
                </Pressable>
            ))}
        </ScrollView>
    )
}