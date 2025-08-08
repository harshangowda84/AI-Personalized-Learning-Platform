import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./header.css";
import { CircleUser, Home, LogOut, User, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

const Header = ({ showBackButton = false, onBackClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const userName = localStorage.getItem('userName') || 'User';

  // Debug logging
  console.log('Header - isLoggedIn:', isLoggedIn, 'userName:', userName);

  // Check if we're on the profile page
  const isProfilePage = location.pathname === '/profile';
  const isTopicPage = location.pathname === '/topic';

  // Track navigation for back button
  useEffect(() => {
    // Don't store profile page as previous page
    if (location.pathname !== '/profile') {
      sessionStorage.setItem('previousPage', location.pathname);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
    setShowUserMenu(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    // Also clear any session storage
    sessionStorage.removeItem('previousPage');
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/topic');
  };

  const handleBackClick = (e) => {
    e.preventDefault();
    console.log('Back button clicked');
    
    if (onBackClick) {
      onBackClick();
    } else {
      // Store where we came from in sessionStorage for better tracking
      const previousPage = sessionStorage.getItem('previousPage');
      
      if (previousPage && previousPage !== '/profile') {
        console.log('Going back to previous page:', previousPage);
        navigate(previousPage);
      } else {
        console.log('No previous page stored, going to topic page');
        navigate('/topic');
      }
    }
  };

  return (
    <header>
      {isProfilePage ? (
        <button 
          className="headerBackButton"
          onClick={handleBackClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            height: '40px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'translateX(-3px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
      ) : (
        <img src="logo.png" alt="LearnX" height={40} className="logo" />
      )}
      
      {/* Only show home button if not on topic page */}
      {!isTopicPage && (
        <button 
          className="homeButton"
          onClick={handleHomeClick}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            height: '45px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(209, 78, 196, 0.1)';
            e.target.style.borderColor = '#D14EC4';
            e.target.style.transform = 'translateX(-50%) translateY(-2px)';
            e.target.style.boxShadow = '0 5px 15px rgba(209, 78, 196, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'translateX(-50%) translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <Home size={24} strokeWidth={2} />
          Home
        </button>
      )}
      
      {isLoggedIn ? (
        <div className="userSection">
          <div 
            className="userInfo"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="userName">{userName}</span>
            <CircleUser size={40} strokeWidth={1} color="white"></CircleUser>
          </div>
          
          {showUserMenu && (
            <div className="userMenu">
              <NavLink to="/profile" className="menuItem" onClick={() => setShowUserMenu(false)}>
                <User size={18} />
                Profile
              </NavLink>
              <button className="menuItem logoutBtn" onClick={handleLogout}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="authButtons">
          <NavLink to="/login" className="headerAuthBtn">Login</NavLink>
          <NavLink to="/register" className="headerAuthBtn primary">Sign Up</NavLink>
        </div>
      )}
      
      {/* Enhanced Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="logoutModal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={cancelLogout}
        >
          <div 
            className="logoutModalContent"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2.5rem',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center',
              color: 'white',
              position: 'relative',
              animation: 'slideUp 0.3s ease-out',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff4757, #ff3742)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              animation: 'pulse 2s infinite'
            }}>
              <LogOut size={28} color="white" />
            </div>

            {/* Title */}
            <h3 style={{ 
              margin: '0 0 1rem', 
              fontSize: '1.5rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #D14EC4, #AFD14E)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Confirm Logout
            </h3>

            {/* Message */}
            <p style={{ 
              margin: '0 0 2rem', 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Are you sure you want to logout?<br />
              <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                You'll need to sign in again to access your account.
              </span>
            </p>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={cancelLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  minWidth: '120px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 5px 15px rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff4757, #ff3742)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  minWidth: '120px',
                  boxShadow: '0 4px 15px rgba(255, 71, 87, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ff3742, #ff2f3a)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 71, 87, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ff4757, #ff3742)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 71, 87, 0.3)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
