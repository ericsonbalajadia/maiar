// Centred layout for all auth pages — no sidebar 
export default function AuthLayout({ children }: { children: React.ReactNode 
}) { 
  return ( 
    <div className="min-h-screen flex items-center justify-center bg-slate
50 dark:bg-slate-950"> 
      <div className="w-full max-w-md px-4"> 
        <div className="mb-8 text-center"> 
          <h1 className="text-3xl font-bold text-slate-900 dark:text
white">iTrack</h1> 
          <p className="text-slate-500 mt-1">VSU Maintenance Request 
System</p> 
        </div> 
        {children} 
      </div> 
    </div> 
  ); 
} 