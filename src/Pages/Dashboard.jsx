function Dashboard() {

  return (

    <div className="dashboard-page">

      <h1>CRM Dashboard</h1>

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <h3>Total Customers</h3>

          <h2>10</h2>

        </div>

        <div className="dashboard-card">

          <h3>Active Customers</h3>

          <h2>8</h2>

        </div>

        <div className="dashboard-card">

          <h3>New Customers</h3>

          <h2>2</h2>

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