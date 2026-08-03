import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton, 
  Alert,
  Link,
  useTheme
} from '@mui/material';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { PhoneInput } from '../components/PhoneInput';

interface UserRecord {
  username: string;
  company?: string;
  phone?: string;
  email?: string;
  password?: string;
}

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [countryCode, setCountryCode] = useState('ID');
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();
  const theme = useTheme();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setWhatsappError(null);

    // Verify all fields filled
    if (!username.trim() || !company.trim() || !whatsapp.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      if (!whatsapp.trim()) {
        setWhatsappError('PLEASE FILL OUT THE FIELD');
      }
      return;
    }

    // Validate Phone (numbers only, between 8 and 13 digits)
    const isNumeric = /^\d+$/.test(whatsapp);
    if (!isNumeric) {
      setWhatsappError('Numbers only');
      setError('Phone Number must contain digits only.');
      return;
    }
    if (whatsapp.length < 8 || whatsapp.length > 13) {
      setWhatsappError('Must be between 8 and 13 digits.');
      setError('Phone Number must be between 8 and 13 digits.');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Store in localStorage registered users
    const registeredUsersJSON = localStorage.getItem('registeredUsers');
    let users: UserRecord[] = [];
    if (registeredUsersJSON) {
      try {
        users = JSON.parse(registeredUsersJSON);
      } catch {
        users = [];
      }
    }

    // Check if user already exists
    if (users.some((u) => u.username === username.trim())) {
      setError('Username already registered.');
      return;
    }

    const newUser: UserRecord = {
      username: username.trim(),
      company: company.trim(),
      phone: whatsapp,
      email: email.trim().toLowerCase(),
      password,
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    setSuccess('Registration successful! Redirecting to login page...');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
      }}
    >
      {/* Background Blur Orbs */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -150, 
          right: -150, 
          width: '40vw', 
          height: '40vw', 
          maxWidth: 500, 
          borderRadius: '50%', 
          filter: 'blur(120px)', 
          pointerEvents: 'none', 
          zIndex: 0, 
          opacity: 0.25, 
          background: `radial-gradient(circle, ${theme.palette.primary.main} 0%, transparent 70%)`,
        }}
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: -150, 
          left: -150, 
          width: '40vw', 
          height: '40vw', 
          maxWidth: 500, 
          borderRadius: '50%', 
          filter: 'blur(120px)', 
          pointerEvents: 'none', 
          zIndex: 0, 
          opacity: 0.25, 
          background: `radial-gradient(circle, ${theme.palette.secondary.main} 0%, transparent 70%)`,
        }}
      />

      <Card sx={{ maxWidth: 500, width: '100%', mx: 2, zIndex: 10 }}>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3.5, '&:last-child': { pb: 4 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                component="img"
                src="/logoOnlyBio.png"
                alt="CCTV Analytics Logo"
                sx={{ 
                  width: 32, 
                  height: 32, 
                  objectFit: 'contain',
                }}
              />
              <Typography variant="h6" component="span" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
                CCTV Analytics
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Get started by registering a new organization account.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              size="medium"
              placeholder="e.g. johndoe"
            />

            <TextField
              fullWidth
              label="Company Name"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              variant="outlined"
              size="medium"
              placeholder="e.g. Acme Corporation"
            />

            <PhoneInput
              value={whatsapp}
              onChange={(val: string) => {
                setWhatsapp(val);
                if (val.trim()) {
                  setWhatsappError(null);
                }
              }}
              countryCode={countryCode}
              onCountryCodeChange={(code: string) => setCountryCode(code)}
              error={!!whatsappError}
              helperText={whatsappError || undefined}
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              size="medium"
              placeholder="e.g. contact@company.com"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              size="medium"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              size="medium"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              Sign Up
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
