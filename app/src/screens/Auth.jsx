import { Image, View } from 'react-native'
import { useState } from 'react'
import layoutStyles from '../styles/layouts'
import logo from '../../assets/icon.png'
import RegisterForm from '../components/RegisterForm'
import LoginForm from '../components/LoginForm'

const Auth = () => {
  const [showLogin, setShowLogin] = useState(false);

  const changeForm = () => setShowLogin(!showLogin);
  
  return (
    <View style={layoutStyles.container}>
      <Image source={logo} style={layoutStyles.logo} />
      {showLogin ? <LoginForm changeForm={changeForm} /> : <RegisterForm changeForm={changeForm} />}
    </View>
  )
}

export default Auth
