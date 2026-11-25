import { View } from 'react-native'
import { useContext, useState } from 'react'
import { Button, HelperText, TextInput } from 'react-native-paper'
import formStyles from '../styles/forms'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { loginApi } from '../api/user'
import AuthContext from '../context/AuthContext'

export default function LoginForm({ changeForm }) {
    const { login } = useContext(AuthContext)
    const [serverError, setServerError] = useState('')

    const formik = useFormik({
        initialValues: { identifier: '', password: '' },
        validationSchema: Yup.object({
            identifier: Yup.string().required('Escribe tu correo o usuario'),
            password: Yup.string().required('Escribe tu contraseña'),
        }),
        onSubmit: async (formData) => {
            setServerError('')
            try {
                const data = await loginApi(formData)
                if (!data.jwt) {
                    setServerError('Correo o contraseña incorrectos')
                    return
                }
                login(data)
            } catch (error) {
                setServerError('No se pudo conectar con el servidor')
            }
        },
    })

    return (
        <View>
            <TextInput
                label="Correo o usuario"
                style={formStyles.input}
                onChangeText={(text) => formik.setFieldValue('identifier', text)}
                value={formik.values.identifier}
                error={!!formik.errors.identifier}
            />
            <TextInput
                label="Contraseña"
                style={formStyles.input}
                secureTextEntry
                onChangeText={(text) => formik.setFieldValue('password', text)}
                value={formik.values.password}
                error={!!formik.errors.password}
            />
            {serverError ? <HelperText type="error">{serverError}</HelperText> : null}
            <Button
                mode="contained"
                style={formStyles.btnSuccess}
                onPress={formik.handleSubmit}
                loading={formik.isSubmitting}
            >
                Iniciar Sesión
            </Button>
            <Button
                mode="outlined"
                style={formStyles.btnText}
                onPress={changeForm}
            >
                Registrarse
            </Button>
        </View>
    )
}
