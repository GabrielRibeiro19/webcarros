import { Link } from 'react-router-dom'
import logoImg from '../../assets/logo.svg'
import { FiLogIn, FiUser } from 'react-icons/fi'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

export function Header() {
  const { signed, loadingAuth } = useContext(AuthContext)

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
      <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
        <Link to="/">
          <img src={logoImg} alt="Logo do site" />
        </Link>
        {!loadingAuth && signed && (
          <Link
            to="/dashboard"
            className="p-1 border-2 rounded-full border-gray-900"
          >
            <FiUser size={22} color="#000" />
          </Link>
        )}
        {!loadingAuth && !signed && (
          <Link
            to="/login"
            className="p-1 border-2 rounded-full border-gray-900"
          >
            <FiLogIn size={22} color="#000" />
          </Link>
        )}
      </header>
    </div>
  )
}
