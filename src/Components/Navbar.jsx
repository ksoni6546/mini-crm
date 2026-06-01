import { Link } from 'react-router-dom'

function Navbar() {

  return (
    <div>

      <Link to="/">
        Dashboard
      </Link>

      {' | '}

      <Link to="/customers">
        Customers
      </Link>

      {' | '}

      <Link to="/settings">
        Settings
      </Link>

    </div>
  )
}

export default Navbar