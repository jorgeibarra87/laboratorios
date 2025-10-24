import { useState } from 'react';
import Header from './LaboratorioApp/ui/Header';
import Sidebar from './LaboratorioApp/ui/Sidebar';
import { Routes, Route } from "react-router-dom";
import ExamenesTable from './LaboratorioApp/components/Examenes/ExamenesTable';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Barra lateral condicional */}
      {isSidebarOpen && <Sidebar />}

      {/* menu superior */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header con función toggle */}
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<ExamenesTable />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
