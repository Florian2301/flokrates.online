import './NavBar.css';

import { Dropdown, Nav, NavDropdown } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, selectIsAuthenticated } from '../../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch } from '../../store/store';
import { Menu } from 'lucide-react';

const NavBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuthenticated);
  const nav = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    nav('/login');
  };

  return (
    <Nav variant="pills">
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
      <Nav.Item className="d-none d-sm-block">
        <Nav.Link as={NavLink} to="/chatinfo">
          Chatinfo
        </Nav.Link>
      </Nav.Item>
      <NavDropdown
        title={<Menu size={18} strokeWidth={1.5} />}
        menuVariant="dark"
        id="menu"
        drop="end"
      >
        <NavDropdown.Item
          className="nav-dropdown-item d-sm-none"
          as={NavLink}
          to="/chatinfo"
        >
          Chatinfo
        </NavDropdown.Item>
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
          Language
        </NavDropdown.Item>
        {!isAuth ? (
          <NavDropdown.Item
            className="nav-dropdown-item"
            as={NavLink}
            to="/login"
          >
            Login
          </NavDropdown.Item>
        ) : (
          <NavDropdown.Item
            className="nav-dropdown-item"
            onClick={handleLogout}
          >
            Logout
          </NavDropdown.Item>
        )}
      </NavDropdown>
    </Nav>
  );
};

export default NavBar;
