import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";
import Header from "../../components/header/header";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (isLoggedIn) {
      // Redirect to profile page if already logged in
      navigate('/profile');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.user) {
        // Store user session
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userName', response.data.user.name || formData.email.split('@')[0]);
        
        navigate('/topic');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrapper">
      <Header />
      <div className="flexbox main authMain">
        <div className="authContainer">
          <div className="authCard">
            <h1 className="authTitle">Welcome Back</h1>
            <p className="authSubtitle">Sign in to continue your learning journey</p>
            
            <form onSubmit={handleSubmit} className="authForm">
              <div className="inputGroup">
                <div className="inputContainer authInput">
                  <Mail className="inputIcon" size={24} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="inputGroup">
                <div className="inputContainer authInput">
                  <Lock className="inputIcon" size={24} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="errorMessage">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className="SubmitButton authSubmit"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <div className="authFooter">
              <p>Don't have an account? <Link to="/register" className="authLink">Sign up</Link></p>
              <p className="demoLink">
                Or <Link to="/topic" className="authLink">try demo without registration</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
