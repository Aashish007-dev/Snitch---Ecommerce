import React, { useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { useNavigate } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWithGoogle';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  
  // Two-way binding state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await handleLogin({
      email: formData.email,
      password: formData.password
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col antialiased bg-[#131313] text-[#e5e2e1] font-sans">
      <main className="flex-grow flex w-full">
        {/* Left Side: Branding / Editorial */}
        <div className="hidden lg:flex w-1/2 relative bg-[#0e0e0e]">
          {/* Full Bleed Image Background */}
          <img 
            alt="High fashion model in dark suit with golden hour lighting" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqZg2Wl-GLzi2YVb0YxvcF88VCOLHI2pHNlxkIQhTGlW_nSGQdt4tmgAELBj791OyUHLXIoLwwSiCHSzMH_z5YlLuUe6Q4no88QFTKf77ikHdDK3HywDab6OOWxfbY8Yok90ZCgSRZfI4vhT8Wr6nxVLLqjNHGL1MC7NmPU2tEpTeikR6W3mkFS2QYCVV5TdnTR9XiJfH8Q97fueVi-oZ_4k4n4d0UZv2qvHE__GCareqEriuO5SMWMAgluem9Y8899L1YTX1uNtw"
          />
          {/* Dark Overlay for Noir Aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0e0e]/90 to-[#0e0e0e]/40"></div>
          {/* Content Area */}
          <div className="relative z-10 flex flex-col justify-between p-[40px] w-full h-full">
            {/* Logo */}
            <div className="w-48">
              <h1 className="text-[32px] font-bold text-[#ffd700] tracking-tight filter drop-shadow-md">SNITCH</h1>
            </div>
            {/* Editorial Copy */}
            <div className="mb-[48px] max-w-md">
              <h1 className="text-[48px] font-bold text-[#ffd700] mb-[12px] tracking-tight leading-[1.1]">
                Define Your<br/>Signature.
              </h1>
              <p className="text-[18px] text-[#d0c6ab] leading-[1.6]">
                Join an exclusive collective of fashion connoisseurs. Access limited drops, personalized curation, and a refined shopping experience.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-[40px] bg-[#131313] relative overflow-hidden">
          {/* Subtle Radial Backdrop */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%)' }}></div>
          <div className="w-full max-w-[480px] relative z-10">
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="lg:hidden mb-[48px] flex justify-center w-full">
              <h1 className="text-[32px] font-bold text-[#ffd700] tracking-tight">SNITCH</h1>
            </div>
            
            {/* Header */}
            <div className="mb-[48px] text-center lg:text-left">
              <h2 className="text-[32px] font-semibold text-[#e5e2e1] mb-[8px] tracking-tight">Welcome Back</h2>
              <p className="text-[16px] text-[#d0c6ab]">Enter your credentials to access your account.</p>
            </div>
            
            {/* Form Container */}
            <div className="bg-[#1c1b1b] border border-[#353534] rounded-xl p-[24px] relative">
              {/* Progress Line */}
              <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-[#ffd700] rounded-t-xl"></div>
              
              <form className="space-y-[24px] flex flex-col" onSubmit={handleSubmit}>
                {/* Email Address */}
                <div className="flex flex-col gap-[12px]">
                  <label className="text-[14px] font-medium text-[#e5e2e1] tracking-wide" htmlFor="email">Email Address</label>
                  <input className="w-full bg-[#131313] border border-[#353534] rounded text-[#e5e2e1] px-4 py-3 text-[16px] focus:outline-none focus:ring-0 focus:border-[#ffd700] focus:shadow-[0_0_5px_rgba(255,215,0,0.2)] transition-all placeholder:text-zinc-600" id="email" name="email" placeholder="john@example.com" type="email" value={formData.email} onChange={handleChange} />
                </div>
                
                {/* Password */}
                <div className="flex flex-col gap-[12px]">
                  <div className="flex justify-between items-center">
                    <label className="text-[14px] font-medium text-[#e5e2e1] tracking-wide" htmlFor="password">Password</label>
                    <a className="text-[14px] text-[#ffd700] hover:text-[#e9c400] transition-colors font-medium" href="#">Forgot Password?</a>
                  </div>
                  <div className="relative w-full border border-[#353534] rounded bg-[#131313] focus-within:border-[#ffd700] focus-within:shadow-[0_0_5px_rgba(255,215,0,0.2)] transition-all">
                    <input className="w-full bg-transparent border-none text-[#e5e2e1] px-4 py-3 text-[16px] focus:outline-none focus:ring-0 placeholder:text-zinc-600 pr-12" id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#d0c6ab] hover:text-[#ffd700] transition-colors focus:outline-none" onClick={togglePassword} type="button">
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T88-500q50 101 144.5 160.5T480-280Z"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor"><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q146 0 266 81.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-224q-52 31-112 47.5T396-160q-146 0-266-81.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T396-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T216-500q0-29 14-53t38-41l-46-30Zm316 316-22-22q-9 14-23.5 22T460-300q-47-9-88-27t-32-93l-22-22q-4 18-4 37.5 0 75 52.5 127.5T460-225q20 0 37.5-4t34.5-12Zm-142-142Zm84-84Z"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="pt-[12px] flex flex-col gap-[12px]">
                  <button className="w-full bg-[#ffd700] text-[#131313] font-semibold text-[16px] tracking-wide py-4 rounded hover:bg-[#e9c400] active:scale-[0.98] transition-all duration-200" type="submit">
                    Sign In
                  </button>

                  <ContinueWithGoogle />
                  
                  <div className="text-center mt-[12px]">
                    <span className="text-[16px] text-[#d0c6ab]">Don't have an account? </span>
                    <a className="text-[16px] text-[#ffd700] hover:text-[#e9c400] transition-colors font-medium ml-1" href="/register">Register</a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;