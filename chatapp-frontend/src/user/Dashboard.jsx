import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import { getAcceptedRequestsAPI, sendmessageAPI, getMessagesAPI, deleteMessageAPI } from '../../Service/allapi';
import { server_url } from '../../Service/server_url';
import Navbar from '../user/Navbar';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInputGroup, MDBIcon } from 'mdb-react-ui-kit';
import socket from '../socket';
import EmojiPicker from 'emoji-picker-react';

function Dashboard() {
  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState({});
  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');
  const userImage = sessionStorage.getItem('userImage') || 'default.jpg';
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const messageIds = useRef(new Set());

  // Fetch accepted users
  const fetchAccepted = async () => {
    try {
      if (!token || !userId) return;

      const headers = { Authorization: `Bearer ${token}` };
      const res = await getAcceptedRequestsAPI(headers);
      const usersWithLastMessages = await Promise.all(
        (res?.data || []).map(async (user) => {
          const msgRes = await getMessagesAPI(userId, user._id, headers);
          const msgs = msgRes?.data || [];
          return {
            ...user,
            lastMessage: msgs.length ? msgs[msgs.length - 1] : null,
          };
        })
      );
      setAcceptedUsers(usersWithLastMessages);
    } catch (err) {
      console.error('Error fetching accepted users or messages:', err);
      setAcceptedUsers([]);
    }
  };

  // Fetch messages for selected user
  const fetchMessages = async (receiverId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await getMessagesAPI(userId, receiverId, headers);
      const fetchedMessages = res?.data || [];
      messageIds.current.clear();
      setMessages([]);
      fetchedMessages.forEach((msg) => {
        messageIds.current.add(msg._id);
      });
      setMessages(fetchedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
    setIsDropdownOpen({});
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = { sender: userId, receiver: selectedUser._id, content: newMessage };
      const res = await sendmessageAPI(body, headers);
      const sentMessage = res.data;

      if (!messageIds.current.has(sentMessage._id)) {
        setMessages((prev) => [...prev, sentMessage]);
        messageIds.current.add(sentMessage._id);
      }

      socket.emit('send_message', {
        sender: userId,
        receiver: selectedUser._id,
        content: newMessage,
        timestamp: sentMessage.timestamp,
        _id: sentMessage._id,
      });

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await deleteMessageAPI(messageId, headers);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      messageIds.current.delete(messageId);
      socket.emit('message_deleted', { messageId, receiver: selectedUser._id });
      setIsDropdownOpen((prev) => ({ ...prev, [messageId]: false }));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  // Toggle dropdown for a specific message
  const toggleDropdown = (messageId) => {
    setIsDropdownOpen((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userId && token) {
      fetchAccepted();
      socket.emit('register_user', userId);

      const handleRequestAccepted = () => {
        console.log('Request accepted event received');
        fetchAccepted();
      };

      const handleReceiveMessage = (message) => {
        console.log('Received message:', message);
        if (
          message._id &&
          !messageIds.current.has(message._id) &&
          message.sender !== userId &&
          (message.sender === selectedUser?._id || message.receiver === selectedUser._id)
        ) {
          setMessages((prev) => [...prev, message]);
          messageIds.current.add(message._id);
        }
      };

      const handleMessageDeleted = ({ messageId }) => {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        messageIds.current.delete(messageId);
        setIsDropdownOpen((prev) => ({ ...prev, [messageId]: false }));
      };

      socket.on('request_accepted', handleRequestAccepted);
      socket.on('receive_message', handleReceiveMessage);
      socket.on('message_deleted', handleMessageDeleted);

      return () => {
        socket.off('request_accepted', handleRequestAccepted);
        socket.off('receive_message', handleReceiveMessage);
        socket.off('message_deleted', handleMessageDeleted);
      };
    }
  }, [userId, token, selectedUser]);

  // Emoji
  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Navbar />
      <MDBContainer fluid style={{ flex: 1, padding: 0 }}>
        <MDBRow className="h-100 m-0">
          <MDBCol md="12" className="h-100 p-0">
            <MDBCard className="h-100">
              <MDBCardBody className="h-100 p-0">
                <MDBRow className="h-100 m-0">
                  {/* Contact List */}
                  <MDBCol md="6" lg="5" xl="4" className="p-0">
                    <div className="p-3" style={{ backgroundColor: '#f8f9fb', height: '100%' }}>
                      <MDBInputGroup className="rounded mb-3">
                        <input className="form-control" placeholder="Search" type="search" />
                        <span className="input-group-text border-0">
                          <MDBIcon fas icon="search" />
                        </span>
                      </MDBInputGroup>
                      <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
                        {acceptedUsers.length === 0 ? (
                          <p className="text-center mt-5 text-muted">No accepted users</p>
                        ) : (
                          acceptedUsers.map((u) => (
                            <li
                              key={u._id}
                              className={`p-2 border-bottom list-unstyled ${
                                selectedUser?._id === u._id ? 'bg-light' : ''
                              }`}
                              onClick={() => handleUserSelect(u)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex justify-content-between">
                                <div className="d-flex flex-row">
                                  <img
                                    src={`${server_url}/Uploads/${u.image || 'default.jpg'}`}
                                    onError={(e) => {
                                      e.target.src = `${server_url}/Uploads/default.jpg`;
                                    }}
                                    alt="avatar"
                                    width="60"
                                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                  <div className="pt-1 ps-4">
                                    <p className="fw-bold mb-0">{u.name}</p>
                                    <p className="small text-muted">You're now connected</p>
                                  </div>
                                </div>
                                <div className="pt-1">
                                  <p className="small text-muted mb-1">
                                    {u.lastMessage?.timestamp
                                      ? new Date(u.lastMessage.timestamp).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : new Date().toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                  </p>
                                  <span
                                    style={{ marginLeft: '20px' }}
                                    className="badge bg-danger rounded-pill"
                                  >
                                    •
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))
                        )}
                      </div>
                    </div>
                  </MDBCol>

                  {/* Chat Area */}
                  <MDBCol md="6" lg="7" xl="8" className="p-0" style={{ height: '100vh' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      {/* Chat Messages */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                        {!selectedUser ? (
                          <div className="d-flex flex-column align-items-center justify-content-center h-100">
                            <img
                              src="/messenger.png"
                              alt="Chat illustration"
                              className="mb-4"
                              style={{ width: '270px', marginTop: '25px', opacity: '0.7' }}
                            />
                            <p className="text-muted fs-5">Select a user to start chatting</p>
                          </div>
                        ) : (
                          <>
                            {messages.map((msg) => (
                              <div
                                key={msg._id}
                                className={`d-flex flex-row ${
                                  msg.sender === userId ? 'justify-content-end' : 'justify-content-start'
                                } mb-4 ${msg.sender !== userId ? 'ms-3' : ''}`}
                                style={{ marginLeft: '15px', marginRight: '15px' }}
                              >
                                {msg.sender !== userId && (
                                  <img
                                    src={`${server_url}/Uploads/${selectedUser.image || 'default.jpg'}`}
                                    alt="avatar"
                                    style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                                    onError={(e) => {
                                      e.target.src = `${server_url}/Uploads/default.jpg`;
                                    }}
                                  />
                                )}
                                <div style={{ position: 'relative' }}>
                                  <p
                                    className={`small p-2 ${
                                      msg.sender === userId ? 'me-3 text-white' : 'ms-3'
                                    } mb-1 rounded-3`}
                                    style={{
                                      backgroundColor: msg.sender === userId ? '#10b981' : '#d1fae5',
                                    }}
                                  >
                                    {msg.content}
                                  </p>
                                  <p
                                    className={`small ${
                                      msg.sender === userId ? 'me-3' : 'ms-3'
                                    } mb-3 rounded-3 text-muted ${
                                      msg.sender === userId ? '' : 'float-end'
                                    }`}
                                  >
                                    {new Date(msg.timestamp).toLocaleString()}
                                  </p>
                                  {msg.sender === userId && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                      <button
                                        className="btn btn-sm btn-light p-1"
                                        type="button"
                                        onClick={() => toggleDropdown(msg._id)}
                                        style={{ lineHeight: '1', padding: '2px 5px' }}
                                      >
                                        <MDBIcon fas icon="angle-down" />
                                      </button>
                                      {isDropdownOpen[msg._id] && (
                                        <ul
                                          className="dropdown-menu show"
                                          style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            zIndex: 1000,
                                            minWidth: '100px',
                                            backgroundColor: '#fff',
                                            border: '1px solid #ccc',
                                            listStyle: 'none',
                                            padding: '5px 0',
                                            margin: 0,
                                          }}
                                        >
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              style={{ padding: '5px 10px', cursor: 'pointer' }}
                                              onClick={() => handleDeleteMessage(msg._id)}
                                            >
                                              Delete
                                            </button>
                                          </li>
                                        </ul>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {msg.sender === userId && (
                                  <img
                                    src={`${server_url}/Uploads/${userImage}`}
                                    alt="avatar"
                                    style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                                    onError={(e) => {
                                      e.target.src = `${server_url}/Uploads/default.jpg`;
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </>
                        )}
                      </div>

                      {/* Message Input Area */}
                      {selectedUser && (
                        <div
                          className="text-muted d-flex justify-content-start align-items-center p-3 border-top"
                          style={{ marginRight: '25px' }}
                        >
                          <img
                            src={`${server_url}/Uploads/${userImage}`}
                            alt="avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                            onError={(e) => {
                              e.target.src = `${server_url}/Uploads/default.jpg`;
                            }}
                          />
                          <input
                            type="text"
                            className="form-control form-control-lg mx-3"
                            placeholder="Type message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <div style={{ position: 'relative' }}>
                            <a
                              className="ms-3 text-muted"
                              href="#!"
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                              <MDBIcon fas icon="smile" />
                            </a>
                            {showEmojiPicker && (
                              <div style={{ position: 'absolute', bottom: '100%', right: 0, zIndex: 1000 }}>
                                <EmojiPicker
                                  onEmojiClick={handleEmojiClick}
                                  width={300}
                                  height={400}
                                />
                              </div>
                            )}
                          </div>
                          <a className="ms-3" href="#!" onClick={handleSendMessage}>
                            <MDBIcon fas icon="paper-plane" />
                          </a>
                        </div>
                      )}
                    </div>
                  </MDBCol>
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default Dashboard;