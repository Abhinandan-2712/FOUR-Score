export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A3161] px-4 py-8">
      {/* Main off-white card with rounded corners */}
      <div className="w-full max-w-5xl bg-[#FAFAFA] rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left section - Login form (wider) */}
        <div className="flex-1 flex flex-col  p-8 md:p-10 lg:p-12  justify-center">
          {children}
        </div>

        {/* Right section - Image (narrower) */}
        <div className="relative w-full md:w-[50%] min-h-[300px] md:min-h-0">
          <img
            src="/login.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center rounded-b-[24px] md:rounded-b-none md:rounded-r-[24px]"
          />
        </div>
      </div>
    </div>
  );
}
