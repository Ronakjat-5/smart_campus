import React, {useState} from 'react';
import {Link, NavLink, Outlet, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import Icon from './Icon';

const groups = [
  {title:'Overview', items:[['Dashboard','dashboard','grid']]},
  {title:'Academic', items:[['Students','students','users'],['Attendance','attendance','calendar'],['Timetable','timetable','clock'],['Exams','exams','file'],['Assignments','assignments','edit']]},
  {title:'Campus Life', items:[['Fees','fees','wallet'],['Hostel','hostel','home'],['Transport','transport','bus'],['Certificates','certificates','certificate'],['Helpdesk','helpdesk','headset'],['Notifications','notifications','bell'],['Activities','activities','spark']]},
  {title:'Intelligence', items:[['Career Intelligence','career-intelligence','trend'],['AI Assistant','ai-assistant','bot'],['Parent Portal','parent','users']]},
];

export default function Layout(){
  const {user,logout}=useAuth(); const navigate=useNavigate(); const [open,setOpen]=useState(false);
  const displayName=user?.name || 'Campus User';
  return <div className="shell">
    <aside className={`sidebar ${open?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Icon name="spark" size={20}/></div><div><b>Smart<span>Campus</span></b><small>Digital University OS</small></div></div>
      <div className="sidebar-user"><div className="avatar">{displayName.charAt(0).toUpperCase()}</div><div><strong>{displayName}</strong><small>{user?.role || 'STUDENT'}</small></div></div>
      <nav>{groups.map(g=><div className="nav-group" key={g.title}><label>{g.title}</label>{g.items.map(([label,path,icon])=><NavLink onClick={()=>setOpen(false)} key={path} to={'/'+path} className={({isActive})=>isActive?'nav-link active':'nav-link'}><Icon name={icon}/><span>{label}</span>{label==='Notifications' && <em className="nav-dot"/>}</NavLink>)}</div>)}</nav>
      <div className="sidebar-bottom"><button className="logout-link" onClick={()=>{logout();navigate('/login')}}><Icon name="logout"/><span>Sign out</span></button><div className="version">Hackathon Edition <span>v2.0</span></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(v=>!v)}><Icon name="menu"/></button><div className="crumb">Smart Campus <span>/</span> <b>University Digital Campus</b></div><div className="top-actions"><div className="global-search"><Icon name="search" size={17}/><input placeholder="Search campus..." onKeyDown={e=>e.key==='Enter'&&navigate('/students')}/><kbd>⌘ K</kbd></div><button className="icon-button" onClick={()=>navigate('/notifications')}><Icon name="bell"/><i/></button><button className="profile-mini" onClick={()=>navigate('/profile')}><div className="avatar small">{displayName.charAt(0).toUpperCase()}</div><span>{displayName}</span><Icon name="chevron" size={15}/></button></div></header>
      <main className="content"><Outlet/></main>
    </div>
  </div>
}
