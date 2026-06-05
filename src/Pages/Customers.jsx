import { useEffect, useState } from 'react'

function Customers() {

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newStatus, setNewStatus] = useState('Active')
  const [editId, setEditId] = useState(null)

  useEffect(function () {

    let savedCustomers = JSON.parse(
      localStorage.getItem('customers')
    )

    if (savedCustomers && savedCustomers.length > 0) {

      setCustomers(savedCustomers)
      setLoading(false)
      
      return

    }

    fetch('https://jsonplaceholder.typicode.com/users')

      .then(function (response) {
        return response.json()
      })

      .then(function (data) {

        let customersWithStatus = data.map(function (customer) {

          return {
            ...customer,
            status: 'Active'
          }

        })

        setCustomers(customersWithStatus)
        setLoading(false)

      })

      .catch(function () {

        setError('Failed to load customers')
        setLoading(false)

      })

  }, [])

  useEffect(function () {

    if (customers.length > 0) {
      localStorage.setItem(
        'customers',
        JSON.stringify(customers)
      )

    }

  }, [customers])

  function addCustomer() {

    if (
      newName.trim() === '' ||
      newEmail.trim() === ''
    ) {

      alert('Please enter both name and email')
      return

    }

    let newCustomer = {

      id: Date.now(),
      name: newName,
      email: newEmail,
      status: newStatus

    }

    setCustomers([
      ...customers,
      newCustomer
    ])

    setNewName('')
    setNewEmail('')
    setNewStatus('Active')

  }

  function editCustomer(customer) {

    setNewName(customer.name)
    setNewEmail(customer.email)
    setNewStatus(customer.status)
    setEditId(customer.id)

  }

  function updateCustomer() {

    let updatedCustomers = customers.map(function (customer) {
      if (customer.id === editId) {
        return {

          ...customer,
          name: newName,
          email: newEmail,
          status: newStatus
        }

      }

      return customer

    })

    setCustomers(updatedCustomers)
    setNewName('')
    setNewEmail('')
    setEditId(null)

  }

  function deleteCustomer(customerId) {

    let updatedCustomers = customers.filter(function (customer) {
      return customer.id !== customerId

    })

    setCustomers(updatedCustomers)

    if (
      selectedCustomer &&
      selectedCustomer.id === customerId
    ) {

      setSelectedCustomer(null)

    }
  }
  function toggleStatus(customerId) {

  let updatedCustomers = customers.map(function(customer) {

    if(customer.id === customerId) {

      return {

        ...customer,

        status:
          customer.status === 'Active'
            ? 'Inactive'
            : 'Active'

      }

    }

    return customer

  })

  setCustomers(updatedCustomers)

}

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

    <div className="customers-page">

      <h1>Customer Management</h1>
      <h3>Total Customers: {customers.length}</h3>

      <div className="form-card">

        <h2>
          {editId ? 'Update Customer' : 'Add Customer'}
        </h2>

        <input
          type="text"
          placeholder="Enter Name"
          value={newName}
          onChange={function (event) {
            setNewName(event.target.value)
          }}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={newEmail}
          onChange={function (event) {
            setNewEmail(event.target.value)
          }}
        />

        <select
  value={newStatus}
  onChange={function(event) {

    setNewStatus(event.target.value)

  }}
>

  <option value="Active">
    Active
  </option>

  <option value="Inactive">
    Inactive
  </option>

</select>

        {
          editId ? (

            <button
              className="edit-btn"
              onClick={updateCustomer}
            >
              Update Customer
            </button>

          ) : (

            <button
              className="add-btn"
              onClick={addCustomer}
            >
              Add Customer
            </button>

          )
        }

      </div>

      <div className="search-card">

        <input
          type="text"
          placeholder="Search Customer"
          value={searchText}
          onChange={function (event) {
            setSearchText(event.target.value)
          }}
        />

      </div>

      <table>

        <thead>

          <tr>

            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>

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

                  <td>

  {
  customer.status === 'Active'
    ? '🟢 Active'
    : '🔴 Inactive'}

</td>

                  <td>

                    <button
                      className="edit-btn"
                      onClick={function (event) {

                        event.stopPropagation()
                        editCustomer(customer)

                      }}
                    >
                      Edit
                    </button>

                    <button
  onClick={function(event) {

    event.stopPropagation()
    toggleStatus(customer.id)

  }}
>
  Toggle Status
</button>

                    <button
                      className="delete-btn"
                      onClick={function (event) {
                        event.stopPropagation()
                        deleteCustomer(customer.id)

                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })
          }

        </tbody>

      </table>

      {
        selectedCustomer && (

          <div className="details-card">

            <h2>Customer Details</h2>

            <p>
              <strong>ID:</strong> {selectedCustomer.id}
            </p>

            <p>
              <strong>Name:</strong> {selectedCustomer.name}
            </p>

            <p>
              <strong>Email:</strong> {selectedCustomer.email}
            </p>

            <p>
              <strong>Status:</strong> {selectedCustomer.status}
            </p>

            <p>
              <strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}
            </p>

            <p>
              <strong>Website:</strong> {selectedCustomer.website || 'N/A'}
            </p>

          </div>

        )
      }

    </div>

  )

}

export default Customers