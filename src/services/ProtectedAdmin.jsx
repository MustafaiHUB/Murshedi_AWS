import { useEffect } from "react";
import { replace, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state.user.isAdmin);
  useEffect(
    function () {
      if (!isAdmin) {
        navigate("/login", replace);
      }
    },
    [navigate, dispatch, isAdmin]
  );
  return isAdmin ? children : null;
}

export default ProtectedRoute;
