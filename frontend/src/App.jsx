import {Routes,Route,Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Module from './pages/Module';
import AI from './pages/AI';
import Career from './pages/Career';
import Profile from './pages/Profile';
import {useAuth} from './context/AuthContext';
const map=[['students','Students'],['faculty','Faculty'],['attendance','Attendance'],['timetable','Timetable'],['fees','Fees & Payments'],['exams','Exams & Results'],['assignments','Assignments'],['hostel','Hostel Management'],['transport','Smart Transport'],['certificates','Digital Certificates'],['helpdesk','Student Helpdesk'],['notifications','Notifications'],['activities','Activities & Achievements'],['parent','Parent Portal'],['departments','Departments'],['courses','Courses']];
function Private(){const {user}=useAuth();return user?<Layout/>:<Navigate to="/login"/>}
export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route element={<Private/>}><Route path="/dashboard" element={<Dashboard/>}/>{map.map(([e,n])=><Route key={e} path={'/'+e} element={<Module endpoint={e} name={n}/>}/>}<Route path="/career-intelligence" element={<Career/>}/><Route path="/ai-assistant" element={<AI/>}/><Route path="/profile" element={<Profile/>}/><Route path="*" element={<Navigate to="/dashboard"/>}/></Route></Routes>}
