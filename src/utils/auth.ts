
export const isLoggedIn = (): boolean => {
    return localStorage.getItem("userToken") !== null;
  };
  
  export const login = (token: string) => {
    localStorage.setItem("userToken", token);
  };
  
  export const logout = () => {
    localStorage.removeItem("userToken");
  };
  
  export {}; 
  