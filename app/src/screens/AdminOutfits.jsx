import { useContext, useEffect, useState } from 'react'
import { Image, ScrollView, View } from 'react-native'
import { Button, List } from 'react-native-paper'
import AuthContext from '../context/AuthContext'
import { outfitsApi } from '../api/outfits'
import colors from '../styles/colors'

const CATS = ['superior', 'inferior', 'calzado', 'accesorios']

// Foto cuadrada de una prenda
const Foto = ({ uri, size }) => (
    <Image source={uri ? { uri } : null} style={{ width: size, height: size, borderRadius: 6, backgroundColor: '#eee' }} resizeMode="contain" />
)

export default function AdminOutfits() {
    const { auth } = useContext(AuthContext)
    const [outfits, setOutfits] = useState([])
    const [cantidad, setCantidad] = useState(10)

    // Pide solo los últimos "cantidad" outfits; "Ver más" suma 10
    useEffect(() => {
        outfitsApi.listar(auth.jwt, `?populate=usuario&sort=createdAt:desc&pagination[pageSize]=${cantidad}`).then(setOutfits)
    }, [cantidad])

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {outfits.map((o) => (
                <View key={o.documentId} style={{ overflow: 'hidden', borderRadius: 12, backgroundColor: colors.secondary }}>
                    <List.Accordion
                        style={{ backgroundColor: colors.secondary }}
                        title={o.nombre}
                        description={`${o.usuario?.username} · ${o.createdAt.slice(0, 10)}`}
                        left={() => (
                            <View style={{ flexDirection: 'row', gap: 4, marginLeft: 8 }}>
                                {CATS.map((c) => <Foto key={c} uri={o[c]} size={32} />)}
                            </View>
                        )}
                    >
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 8 }}>
                            {CATS.map((c) => <Foto key={c} uri={o[c]} size={120} />)}
                        </View>
                    </List.Accordion>
                </View>
            ))}

            {outfits.length === cantidad ? <Button onPress={() => setCantidad(cantidad + 10)}>Ver más</Button> : null}
        </ScrollView>
    )
}
