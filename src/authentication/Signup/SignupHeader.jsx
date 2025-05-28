import { Link } from "react-router-dom";

function SignupHeader() {
  return (
    <div className='text-center'>
      <div className='flex items-center justify-center'>
        <Link to='/'>
          <img
            src='/logo_no_name_svg.svg'
            alt='logo'
            className='h-12'
          />
        </Link>
      </div>
      <h1 className='text-stone-200 text-2xl font-semibold pt-5'>
        Welcome To Murshedi
      </h1>
      <p className='text-sm text-stone-400'>
        have an account?{" "}
        <Link
          to='/login'
          className='text-stone-200'
        >
          Login
        </Link>
      </p>
    </div>
  );
}

export default SignupHeader;
