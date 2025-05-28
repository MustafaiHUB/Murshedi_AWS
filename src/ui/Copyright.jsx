function Copyright({ className }) {
  return (
    <p
      className={`font-semibold text-stone-300 text-xs ${
        className && className
      }`}
    >
      Copyright &copy; {new Date().getFullYear()} CPE Graduation Project | All
      Rights Reserved
    </p>
  );
}

export default Copyright;
