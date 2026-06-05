function Dashboard() {

  let customers =
    JSON.parse(
      localStorage.getItem('customers')
    ) || []

  let leads =
    JSON.parse(
      localStorage.getItem('leads')
    ) || []

  let activeCustomers =
    customers.filter(function(customer) {

      return customer.status === 'Active'

    })

  let inactiveCustomers =
    customers.filter(function(customer) {

      return customer.status === 'Inactive'

    })

  return (

    <div className="dashboard-page">

      <h1>CRM Dashboard</h1>

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <h3>Total Customers</h3>

          <h2>{customers.length}</h2>

        </div>

        <div className="dashboard-card">

          <h3>Active Customers</h3>

          <h2>{activeCustomers.length}</h2>

        </div>

        <div className="dashboard-card">

          <h3>Inactive Customers</h3>

          <h2>{inactiveCustomers.length}</h2>

        </div>

        <div className="dashboard-card">

          <h3>Total Leads</h3>

          <h2>{leads.length}</h2>

        </div>

      </div>

      <div className="welcome-card">

        <h2>Welcome Back 👋</h2>

        <p>
          Manage customers, leads and tasks from your CRM dashboard.
        </p>

      </div>

    </div>

  )

}

export default Dashboard