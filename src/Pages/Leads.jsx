import { useState, useEffect } from 'react'

function Leads() {

  const [leads, setLeads] = useState([])
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState('New')
  const [editId, setEditId] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)

  useEffect(function() {

    let savedLeads = JSON.parse(
      localStorage.getItem('leads')
    )

    if (savedLeads) {
      setLeads(savedLeads)
    }

  }, [])

  useEffect(function() {

    localStorage.setItem(
      'leads',
      JSON.stringify(leads)
    )

  }, [leads])

  function addLead() {

    if (
      leadName.trim() === '' ||
      leadEmail.trim() === '' ||
      leadPhone.trim() === '' ||
      company.trim() === ''
    ) {
      alert('Please enter lead name, email, phone and company')
      return
    }

    let newLead = {
      id: Date.now(),
      name: leadName,
      email: leadEmail,
      phone: leadPhone,
      company: company,
      status: status
    }

    setLeads([
      ...leads,
      newLead
    ])

    setLeadName('')
    setLeadEmail('')
    setLeadPhone('')
    setCompany('')
    setStatus('New')
  }

  function editLead(lead) {

    setLeadName(lead.name)
    setLeadEmail(lead.email || '')
    setLeadPhone(lead.phone || '')
    setCompany(lead.company)
    setStatus(lead.status)

    setEditId(lead.id)
  }

  function updateLead() {

    let updatedLeads = leads.map(function(lead) {

      if (lead.id === editId) {

        return {
          ...lead,
          name: leadName,
          email: leadEmail,
          company: company,
          status: status
        }

      }

      return lead

    })

    setLeads(updatedLeads)

    setLeadName('')
    setLeadEmail('')
    setLeadPhone('')
    setCompany('')
    setStatus('New')
    setEditId(null)
  }

  function deleteLead(leadId) {

    let updatedLeads = leads.filter(function(lead) {

      return lead.id !== leadId

    })

    setLeads(updatedLeads)

    if (
      selectedLead &&
      selectedLead.id === leadId
    ) {
      setSelectedLead(null)
    }
  }

  function convertToCustomer(lead) {

  let customers =
    JSON.parse(
      localStorage.getItem('customers')
    ) || []

  let newCustomer = {

    id: Date.now(),
    name: lead.name,
    email: '',
    phone: '',
    company: lead.company,
    status: 'Active'

  }

  // attach per-customer activity history
  newCustomer.activity = [
    {
      id: Date.now() + 1,
      type: 'Conversion',
      message: `Converted lead ${lead.name} to customer ${newCustomer.name}`,
      time: new Date().toLocaleString()
    }
  ]

  customers.push(newCustomer)

  localStorage.setItem(
    'customers',
    JSON.stringify(customers)
  )

  console.log('Leads: saved customers to localStorage', customers)

  // add an activity log entry so Customers/Dashboard can show recent actions
  let activityLog =
    JSON.parse(
      localStorage.getItem('activityLog')
    ) || []

  activityLog.unshift({
    id: Date.now(),
    type: 'Conversion',
    message: `Converted lead ${lead.name} to customer ${newCustomer.name}`,
    time: new Date().toLocaleString()
  })

  localStorage.setItem(
    'activityLog',
    JSON.stringify(activityLog)
  )

  console.log('Leads: saved activityLog to localStorage', activityLog)

  // notify other parts of the app in this window to refresh their data
  try {
    window.dispatchEvent(new Event('crm:storageUpdated'))
  } catch (e) {
    // ignore in non-browser or older environments
  }

  deleteLead(lead.id)

  alert('Lead converted to customer')

}

  let filteredLeads = leads.filter(function(lead) {

    return lead.name
      .toLowerCase()
      .includes(searchText.toLowerCase())

  })

  return (

    <div className="customers-page">

      <h1>Lead Management</h1>

      <h3>Total Leads: {leads.length}</h3>

      <div className="form-card">

        <h2>Add Lead</h2>

        <input
          type="text"
          placeholder="Lead Name"
          value={leadName}
          onChange={function(event) {
            setLeadName(event.target.value)
          }}
        />

        <input
          type="email"
          placeholder="Lead Email"
          value={leadEmail}
          onChange={function(event) {
            setLeadEmail(event.target.value)
          }}
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={leadPhone}
          onChange={function(event) {
            setLeadPhone(event.target.value)
          }}
        />

        <input
          type="text"
          placeholder="Company Name"
          value={company}
          onChange={function(event) {
            setCompany(event.target.value)
          }}
        />

        <select
          value={status}
          onChange={function(event) {
            setStatus(event.target.value)
          }}
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>

        {
          editId ? (

            <button
              className="edit-btn"
              onClick={updateLead}
            >
              Update Lead
            </button>

          ) : (

            <button
              className="add-btn"
              onClick={addLead}
            >
              Add Lead
            </button>

          )
        }

      </div>

      <div className="search-card">

        <input
          type="text"
          placeholder="Search Lead"
          value={searchText}
          onChange={function(event) {
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
            filteredLeads.map(function(lead) {

              return (

                <tr
                  key={lead.id}
                  onClick={function() {
                    setSelectedLead(lead)
                  }}
                >

                  <td>{lead.id}</td>

                  <td>{lead.name}</td>
                  <td>{lead.email || 'N/A'}</td>
                  <td>{lead.phone || 'N/A'}</td>
                  <td>{lead.company}</td>

                  <td>
                    {
                      lead.status === 'New'
                        ? '🔵 New'
                        : lead.status === 'Contacted'
                        ? '🟡 Contacted'
                        : lead.status === 'Qualified'
                        ? '🟢 Qualified'
                        : '🔴 Lost'
                    }
                  </td>

                  <td>

                    <button
                      className="edit-btn"
                      onClick={function(event) {

                        event.stopPropagation()
                        editLead(lead)

                      }}
                    >
                      Edit
                    </button>'
                    
                    <button
  className="add-btn"
  onClick={function() {

    convertToCustomer(lead)

  }}
>
Convert
</button>

                    <button
                      className="delete-btn"
                      onClick={function(event) {

                        event.stopPropagation()
                        deleteLead(lead.id)

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
        selectedLead && (

          <div className="details-card">

            <h2>Lead Details</h2>

            <p>
              <strong>ID:</strong> {selectedLead.id}
            </p>

            <p>
              <strong>Name:</strong> {selectedLead.name}
            </p>

            <p>
              <strong>Email:</strong> {selectedLead.email || 'N/A'}
            </p>

            <p>
              <strong>Phone:</strong> {selectedLead.phone || 'N/A'}
            </p>

            <p>
              <strong>Company:</strong> {selectedLead.company}
            </p>

            <p>
              <strong>Status:</strong> {selectedLead.status}
            </p>

          </div>

        )
      }

    </div>

  )

}

export default Leads