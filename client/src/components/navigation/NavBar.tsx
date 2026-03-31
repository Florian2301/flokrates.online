import './NavBar.css';

import { Nav, NavDropdown } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, selectIsAuthenticated } from '../../store/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import type { AppDispatch } from '../../store/store';
import { Menu } from 'lucide-react';
import { setSelectedChat } from '../../store/chatsSclice';

//import { selectLanguage, setLanguage } from '../../store/languageSlice';

const NavBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuth = useSelector(selectIsAuthenticated);
  const nav = useNavigate();
  //const lang = useSelector(selectLanguage); Maybe using it later for language switcher in the menu

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(setSelectedChat(null));
    nav('/login');
  };

  function useIsMobile(breakpointPx = 576) {
    const [isMobile, setIsMobile] = useState(
      () => window.innerWidth < breakpointPx
    );

    useEffect(() => {
      const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, [breakpointPx]);

    return isMobile;
  }

  const isMobile = useIsMobile(576);

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
        drop={isMobile ? 'down' : 'end'}
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
          Project
        </NavDropdown.Item>
        <NavDropdown.Item
          className="nav-dropdown-item"
          as={NavLink}
          to="/settings"
        >
          Settings
        </NavDropdown.Item>
        <NavDropdown.Item
          className="nav-dropdown-item"
          as={NavLink}
          to="/legal"
        >
          Legal
        </NavDropdown.Item>
        <NavDropdown.Divider />
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
