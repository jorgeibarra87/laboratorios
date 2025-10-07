import Header from './LaboratorioApp/ui/Header';
import Sidebar from './LaboratorioApp/ui/Sidebar';
import { Routes, Route } from "react-router-dom";
import ExamenesTable from './LaboratorioApp/components/Examenes/ExamenesTable';

const App = () => (
  <div className="flex h-screen bg-gray-100">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ExamenesTable />} />
          <Route path="/examenes" element={<ExamenesTable />} />
          <Route path="/solicitudes" element={<ExamenesTable />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default App;
