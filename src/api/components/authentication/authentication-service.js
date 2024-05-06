const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

let loginAttempts = 0;
const LOGIN_ATTEMPTS_LIMIT = 5;
const LOGIN_TIMEOUT_MINUTES = 30 * 60;

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  let loginMaxAttempts = false;
  const user = await authenticationRepository.getUserByEmail(email);

  if (!user) {
    loginAttempts++;
  }

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);
  
  if (!passwordChecked) {
    loginAttempts++;
  }
  
  // Check if login attempts limit exceeded
  if (loginAttempts >= LOGIN_ATTEMPTS_LIMIT) {
    const currentTime = new Date();
    const lastLoginAttemptTime = user.lastLoginAttemptTime || new Date(); // Inisialisasi atau gunakan waktu saat ini jika tidak ada nilai sebelumnya
    // Calculate the time difference in minutes
    const timeDiffMinutes = Math.floor((currentTime - lastLoginAttemptTime)/(1000*60));
    console.log(timeDiffMinutes)
    // Return true if still within timeout period
    if (timeDiffMinutes < LOGIN_TIMEOUT_MINUTES) {
      loginMaxAttempts = true;
    }
  }
  console.log(loginAttempts)
  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  const successLogin = user && passwordChecked;
  console.log(successLogin)
  if (successLogin) {

    // Reset attempts upon successful login
    loginAttempts = 0;

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
      successLogin: true,
    };
  } else {
    return {
      loginMaxAttempts: loginMaxAttempts,
      successLogin: false,
    }; 
  }
}
module.exports = {
  checkLoginCredentials,
};
