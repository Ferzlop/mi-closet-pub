import { View } from 'react-native'
import { useContext, useState } from 'react'
import { Button, HelperText, TextInput } from 'react-native-paper'
import formStyles from '../styles/forms'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { registerApi } from '../api/user'
import AuthContext from '../context/AuthContext'

export default function RegisterForm({ changeForm }) {
    const { login } = useContext(AuthContext)
    const [serverError, setServerError] = useState('')

    const formik = useFormik({
        initialValues: { email: '', username: '', password: '', repeatPassword: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('El correo no es válido').required('Escribe tu correo'),
            username: Yup.string().required('Escribe un usuario'),
            password: Yup.string().required('Escribe una contraseña'),
            repeatPassword: Yup.string()
                .required('Repite la contraseña')
                .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
        }),
        onSubmit: async (formData) => {
            setServerError('')
            try {
                const data = await registerApi(formData)
                if (!data.jwt) {
                    setServerError(data.error?.message || 'No se pudo registrar')
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
                label="Correo electrónico"
                style={formStyles.input}
                onChangeText={(text) => formik.setFieldValue('email', text)}
                value={formik.values.email}
                error={!!formik.errors.email}
            />
            <TextInput
                label="Usuario"
                style={formStyles.input}
                onChangeText={(text) => formik.setFieldValue('username', text)}
                value={formik.values.username}
                error={!!formik.errors.username}
            />
            <TextInput
                label="Contraseña"
                style={formStyles.input}
                secureTextEntry
                onChangeText={(text) => formik.setFieldValue('password', text)}
                value={formik.values.password}
                error={!!formik.errors.password}
            />
            <TextInput
                label="Repite la contraseña"
                style={formStyles.input}
                secureTextEntry
                onChangeText={(text) => formik.setFieldValue('repeatPassword', text)}
                value={formik.values.repeatPassword}
                error={!!formik.errors.repeatPassword}
            />
            {serverError ? <HelperText type="error">{serverError}</HelperText> : null}
            <Button
                mode="contained"
                style={formStyles.btnSuccess}
                onPress={formik.handleSubmit}
                loading={formik.isSubmitting}
            >
                Registrarme
            </Button>
            <Button
                mode="outlined"
                style={formStyles.btnText}
                onPress={changeForm}
            >
                Iniciar Sesión
            </Button>
        </View>
    )
}
