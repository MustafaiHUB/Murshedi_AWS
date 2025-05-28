import { useEffect } from "react";
import LoaderFullPage from "../ui/LoaderFullPage";
import { useNavigate } from "react-router-dom";
import SpecialText from "../ui/SpecialText";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../authentication/userSlice";
import { confirmEmail } from "../services/apiUser";
function ConfirmEmail() {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const signupUser = useSelector((state) => state.user.signupUser);
  const { email, token, user } = signupUser;

  useEffect(
    function () {
      let intervalId;

      const startActivationPolling = async (email, token, user) => {
        // Make sure we have the required data to start polling
        if (!email || !token || !user) {
          console.error("Missing required data for email confirmation");
          return;
        }

        // Initial check (no need to wait 5 seconds for first check)
        try {
          const data = await confirmEmail(email);
          if (data.activated) {
            dispatch(login(user, token, []));
            navigate("/chatbot/new");
            return; // Exit early if already activated
          }
        } catch (error) {
          console.error(
            "Error during initial email confirmation check:",
            error
          );
        }

        // Start polling if not activated on first check
        intervalId = setInterval(async () => {
          try {
            const data = await confirmEmail(email);
            if (data.activated) {
              clearInterval(intervalId); // Stop polling
              dispatch(login(user, token, []));
              navigate("/chatbot/new");
            }
          } catch (error) {
            console.error("Error during email confirmation polling:", error);
          }
        }, 5000); // Check every 5 seconds
      };

      startActivationPolling(email, token, user);

      // Clean up function to clear the interval when component unmounts
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    },
    [navigate, email, token, user, dispatch]
  );
  return (
    <div className='relative grid place-items-center h-[100dvh]'>
      <SpecialText className='z-40 -mt-64'>
        Please Confirm Your Email
      </SpecialText>
      <LoaderFullPage />
    </div>
  );
}

export default ConfirmEmail;
