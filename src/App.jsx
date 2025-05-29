// Packages
import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages
const Chatbot = lazy(() => import("./pages/Chatbot"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Admin = lazy(() => import("./features/admin/Admin"));
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Features
const NewChat = lazy(() => import("./features/Chatbot/Chat/NewChat"));
import Chat from "./features/Chatbot/Chat/Chat";
import LoaderFullPage from "./ui/LoaderFullPage";
// Loader & Actions
import { loader as conversationLoader } from "./features/Chatbot/Chat/Chat";
// Services & Context
import { SidebarProvider } from "./context/SidebarContext";
import ProtectedRoute from "./services/ProtectedRoute";
import ProtectedAdmin from "./services/ProtectedAdmin";
import Terms from "./pages/Terms";

// Halls and Labs Locations - For Testing Purposes Only.
const locations = [
  { name: "CPE101", coords: [32.00978, 35.875672] },
  { name: "حاسوب 101", coords: [32.00978, 35.875672] },
  { name: "حاسوب101", coords: [32.00978, 35.875672] },

  { name: "CPE102", coords: [32.010931, 35.876031] },
  { name: "حاسوب 102", coords: [32.010931, 35.876031] },
  { name: "حاسوب102", coords: [32.010931, 35.876031] },

  { name: "Embedded Lab", coords: [32.01008, 35.875252] },
  { name: "Lab Embedded", coords: [32.01008, 35.875252] },
  { name: "امبيديد لاب", coords: [32.01008, 35.875252] },
  { name: "مختبر امبيديد", coords: [32.01008, 35.875252] },
  { name: "مختبر الانظمة المضمنة", coords: [32.01008, 35.875252] },
  { name: "مختبر الأنظمة المضمنة", coords: [32.01008, 35.875252] },

  { name: "Digital Logic Lab", coords: [32.01008, 35.875252] },
  { name: "Lab Digital Logic", coords: [32.01008, 35.875252] },
  { name: "مختبر المنطق الرقمي", coords: [32.01008, 35.875252] },

  { name: "Computer Design Lab", coords: [32.00978, 35.875672] },
  { name: "Lab Computer Design", coords: [32.00978, 35.875672] },
  { name: "مختبر التصميم الرقمي", coords: [32.00978, 35.875672] },
  { name: "مختبر التصميم", coords: [32.00978, 35.875672] },

  { name: "Network Advanced Lab", coords: [32.00978, 35.875672] },
  { name: "Networks Lab", coords: [32.00978, 35.875672] },
  { name: "Lab Network Advanced", coords: [32.00978, 35.875672] },
  { name: "Lab Networks", coords: [32.00978, 35.875672] },
  { name: "مختبر الشبكات المتقدم", coords: [32.00978, 35.875672] },
  { name: "مختبر الشبكات", coords: [32.00978, 35.875672] },

  { name: "Computer Application Lab", coords: [32.00978, 35.875672] },
  { name: "Lab Computer Application", coords: [32.00978, 35.875672] },
  { name: "Python Lab", coords: [32.00978, 35.875672] },
  { name: "Lab Python", coords: [32.00978, 35.875672] },
  { name: "مختبر تطبيقات الحاسوب", coords: [32.00978, 35.875672] },
  { name: "مختبر البايثون", coords: [32.00978, 35.875672] },
  { name: "مختبر بايثون", coords: [32.00978, 35.875672] },

  { name: "Parallel Lab", coords: [32.00978, 35.875672] },
  { name: "Lab Parallel", coords: [32.00978, 35.875672] },
  { name: "Lab Parallel Processing", coords: [32.00978, 35.875672] },
  { name: "Parallel Processing Lab", coords: [32.00978, 35.875672] },
  { name: "مختبر الباراليل", coords: [32.00978, 35.875672] },
  { name: "مختبر المعالجات المتوازية", coords: [32.00978, 35.875672] },
];
localStorage.setItem("locations", JSON.stringify(locations));

// Testing Purposes Only
// const fake_user = {
//   firstName: "Student",
//   lastName: "Account",
//   email: "example@gmail.com",
//   blindMode: false,
//   appUserRole: "USER",
//   userId: "12312312",
// };

// localStorage.setItem("isAuthenticated", true);
// localStorage.setItem("token", "asdasdasdjkl;jqwk920314890324");
// localStorage.setItem("questions", JSON.stringify([]));
// localStorage.setItem("user", JSON.stringify(fake_user));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoaderFullPage />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<LoaderFullPage />}>
        <Signup />
      </Suspense>
    ),
  },
  {
    path: "/chatbot",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<LoaderFullPage />}>
          <Chatbot />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: ":chatId",
        element: (
          <Suspense fallback={<LoaderFullPage />}>
            <Chat />
          </Suspense>
        ),
        loader: conversationLoader,
      },
      {
        path: "new",
        element: (
          <Suspense fallback={<LoaderFullPage />}>
            <NewChat />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/confirm",
    element: (
      <Suspense fallback={<LoaderFullPage />}>
        <ConfirmEmail />
      </Suspense>
    ),
  },
  {
    path: "/forgot",
    element: (
      <Suspense fallback={<LoaderFullPage />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: "/resetpassword",
    element: (
      <Suspense fallback={<LoaderFullPage />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: "/terms",
    element: (
      <Suspense fallback={<LoaderFullPage />}>
        <Terms />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdmin>
        <Suspense fallback={<LoaderFullPage />}>
          <Admin />
        </Suspense>
      </ProtectedAdmin>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
function App() {
  return (
    <SidebarProvider>
      <RouterProvider router={router} />
    </SidebarProvider>
  );
}

export default App;
