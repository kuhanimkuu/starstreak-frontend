import React from "react";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import RouterView from "./router";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col transition-colors duration-300">

        <Header />

        <main className="flex-1">
          <RouterView />
        </main>

        <Footer />

      </div>
    </ThemeProvider>
  );
}
