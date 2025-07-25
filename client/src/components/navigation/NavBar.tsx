import './Navigation.css';

import { Nav, NavDropdown } from 'react-bootstrap';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ChatList from '../chatlist/ChatList';
import { NavLink } from 'react-router-dom';
import React from 'react';

const NavBar = () => {
  const handleSelect = (eventKey: string | null) =>
    alert(`selected ${eventKey}`);

  return (
    <Nav variant="pills" defaultActiveKey="/chatlist" onSelect={handleSelect}>
      <Nav.Item>
        <Nav.Link as={NavLink} to="/chatlist">
          Chatlist
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="/chatbox">
          Chatbox
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to="/chatinfo">
          Chatinfo
        </Nav.Link>
      </Nav.Item>
      <NavDropdown
        title="More..."
        id="nav-dropdown"
        menuVariant="dark"
        placement="right"
      >
        <NavDropdown.Item
          className="nav-dropdown-item"
          as={NavLink}
          to="/about"
        >
          About
        </NavDropdown.Item>
        <NavDropdown.Item
          className="nav-dropdown-item"
          as={NavLink}
          to="/settings"
        >
          Settings
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item
          className="nav-dropdown-item"
          as={NavLink}
          to="/login"
        >
          Login
        </NavDropdown.Item>
      </NavDropdown>
    </Nav>
  );
};

export default NavBar;
