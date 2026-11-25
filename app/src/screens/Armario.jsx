import { useContext, useEffect, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, View } from 'react-native'
import { Button, Chip, SegmentedButtons, Text } from 'react-native-paper'
import AuthContext from '../context/AuthContext'
import PrendaForm from '../components/PrendaForm'
import PorComprar from './PorComprar'
import { prendasApi } from '../api/prendas'

export default function Armario() {
    const { auth } = useContext(AuthContext)
    const [prendas, setPrendas] = useState([])
    const [vista, setVista] = useState('closet')
    const [filtro, setFiltro] = useState('todas')
    // null = ver prendas, 'nueva' = crear, objeto = editar esa prenda
    const [editando, setEditando] = useState(null)

    const cargar = () => prendasApi.listar(auth.jwt, '?sort=createdAt:desc&pagination[pageSize]=100').then(setPrendas)

    useEffect(() => {
        cargar()
    }, [])

    const opciones = (prenda) =>
        Alert.alert(prenda.nombre, '', [
            { text: 'Editar', onPress: () => setEditando(prenda) },
            { text: 'Borrar', style: 'destructive', onPress: () => prendasApi.borrar(auth.jwt, prenda.documentId).then(cargar) },
            { text: 'Cancelar', style: 'cancel' },
        ])

    if (editando) {
        return (
            <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
                <PrendaForm
                    token={auth.jwt}
                    prenda={editando === 'nueva' ? null : editando}
                    onSaved={() => {
                        setEditando(null)
                        cargar()
                    }}
                    onCancel={() => setEditando(null)}
                />
            </View>
        )
    }

    const categorias = ['todas', ...new Set(prendas.map((p) => p.categoria))]

    return (
        <View style={{ flex: 1 }}>
            <SegmentedButtons
                value={vista}
                onValueChange={setVista}
                style={{ margin: 16, marginBottom: 0 }}
                buttons={[{ value: 'closet', label: 'Clóset' }, { value: 'deseos', label: 'Deseos' }]}
            />

            {vista === 'deseos' ? (
                <PorComprar />
            ) : (
                <>
                    <Button mode="contained" style={{ marginHorizontal: 16, marginTop: 12 }} onPress={() => setEditando('nueva')}>
                        Agregar prenda
                    </Button>

                    <ScrollView horizontal style={{ flexGrow: 0, height: 72 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, alignItems: 'center' }}>
                        {categorias.map((c) => (
                            <Chip key={c} selected={filtro === c} onPress={() => setFiltro(c)}>{c}</Chip>
                        ))}
                    </ScrollView>

                    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {prendas
                            .filter((p) => filtro === 'todas' || p.categoria === filtro)
                            .map((p) => (
                                <Pressable key={p.documentId} onPress={() => opciones(p)} style={{ width: '31%' }}>
                                    <Image
                                        source={p.foto ? { uri: p.foto } : null}
                                        style={{ aspectRatio: 1, backgroundColor: '#fff', borderRadius: 12 }}
                                        resizeMode="contain"
                                    />
                                    <Text numberOfLines={1}>{p.nombre}</Text>
                                </Pressable>
                            ))}
                    </ScrollView>
                </>
            )}
        </View>
    )
}