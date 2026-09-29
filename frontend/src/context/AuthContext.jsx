import {createContext,useContext,useState} from 'react';
import api from '../api/api';
const C=createContext();
export function AuthProvider({children}){const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('sc_user')||'null'));async function login(email,password){const r=await api.post('/auth/login',{email,password});localStorage.setItem('sc_token',r.data.token);localStorage.setItem('sc_user',JSON.stringify(r.data.user));setUser(r.data.user);return r.data}function logout(){localStorage.removeItem('sc_token');localStorage.removeItem('sc_user');setUser(null)}return <C.Provider value={{user,login,logout}}>{children}</C.Provider>}
export const useAuth=()=>useContext(C);
