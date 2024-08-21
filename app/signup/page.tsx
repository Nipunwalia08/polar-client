'use client'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { auth } from '@firebase/config'
import {
  addAdminAndCompany,
  checkAdminExistenceEmail,
  checkBusinessIdExistence,
  checkTeamExistenceEmail,
} from '@firebase/firebaseInteractor'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const LoginSignup: React.FC = () => {
  const navigate = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    businessId: '',
    webhookSecret: '',
    companyName: '',
    phoneNumberId: '',
  })
  const [errors, setErrors] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    businessId: '',
    webhookSecret: '',
    companyName: '',
    phoneNumberId: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const validateForm = () => {
    let valid = true

    if (formData.phoneNumberId.trim() === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumberId: 'Phone number ID is required',
      }))
      valid = false
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumberId: '',
      }))
    }

    if (formData.companyName.trim() === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        companyName: 'Company name is required',
      }))
      valid = false
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        companyName: '',
      }))
    }

    if (formData.businessId.trim() === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        businessId: 'Business ID is required',
      }))
      valid = false
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        businessId: '',
      }))
    }

    if (formData.webhookSecret.trim() === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        webhookSecret: 'Webhook secret is required',
      }))
      valid = false
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        webhookSecret: '',
      }))
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Invalid email address',
      }))
      valid = false
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: '',
      }))
    }

    const whatsapp = /^\d{10}$/
    if (!whatsapp.test(formData.phoneNumber)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: 'Invalid mobile number',
      }))
      valid = false
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: '',
      }))
    }

    if (formData.password.length < 8) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Password must be at least 8 characters long',
      }))
      valid = false
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: '',
      }))
    }

    return valid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      try {
        // Check if admin with the given email already exists
        const adminExists = await checkAdminExistenceEmail(formData.email)
        if (adminExists) {
          toast.error('Email already exists as Admin')
          return
        }
        const teamExists = await checkTeamExistenceEmail(formData.email)
        if (teamExists) {
          toast.error('Email already exists as Team')
          return
        }
        const businessIdExists = await checkBusinessIdExistence(
          formData.businessId,
        )
        if (businessIdExists) {
          toast.error('Business Id already exists')
          return
        }
        // Firebase signup
        const response = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        )

        if (response.user) {
          const adminData = {
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            businessId: formData.businessId,
            webhookSecret: formData.webhookSecret,
            companyName: formData.companyName,
            phoneNumberId: formData.phoneNumberId,
            steps: 1, // or any other additional fields
          }
          const companyData = {
            phoneNumberID: formData.phoneNumberId,
          }
          // Add admin data to Firestore
          await addAdminAndCompany(adminData, companyData, formData.businessId,formData.companyName)
          // await addAdminToFirestore(adminData);
          // await addCompanyToFirestore(companyData,formData.businessId)
          navigate.push('/')
          toast.success('Successfully signed up')
        }
      } catch (error) {
        console.error('Error during signup:', error)
        toast.error('Signup failed')
      }
    }
  }



  
  

  return (
    <Stack className="flex flex-col items-center justify-center h-screen ">
      <Stack
        className="flex flex-col items-left bg-white p-8 rounded-lg w-full max-w-md"
        sx={{ border: '1px solid #8D8D8D' }}
      >
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          className="font-[500] text-[34px] text-left"
        >
          Sign up for your
          <br />
          account
        </Typography>
        <form onSubmit={handleSignup} className="w-full">
          <Stack spacing={2}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            <Stack className="flex-row gap-2">
              <TextField
                label="Email"
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
                label="Company Name"
                variant="outlined"
                fullWidth
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                error={!!errors.companyName}
                helperText={errors.companyName}
                required
              />
            </Stack>
            <Stack className="flex-row gap-2">
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                required
              />
              <TextField
                label="Phone Number ID"
                variant="outlined"
                fullWidth
                name="phoneNumberId"
                value={formData.phoneNumberId}
                onChange={handleInputChange}
                error={!!errors.phoneNumberId}
                helperText={errors.phoneNumberId}
                required
              />
            </Stack>
            <TextField
              label="Business ID"
              variant="outlined"
              fullWidth
              name="businessId"
              value={formData.businessId}
              onChange={handleInputChange}
              error={!!errors.businessId}
              helperText={errors.businessId}
              required
            />

            <TextField
              label="Webhook Secret"
              variant="outlined"
              fullWidth
              name="webhookSecret"
              value={formData.webhookSecret}
              onChange={handleInputChange}
              error={!!errors.webhookSecret}
              helperText={errors.webhookSecret}
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

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="normal-case font-[400] rounded-lg text-[16px]"
              sx={{ mt: '24px !important', padding: '12px 70px' }}
            >
              Sign Up
            </Button>

            <Stack className="mt-2 text-center">
              <Stack className="flex-row items-center justify-center gap-2">
                Already have an account?
                <Button
                  className=" hover:underline normal-case"
                  onClick={() => navigate.push('/')}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Stack>
  )
}

export default LoginSignup
