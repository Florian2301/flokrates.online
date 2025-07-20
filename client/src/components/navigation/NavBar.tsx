import './Navigation.css';

import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import React from 'react';

const NavBar = () => {
  const handleSelect = (eventKey: string | null) =>
    alert(`selected ${eventKey}`);

  return (
    <Nav variant="pills" defaultActiveKey="1" onSelect={handleSelect}>
      <Nav.Item>
        <Nav.Link eventKey="1" href="#/home">
          Chatlist
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="2" title="Item">
          Chatbox
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="3">Chatinfo</Nav.Link>
      </Nav.Item>
      <NavDropdown
        title="More..."
        id="nav-dropdown"
        menuVariant="dark"
        placement="right"
      >
        <NavDropdown.Item eventKey="4.1">About</NavDropdown.Item>
        <NavDropdown.Item eventKey="4.2">Settings</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item eventKey="4.3">Login</NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );
};

export default NavBar;
