import { useContext, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Avatar, Button, HelperText, IconButton, Text, TextInput } from 'react-native-paper'
import AuthContext from '../context/AuthContext'
import { cambiarFoto, cambiarNombre, cambiarPassword } from '../api/user'
import { elegirYSubirFoto } from '../api/upload'

export default function Perfil() {
    const { auth, login, logout } = useContext(AuthContext)
    const [username, setUsername] = useState(auth.user.username)
    const [editando, setEditando] = useState(false)
    const esAdmin = auth.user.role?.name === 'Admin'
    const [actual, setActual] = useState('')
    const [nueva, setNueva] = useState('')
    const [repetir, setRepetir] = useState('')
    const [mensaje, setMensaje] = useState('')

    const nuevaFoto = () =>
        elegirYSubirFoto(auth.jwt, 'galeria')
            .then((url) => url && cambiarFoto(auth.jwt, auth.user.id, url).then(() => login({ jwt: auth.jwt, user: auth.user })))
            .catch((e) => setMensaje(e.message))

    const guardarNombre = () =>
        cambiarNombre(auth.jwt, auth.user.id, username.trim())
            .then(() => login({ jwt: auth.jwt, user: auth.user })) // vuelve a cargar el usuario
            .then(() => {
                setEditando(false)
                setMensaje('Nombre actualizado')
            })
            .catch((e) => setMensaje(e.message))

    const guardarPassword = () => {
        if (nueva.length < 6) return setMensaje('La contraseña nueva debe tener al menos 6 caracteres')
        if (nueva !== repetir) return setMensaje('Las contraseñas nuevas no coinciden')
        cambiarPassword(auth.jwt, actual, nueva)
            .then((res) => login({ jwt: res.jwt || auth.jwt, user: auth.user }))
            .then(() => {
                setActual('')
                setNueva('')
                setRepetir('')
                setMensaje('Contraseña actualizada')
            })
            .catch((e) => setMensaje(e.message))
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Pressable onPress={nuevaFoto}>
                    {auth.user.foto ? (
                        <Avatar.Image size={80} source={{ uri: auth.user.foto }} />
                    ) : (
                        <Avatar.Text size={80} label={auth.user.username[0].toUpperCase()} />
                    )}
                </Pressable>
                <Text variant="titleMedium">{auth.user.username}</Text>
                {esAdmin ? null : <IconButton icon="pencil" size={18} onPress={() => setEditando(!editando)} />}
            </View>

            {editando ? (
                <>
                    <TextInput label="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none" />
                    <Button mode="contained" disabled={!username.trim()} onPress={guardarNombre}>Guardar nombre</Button>
                </>
            ) : null}

            <Text variant="titleMedium" style={{ marginTop: 16 }}>Cambiar contraseña</Text>
            <TextInput label="Contraseña actual" value={actual} onChangeText={setActual} secureTextEntry />
            <TextInput label="Contraseña nueva" value={nueva} onChangeText={setNueva} secureTextEntry />
            <TextInput label="Repetir contraseña nueva" value={repetir} onChangeText={setRepetir} secureTextEntry />
            <Button mode="contained" disabled={!actual || !nueva} onPress={guardarPassword}>Cambiar contraseña</Button>

            {mensaje ? <HelperText type="info">{mensaje}</HelperText> : null}

            <Button mode="outlined" textColor="red" style={{ marginTop: 24 }} onPress={logout}>Cerrar sesión</Button>
        </ScrollView>
    )
}
