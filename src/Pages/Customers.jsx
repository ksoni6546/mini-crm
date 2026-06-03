import { useEffect, useState } from 'react'

function Customers() {

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(function () {

    fetch('https://jsonplaceholder.typicode.com/users')

      .then(function (response) {
        return response.json()
      })

      .then(function (data) {

        setCustomers(data)
        setLoading(false)

      })

      .catch(function () {

        setError('Failed to load customers')
        setLoading(false)

      })

  }, [])

  if (loading) {

    return <h2>Loading Customers...</h2>

  }

  if (error) {

    return <h2>{error}</h2>

  }

  let filteredCustomers = customers.filter(function (customer) {

    return customer.name
      .toLowerCase()
      .includes(searchText.toLowerCase())

  })

  return (

    <div>

      <h1>Customers</h1>
      <h3>Total Customers: {customers.length}</h3>

      <input
        type="text"
        placeholder="Search customer"
        value={searchText}
        onChange={function (event) {
          setSearchText(event.target.value)
        }}
      />

      <br />
      <br />

      <table border="1">

        <thead>
          <tr>

            <th>ID</th>
            <th>Name</th>
            <th>Email</th>

          </tr>
        </thead>
        <tbody>

          {
            filteredCustomers.map(function (customer) {
              return (
                <tr
                  key={customer.id}
                  onClick={function () {

                    setSelectedCustomer(customer)

                  }}
                >
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                </tr>

              )
            })
          }

        </tbody>
      </table>
      <br />

      {
        selectedCustomer && (

          <div>
            <h2>Customer Details</h2>
            <p>ID: {selectedCustomer.id}</p>
            <p>Name: {selectedCustomer.name}</p>
            <p>Email: {selectedCustomer.email}</p>
            <p>Phone: {selectedCustomer.phone}</p>
            <p>Website: {selectedCustomer.website}</p>
          </div>
        )
      }
    </div>
  )
}

export default Customers