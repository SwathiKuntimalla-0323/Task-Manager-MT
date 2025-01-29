import React, { createContext, useContext, useState } from 'react';
import Loader from './Loader';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
      {isLoading && <Loader/>}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
