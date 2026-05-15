---
title: "Login & Authentication"
description: "The Login page allows registered users to securely access the mobile application using their username and password credentials."
lastUpdated: May 15, 2026
---

# Login & Authentication

## Feature: User Sign In

### Description



- The Login page allows registered users to securely access the mobile application using their username and password credentials.

### Available Options



- Username Input Field

- Password Input Field

- Sign In Button

- Forgot Password Option

- Create Account Option

### Login Flow



- User opens the mobile application.

- User enters registered username.

- User enters password.

- User clicks on the Sign In button.

- System validates the credentials.

- On successful authentication, the user is redirected to the Dashboard/Home screen.

### Forgot Password Flow



- User clicks on Forgot Password.

- System redirects the user to password recovery screen.

- User enters registered mobile number/email.

- Verification process is completed through OTP or registered verification method.

- User creates a new password.

- User logs in using the updated password.

- Create Account Feature

- The application provides a Create Account option for new users.

### Create Account Flow



- User clicks on Create Account.

- User enters required registration details.

- User submits the registration form.

- System validates entered details.

- Account is created successfully.

- User can log in using newly created credentials.

### Validations



- Username field should not be empty.

- Password field should not be empty.

- Invalid credentials should display an error message.

- Password should meet defined security criteria.

### Expected Result



- Registered users should be able to log in successfully.

- New users should be able to create an account successfully.

- Users should be able to reset forgotten passwords successfully.
