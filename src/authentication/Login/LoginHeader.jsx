import { Link } from "react-router-dom";

function LoginHeader() {
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
        Welcome Back!
      </h1>
    </div>
  );
}

export default LoginHeader;
