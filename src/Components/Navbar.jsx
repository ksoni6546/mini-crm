import { Link } from 'react-router-dom'

function Navbar() {

  return (

    <nav className="navbar">

      <h2 className="logo">
        Mini CRM
      </h2>

      <div className="nav-links">

        <Link to="/">
          Dashboard
        </Link>

        <Link to="/customers">
          Customers
        </Link>

        <Link to="/leads">
  Leads
</Link>


        <Link to="/settings">
          Settings
        </Link>

      </div>

    </nav>

  )

}

export default Navbar