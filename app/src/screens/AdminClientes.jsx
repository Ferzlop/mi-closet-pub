import { useContext, useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Card, List, Text } from 'react-native-paper'
import AuthContext from '../context/AuthContext'
import { listarUsuarios } from '../api/user'
import { outfitsApi } from '../api/outfits'
import colors from '../styles/colors'

export default function AdminClientes() {
    const { auth } = useContext(AuthContext)
    const [usuarios, setUsuarios] = useState([])
    const [outfits, setOutfits] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([listarUsuarios(auth.jwt), outfitsApi.listar(auth.jwt, '?populate=usuario&pagination[pageSize]=100&sort=createdAt:desc')])
            .then(([u, o]) => {
                setUsuarios(u.filter((x) => x.id !== auth.user.id))
                setOutfits(o)
            })
            .catch((e) => setError(e.message))
    }, [])

    const hoy = outfits.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {error ? <Text>{error}</Text> : null}

            <View style={{ flexDirection: 'row', gap: 8 }}>
                {[['Clientes', usuarios.length], ['Outfits', outfits.length], ['Hoy', hoy]].map(([titulo, numero]) => (
                    <Card key={titulo} style={{ flex: 1 }}>
                        <Card.Content>
                            <Text variant="headlineMedium">{numero}</Text>
                            <Text>{titulo}</Text>
                        </Card.Content>
                    </Card>
                ))}
            </View>

            {usuarios.map((u) => {
                const suyos = outfits.filter((o) => o.usuario?.id === u.id)
                return (
                    <View key={u.id} style={{ overflow: 'hidden', borderRadius: 12, backgroundColor: colors.secondary }}>
                        <List.Accordion style={{ backgroundColor: colors.secondary }} title={u.username} description={`${u.email} · ${suyos.length} outfits`}>
                            {suyos.map((o) => (
                                <List.Item style={{ backgroundColor: colors.light }} key={o.documentId} title={o.nombre} description={o.createdAt.slice(0, 10)} />
                            ))}
                        </List.Accordion>
                    </View>
                )
            })}
        </ScrollView>
    )
}
