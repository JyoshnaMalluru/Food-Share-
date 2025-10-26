import './App.css'
import Header from './components/Header'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AvailableFood from './pages/AvailableFood';
import DonateForm from './pages/DonateForm.jsx';
import MyPosts from './pages/MyPosts';
import ReceiverDashboard from './pages/ReceiverDashBoard';
import DonorDashboard from './pages/DonorDashboard';
import AdminPanel from './pages/AdminPanel';
import VolunteerDashboard from './pages/VolunteerDashboard'; // ADD THIS
import Navbar from './components/Navbar';
import MyProfile from './pages/MyProfile';

function App() {
  return (
    <>
    <ToastContainer />
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/available' element={<AvailableFood />} />
      <Route path='/donate' element={<DonateForm />} />
      <Route path='/myposts' element={<MyPosts />} />
      <Route path='/profile' element={<MyProfile />} />
      <Route path='/receive' element={<AvailableFood />} />
      <Route path='/receiver-dashboard' element={<ReceiverDashboard />} />
      <Route path='/donor-dashboard' element={<DonorDashboard />} />
      <Route path='/volunteer-dashboard' element={<VolunteerDashboard />} />
      <Route path='/admin' element={<AdminPanel />} />
    </Routes>
    </>
  )
}

export default App