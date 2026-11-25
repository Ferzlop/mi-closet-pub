import { useContext, useEffect, useState } from 'react'
import { Alert, FlatList, Image, View } from 'react-native'
import { Button, Card, Text } from 'react-native-paper'
import AuthContext from '../context/AuthContext'
import { outfitsApi } from '../api/outfits'

export default function MisOutfits() {
    const { auth } = useContext(AuthContext)
    const [outfits, setOutfits] = useState([])

    const cargar = () => outfitsApi.listar(auth.jwt, '?sort=createdAt:desc').then(setOutfits)

    useEffect(() => {
        cargar()
    }, [])

    const borrar = (outfit) =>
        Alert.alert('Borrar outfit', `¿Quieres borrar ${outfit.nombre}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Borrar', style: 'destructive', onPress: () => outfitsApi.borrar(auth.jwt, outfit.documentId).then(cargar) },
        ])

    return (
        <FlatList
            data={outfits}
            keyExtractor={(o) => o.documentId}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            ListEmptyComponent={<Text>Aún no guardas outfits. Ve a Armar.</Text>}
            renderItem={({ item }) => (
                <Card>
                    <Card.Title
                        title={item.nombre}
                        subtitle={item.createdAt?.slice(0, 10)}
                        right={() => <Button textColor="red" onPress={() => borrar(item)}>Borrar</Button>}
                    />
                    <Card.Content style={{ flexDirection: 'row', gap: 8 }}>
                        {[['superior', 'inferior'], ['calzado', 'accesorios']].map((col, i) => (
                            <View key={i} style={{ flex: 1, gap: 8 }}>
                                {col.map((c) => (
                                    <Image key={c} source={item[c] ? { uri: item[c] } : null} style={{ height: 130 }} resizeMode="contain" />
                                ))}
                            </View>
                        ))}
                    </Card.Content>
                </Card>
            )}
        />
    )
}