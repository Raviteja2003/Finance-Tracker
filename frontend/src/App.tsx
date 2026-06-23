import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "./context/ThemeContext";

// Router and routes (LandingPage, Login/Register, ProtectedRoute + AppLayout
// with Dashboard/Accounts/Transactions/Budgets/Analytics/ChatAssistant) are
// wired up here in Phase 1.
export default function App() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <div>Finance Tracker — Phase 1 setup in progress</div>
      </Provider>
    </ThemeProvider>
  );
}
