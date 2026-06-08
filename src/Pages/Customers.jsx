import { useEffect, useState } from 'react'

function Customers() {

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [activityLog, setActivityLog] = useState([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newStatus, setNewStatus] = useState('Active')
  const [newNote, setNewNote] = useState('')
  const [editId, setEditId] = useState(null)

  function normalizeCustomers(list) {
    return list.map(function (customer) {
      return {
        ...customer,
        activity: customer.activity || []
      }
    })
  }

  function loadSavedCustomers() {
    let savedCustomers = JSON.parse(
      localStorage.getItem('customers')
    )

    if (Array.isArray(savedCustomers)) {
      return normalizeCustomers(savedCustomers)
    }

    return null
  }

  useEffect(function () {

    let savedLogs = JSON.parse(
      localStorage.getItem('activityLog')
    ) || []

    setActivityLog(savedLogs)

    let savedCustomers = loadSavedCustomers()

    if (savedCustomers !== null) {
      setCustomers(savedCustomers)
      setLoading(false)

      if (savedCustomers.length > 0) {
        return
      }
    }

    fetch('https://jsonplaceholder.typicode.com/users')

      .then(function (response) {
        return response.json()
      })

      .then(function (data) {

        let customersWithStatus = data.map(function (customer) {

          return {
            ...customer,
            phone: customer.phone || '',
            company: customer.company?.name || '',
            status: 'Active',
            activity: []
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

  // listen for cross-component updates (conversion, deletes) and reload data
  useEffect(function () {

    function handleStorageUpdate() {

      let savedLogs = JSON.parse(
        localStorage.getItem('activityLog')
      ) || []

      setActivityLog(savedLogs)

      let savedCustomers = loadSavedCustomers() || []

      setCustomers(savedCustomers)

      setSelectedCustomer(function (prev) {
        if (!prev) return prev
        let found = savedCustomers.find(function (x) {
          return x.id === prev.id
        })
        return found || prev
      })

    }

    window.addEventListener('crm:storageUpdated', handleStorageUpdate)
    window.addEventListener('storage', handleStorageUpdate)

    return function () {
      window.removeEventListener('crm:storageUpdated', handleStorageUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
    }

  }, [])

  useEffect(function () {

    // avoid overwriting the saved customer list while the page is still loading
    if (!loading) {
      try {
        localStorage.setItem(
          'customers',
          JSON.stringify(customers)
        )
      } catch (e) {
        // ignore storage errors
      }
    }

  }, [customers, loading])

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
      phone: newPhone,
      company: newCompany,
      note: newNote,
      status: newStatus

    }

    // initialize per-customer activity
    newCustomer.activity = []

    setCustomers([
      ...customers,
      newCustomer
    ])

    // persist immediately and notify other components/tabs
    try {
      let next = [
        ...customers,
        newCustomer
      ]
      localStorage.setItem('customers', JSON.stringify(next))
      window.dispatchEvent(new Event('crm:storageUpdated'))
    } catch (e) {
      // ignore
    }

    clearForm()

  }

  function editCustomer(customer) {

    setNewName(customer.name)
    setNewEmail(customer.email)
    setNewPhone(customer.phone || '')
    setNewCompany(customer.company || '')
    setNewStatus(customer.status)
    setNewNote(customer.note || '')
    setEditId(customer.id)

  }

  function updateCustomer() {

    let updatedCustomers = customers.map(function (customer) {

      if (customer.id === editId) {

        return {

          ...customer,
          name: newName,
          email: newEmail,
          phone: newPhone,
          company: newCompany,
          note: newNote,
          status: newStatus

        }

      }

      return customer

    })

    setCustomers(updatedCustomers)

    try {
      localStorage.setItem('customers', JSON.stringify(updatedCustomers))
      window.dispatchEvent(new Event('crm:storageUpdated'))
    } catch (e) {}

    clearForm()

    setEditId(null)
    setNewNote('')

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

    try {
      localStorage.setItem('customers', JSON.stringify(updatedCustomers))
      window.dispatchEvent(new Event('crm:storageUpdated'))
    } catch (e) {}

  }

  function toggleStatus(customerId) {

    let updatedCustomers = customers.map(function (customer) {

      if (customer.id === customerId) {

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

    try {
      localStorage.setItem('customers', JSON.stringify(updatedCustomers))
      window.dispatchEvent(new Event('crm:storageUpdated'))
    } catch (e) {}

  }

  function clearForm() {

    setNewName('')
    setNewEmail('')
    setNewPhone('')
    setNewCompany('')
    setNewStatus('Active')

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

        <input
          type="text"
          placeholder="Enter Phone"
          value={newPhone}
          onChange={function (event) {
            setNewPhone(event.target.value)
          }}
        />

        <input
          type="text"
          placeholder="Enter Company"
          value={newCompany}
          onChange={function (event) {
            setNewCompany(event.target.value)
          }}
        />

        <textarea
  placeholder="Enter Notes"
  value={newNote}
  onChange={function(event) {
    setNewNote(event.target.value)
  }}
/>

        <select
          value={newStatus}
          onChange={function (event) {
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

      <div className="activity-card">

        <h2>Recent Activity</h2>

        <ul>
          {
            activityLog.slice(0, 5).map(function (log) {

              return (

                <li key={log.id}>
                  {log.time} - {log.message}
                </li>

              )

            })
          }
        </ul>

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
            <th>Phone</th>
            <th>Company</th>
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
                  <td>{customer.phone}</td>
                  <td>{customer.company}</td>

                  <td>
                    {
                      customer.status === 'Active'
                        ? '🟢 Active'
                        : '🔴 Inactive'
                    }
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
                      onClick={function (event) {

                        event.stopPropagation()
                        toggleStatus(customer.id)

                      }}
                    >
                      Toggle
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
              <strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}
            </p>

            <p>
              <strong>Company:</strong> {selectedCustomer.company || 'N/A'}
            </p>

            <p>
  <strong>Notes:</strong>
  {selectedCustomer.note || 'No Notes'}
</p>

            <p>
              <strong>Status:</strong> {selectedCustomer.status}
            </p>

            {
              (selectedCustomer.activity && selectedCustomer.activity.length > 0) && (

                <div style={{ marginTop: 8 }}>
                  <h3>Activity</h3>
                  <ul>
                    {selectedCustomer.activity.map(function (a) {
                      return (
                        <li key={a.id}>{a.time} - {a.message}</li>
                      )
                    })}
                  </ul>
                </div>

              )
            }

          </div>

        )
      }

    </div>

  )

}

export default Customers