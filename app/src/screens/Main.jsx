import { useContext, useState } from 'react'
import { View } from 'react-native'
import { BottomNavigation, Button, Text } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import AuthContext from '../context/AuthContext'
import Armario from './Armario'
import Armar from './Armar'
import MisOutfits from './MisOutfits'
import AdminClientes from './AdminClientes'
import AdminOutfits from './AdminOutfits'
import Perfil from './Perfil'

const PANTALLAS = {
    armario: Armario,
    armar: Armar,
    outfits: MisOutfits,
    clientes: AdminClientes,
    outfitsAdmin: AdminOutfits,
    perfil: Perfil,
}

export default function Main() {
    const { auth } = useContext(AuthContext)
    // El rol viene de Strapi: solo el rol "Admin" ve el panel
    const esAdmin = auth.user?.role?.name === 'Admin'

    const rutas = esAdmin
        ? [
              { key: 'clientes', title: 'Clientes', focusedIcon: 'account-group' },
              { key: 'outfitsAdmin', title: 'Outfits', focusedIcon: 'hanger' },
              { key: 'perfil', title: 'Perfil', focusedIcon: 'account' },
          ]
        : [
              { key: 'armario', title: 'Armario', focusedIcon: 'hanger' },
              { key: 'armar', title: 'Armar', focusedIcon: 'tshirt-crew' },
              { key: 'outfits', title: 'Mis outfits', focusedIcon: 'star' },
              { key: 'perfil', title: 'Perfil', focusedIcon: 'account' },
          ]

    const [index, setIndex] = useState(0)
    // Cambia cada vez que tocas una pestaña, para que la pantalla se recargue
    const [visitas, setVisitas] = useState(0)

    const renderScene = ({ route }) => {
        const Pantalla = PANTALLAS[route.key]
        return <Pantalla key={`${route.key}-${visitas}`} />
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 }}>
                <View>
                    <Text variant="headlineSmall">{esAdmin ? 'Panel admin' : 'Mi clóset'}</Text>
                    <Text>{auth.user?.username}</Text>
                </View>
            </View>
            <BottomNavigation
                navigationState={{ index: Math.min(index, rutas.length - 1), routes: rutas }}
                onIndexChange={(i) => {
                    setIndex(i)
                    setVisitas((v) => v + 1)
                }}
                renderScene={renderScene}
            />
        </SafeAreaView>
    )
}