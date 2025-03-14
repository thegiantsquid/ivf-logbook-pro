
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sidebar as SidebarWrapper, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileSearch, 
  BarChart, 
  Info, 
  User, 
  Settings, 
  Users, 
  Calendar, 
  FileText 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <SidebarWrapper className="border-r">
      <SidebarHeader className="border-b bg-primary">
        <div className="flex items-center h-16 px-6">
          <h1 className="font-bold text-xl tracking-tight flex items-center gap-3 text-white">
            <span className="h-8 w-8 rounded-md bg-white text-primary flex items-center justify-center text-xl">
              M
            </span>
            MediTrack
          </h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="sidebar-transition pt-2 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/records" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                <Users className="w-5 h-5" />
                <span>Patients</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/add-record" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/summary" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                <FileText className="w-5 h-5" />
                <span>Medical Records</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                <BarChart className="w-5 h-5" />
                <span>Analytics</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'text-primary bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`
                }
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="py-4 px-6 border-t">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Info className="w-3.5 h-3.5" />
          <span>MediTrack v1.0</span>
        </div>
      </SidebarFooter>
    </SidebarWrapper>
  );
};

export default Sidebar;
