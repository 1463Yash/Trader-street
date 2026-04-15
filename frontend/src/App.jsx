import Home from "./components/Home";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}
