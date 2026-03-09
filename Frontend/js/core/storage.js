// =============================
// STORAGE MANAGER – SAFE VERSION
// =============================

const Storage = {

  /* TOKEN */

  setToken(token){
    if(!token) return;
    localStorage.setItem("token", token);
  },

  getToken(){
    try{
      return localStorage.getItem("token");
    }catch(e){
      console.error("Token read error:", e);
      return null;
    }
  },

  removeToken(){
    localStorage.removeItem("token");
  },

  /* USER */

  setUser(user){
    if(!user) return;
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser(){
    try{
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }catch(e){
      console.error("User parse error:", e);
      return null;
    }
  },

  getUserRole(){
    const user = this.getUser();
    return user ? user.role : null;
  },

  isLoggedIn(){
    return !!this.getToken();
  },

  /* CLEAR */

  clear(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

};