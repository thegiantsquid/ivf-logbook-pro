import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar as SidebarWrapper, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, FilePlus, FileSearch, BarChart, Info, User, Settings } from 'lucide-react';
const Sidebar: React.FC = () => {
  return <SidebarWrapper>
      <SidebarHeader className="border-b backdrop-blur-md bg-slate-900">
        <div className="flex items-center h-16 px-6">
          <h1 className="font-bold text-xl tracking-tight flex items-center gap-2 text-primary">
            <span className="h-6 w-6 rounded-md bg-primary text-white flex items-center justify-center text-sm">
              IVF
            </span>
            Logbook Pro
          </h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="sidebar-transition pt-4">
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={({
                  isActive
                }) => isActive ? 'text-primary bg-primary/5' : ''}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/records" className={({
                  isActive
                }) => isActive ? 'text-primary bg-primary/5' : ''}>
                    <FileSearch className="w-5 h-5" />
                    <span>View Records</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/add-record" className={({
                  isActive
                }) => isActive ? 'text-primary bg-primary/5' : ''}>
                    <FilePlus className="w-5 h-5" />
                    <span>Add Record</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/summary" className={({
                  isActive
                }) => isActive ? 'text-primary bg-primary/5' : ''}>
                    <BarChart className="w-5 h-5" />
                    <span>Summary</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>User</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/profile" className={({
                  isActive
                }) => isActive ? 'text-primary bg-primary/5' : ''}>
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={({
                  isActive
                }) => isActive ? 'text-primary bg-primary/5' : ''}>
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="py-4 px-6">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5" />
          <span>IVF Logbook Pro v1.0</span>
        </div>
      </SidebarFooter>
    </SidebarWrapper>;
};
export default Sidebar;