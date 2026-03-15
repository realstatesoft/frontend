# frontend
# test
# OR-60-Gestion de Sesion
### Estructura
```
src/
  context/
    AuthContext.jsx   # Contexto global de autenticación + AuthProvider
  hooks/
    useAuth.js        # Hook para consumir el contexto desde cualquier componente
  services/
    api.js            # Instancia de Axios con interceptor que adjunta el token
```
### Uso en el componente de Login

```jsx
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

function LoginPage() {
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await api.post('/auth/login', { email, password });
    login(response.data); // guarda el accessToken en la cookie
  }
}
```

#que??
