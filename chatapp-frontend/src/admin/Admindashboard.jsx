import React, { useState, useEffect } from 'react';
import {
  MDBBadge,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody
} from 'mdb-react-ui-kit';
import { getallusersAPI } from '../../Service/allapi';
import { server_url } from '../../Service/server_url';
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const result = await getallusersAPI(headers);
      if (result.status === 200) {
        setUsers(result.data);
      } else {
        setError('Failed to fetch users.');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
      {error && <p className='text-danger text-center'>{error}</p>}
      {loading ? (
        <p className='text-center'>Loading...</p>
      ) : (
        <MDBTable align='middle'>

          <MDBTableHead className='bg-light' style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
               <th scope='col'>No</th>
                <th scope='col'>Profile Image</th>
              <th scope='col'>Name</th>
              <th scope='col'>Email</th>
              <th scope='col'>Gender</th>
              <th scope='col'>Account Created Date & Time</th>
              <th scope="col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
            onClick={() => {
              sessionStorage.clear(); // or removeItem('token')
              window.location.href = '/login'; // replace with your actual login route
            }}
              style={{
                padding: '4px 10px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              
              }}
            >
              Logout
            </button>
          </th>

            </tr>
          </MDBTableHead>
          <MDBTableBody>
            {users.map((user, index) => (
              <tr key={index}>
                 <td>{index + 1}</td>
             <td>
                  <img
                    src={`${server_url}/uploads/${user.image}`}
                    alt='profile'
                    style={{ width: '45px', height: '45px' }}
                    className='rounded-circle'
                  />
                </td>
                <td>
                  <p className='fw-bold mb-1'>{user.name}</p>
                </td>

                <td>
                  <p className='fw-normal mb-1'>{user.email}</p>
                </td>
                <td>
                  <p style={{marginLeft:'9px'}} className='fw-normal mb-1'>{user.gender}</p>
                </td>
                <td>
                  <p style={{marginLeft:'20px'}} className='fw-normal mb-1'>{user.dateOfRegister
                        ? new Date(user.dateOfRegister).toLocaleString()
                        : "N/A"}</p>
                </td>
                <td>
                 
                </td>
              </tr>
            ))}
          </MDBTableBody>
        </MDBTable>
      )}
    </div>
  );
};

export default ManageUsers;
