import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function AppLayout() {
  return (
    <div className=''>
      <Header />
      <main className='h-full grid place-items-center'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
