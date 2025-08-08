import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";
import Header from "../../components/header/header";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import axios from "axios";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    // Simple validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data.user) {
        // Store user session
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userName', response.data.user.name);
        
        navigate('/topic');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
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
            <h1 className="authTitle">Create Account</h1>
            <p className="authSubtitle">Start your personalized learning journey today</p>
            
            <form onSubmit={handleSubmit} className="authForm">
              <div className="inputGroup">
                <div className="inputContainer authInput">
                  <User className="inputIcon" size={24} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

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

              <div className="inputGroup">
                <div className="inputContainer authInput">
                  <Lock className="inputIcon" size={24} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
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
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="authFooter">
              <p>Already have an account? <Link to="/login" className="authLink">Sign in</Link></p>
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

export default RegisterPage;
