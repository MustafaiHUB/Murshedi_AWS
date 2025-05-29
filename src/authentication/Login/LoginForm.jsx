import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, replace, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Button from "../../ui/Button";
import InputField from "../../ui/InputField";
import PasswordInput from "../../ui/PasswordInput";
import { login } from "../userSlice";
import Loader from "../../ui/Loader";
import { userLogin } from "../../services/apiUser";
function LoginForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  function handleSeePassword() {
    setSeePassword((seePassword) => !seePassword);
  }

  async function handleSubmitLogin(e) {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);

    if (!email && !password) {
      setEmailError(true);
      setPasswordError(true);
      return;
    }
    if (!email && password) {
      setEmailError(true);
      return;
    }
    if (email && !password) {
      setPasswordError(true);
      return;
    }

    try {
      setIsLoading(true);
      const user = {
        email: email,
        password: password,
      };

      const data = await userLogin(user);

      if (!data) {
        setEmailError(true);
        setPasswordError(true);
        return;
      }

      const newUser = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        blindMode: data.blind,
        userId: data.userId,
        appUserRole: data.appUserRole,
      };

      const token = data.token;
      const conversations = data.conversations;

      dispatch(login(newUser, token, conversations));
      navigate("/chatbot/new");

      // Clear fields
      setEmail("");
      setPassword("");
      setSeePassword(false);
    } catch (err) {
      setEmailError(true);
      setPasswordError(true);
      return;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmitLogin}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <InputField
        type='email'
        id='email'
        placeholder='example@email.com'
        value={email}
        onChange={setEmail}
        className={`${emailError ? "ring-1 ring-red-500" : ""}`}
      />
      <PasswordInput
        type='password'
        id='password'
        placeholder='Your Password'
        value={password}
        setPassword={setPassword}
        showPasswordMarker={false}
        seePassword={seePassword}
        handleSeePassword={handleSeePassword}
        className={`${passwordError ? "ring-1 ring-red-500" : ""}`}
      />

      <div className='w-fit ml-auto'>
        <Button
          className='text-stone-200 mb-5 mt-1'
          onClick={() => navigate("/forgot", replace)}
        >
          Forgot Password?
        </Button>
      </div>

      <Button
        type='primary'
        disabled={isLoading}
        className='flex justify-center'
      >
        {!isLoading ? "Login" : <Loader />}
      </Button>

      <p className='text-sm text-stone-400 text-center mt-1'>
        Don't have an account yet?{" "}
        <Link
          to='/signup'
          className='text-stone-200'
        >
          Sign up
        </Link>
      </p>
    </motion.form>
  );
}

export default LoginForm;
