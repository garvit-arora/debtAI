import { createContext, useContext, useState } from "react";
import Loader from "../components/Loader";

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {loading && <Loader />}
      {children}
    </LoaderContext.Provider>
  );
};
