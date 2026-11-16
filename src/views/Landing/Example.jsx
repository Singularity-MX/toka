import { useAuth } from "../../auth/useAuth"

function Dashboard() {
  const { user, loading, logout } = useAuth()

  if (loading) return <p>Cargando...</p>

  if (!user) return <p>Inicia sesión</p>

  return (
    <div>
      <h1>Hola, {user.displayName}</h1>
      <p>{user.email}</p>
     

      <img src={user.photoURL} alt="Perfil" />

      <button onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  )
}

export default Dashboard;