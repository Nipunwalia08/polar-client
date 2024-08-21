'use client';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Modal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Admin, TeamMembers, auth } from '@firebase/config';
import usePersistStore from '@store/usePersistStore';
import useUserStore from '@store/useStore';
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getDocs, query, where } from 'firebase/firestore';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const navigate = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useUserStore(); // Use the Zustand store
  const { setAdminId: setToken, setCompanyId } = usePersistStore();

  const validateForm = (): boolean => {
    let valid = true;

    if (formData.email.trim() === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Email is required',
      }));
      valid = false;
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
    }

    if (formData.password === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Password is required',
      }));
      valid = false;
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
    }

    return valid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const adminQuery = query(Admin, where('email', '==', formData.email));
        const agentQuery = query(
          TeamMembers,
          where('email', '==', formData.email)
        );

        const adminSnapshot = await getDocs(adminQuery);
        const agentSnapshot = await getDocs(agentQuery);

        const admin = adminSnapshot.docs.map((doc) => doc.data())[0];
        const agent = agentSnapshot.docs.map((doc) => doc.data())[0];

        if (admin) {
          await signInWithEmailAndPassword(auth, formData.email, formData.password);
          setUser(formData.email, true);
          navigate.push('/dashboard');
          setToken(admin.id);
          setCompanyId(admin.businessId);
          toast.success('Successfully signed in as Admin');
          return;
        }

        if (agent) {
          await signInWithEmailAndPassword(auth, formData.email, formData.password);
          setUser(formData.email, false);
          navigate.push('/dashboard');
          toast.success('Successfully signed in as Team');
          setToken(agent.id);
          return;
        }

        toast.error('Email not found. Please register first.');
      } catch (error) {
        console.error('Error during sign-in:', error);
        toast.error('Sign-in failed');
      }
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordReset = async () => {
    if (resetEmail.trim() === '') {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent');
      setShowPasswordReset(false);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email');
    }
  };


  const initializeFacebookSdk = (): Promise<void> => {
  return new Promise((resolve) => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: 'your-app-id', // Replace with your Facebook App ID
        cookie: true,
        xfbml: true,
        version: 'v12.0',
      });

      window.FB.AppEvents.logPageView();
      resolve();
    };

    // Load the SDK asynchronously
    (function (d, s, id) {
      let js: HTMLScriptElement;
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement('script') as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode!.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  });
};
  useEffect(() => {
  const initFacebook = async () => {
    await initializeFacebookSdk();
    setFacebookReady(true);
  };
  initFacebook();
}, []);

const [facebookReady, setFacebookReady] = useState(false);

const handleFacebookLogin = () => {
  if (typeof window !== 'undefined' && typeof window.FB !== 'undefined' && facebookReady) {
    window.FB.login(
      (response: FB.StatusResponse) => {
        if (response.authResponse) {
          console.log(response)
          console.log('Welcome! Fetching your information...');
          window.FB.api('/me', { fields: 'name,email' }, (userInfo: any) => {
            console.log(userInfo);
            toast.success(`Logged in as ${userInfo.name}`);
            // Perform your login logic here
            navigate.push('/dashboard');
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
          toast.error('Facebook login failed');
        }
      },
      { scope: 'public_profile,email' }
    );
  } else {
    console.error('Facebook SDK is not loaded');
    toast.error('Facebook SDK is not loaded');
  }
};
  

  return (
    <Stack className="flex flex-col items-center justify-center h-screen">
      <Stack
        className="flex flex-col items-left bg-white p-8 pt-10 rounded-[16px] w-full max-w-md"
        sx={{ border: '1px solid #8D8D8D' }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          className="font-[500] text-[34px]"
        >
          Sign into your
          <br />
          account
        </Typography>
        <form onSubmit={handleSignIn} className="w-full">
          <Stack spacing={2} mt={2}>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              required
            />

            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormControlLabel
                className="text-[#999] text-sm"
                control={<Checkbox name="rememberMe" color="primary" />}
                label="Remember me on this device"
              />
              <Link
                href="#"
                variant="body2"
                onClick={() => setShowPasswordReset(true)}
                className="text-[#333] no-underline text-sm hover:underline"
              >
                Forgot password?
              </Link>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="normal-case font-[400] rounded-lg text-[16px]"
              sx={{ mt: '24px !important', padding: '12px 70px' }}
            >
              Sign in
            </Button>

            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              className="normal-case font-[400] rounded-lg text-[16px]"
              sx={{
                mt: '24px !important',
                padding: '12px 70px',
                backgroundColor: '#3b5998',
                '&:hover': {
                  backgroundColor: '#365492',
                },
              }}
              onClick={handleFacebookLogin}
            >
              Login with Facebook
            </Button>
          </Stack>
        </form>

        <Modal
          open={showPasswordReset}
          onClose={() => setShowPasswordReset(false)}
          aria-labelledby="password-reset-modal"
          aria-describedby="password-reset-modal-description"
        >
          <Box
            className="bg-white w-full max-w-sm p-8 rounded-lg"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography
              id="password-reset-modal"
              variant="h6"
              component="h2"
              gutterBottom
            >
              Reset Password
            </Typography>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePasswordReset}
              sx={{ mt: 3 }}
            >
              Send Reset Email
            </Button>
          </Box>
        </Modal>
      </Stack>
    </Stack>
  );
};

export default SignIn;
