// AdminLayout.jsx
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// export default function AdminLayout({ children }) {
//   return (
//     <div className="flex">
//       {/* ===== Fixed Sidebar ===== */}
//       <aside className="hidden sm:block fixed top-0 left-0 h-screen w-64 bg-white shadow-md z-50">
//         <Sidebar />
//       </aside>

//       {/* ===== Right side: Fixed Navbar + Scrollable main ===== */}
//       <div className="flex flex-col flex-1 sm:ml-64">
//         {/* Fixed Navbar */}
//         <header className="fixed top-0 left-0 sm:left-64 right-0 h-16 bg-white border-b shadow z-40">
//           <Navbar />
//         </header>

//         {/* Scrollable main content area */}
//         <main className="pt-16 p-4 min-h-screen overflow-auto bg-gray-50">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }


export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      {/* Sidebar */}
      <aside className="hidden sm:block fixed top-0 left-0 h-screen w-64 bg-white shadow-md z-50">
         <Sidebar />
       </aside>

      {/* Main area */}
      <div className="sm:ml-64">
        {/* Navbar */}
        <div className="fixed top-0 sm:left-64 right-0 h-16 z-10 p-4">
          <Navbar />
        </div>

        {/* Scrollable content */}
        <main className="pt-16 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}