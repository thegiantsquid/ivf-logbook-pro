
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocation, Link } from 'react-router-dom';
import { LogOut, User, Settings } from 'lucide-react';

const getPageTitle = (pathname: string): string => {
  const routes: Record<string, string> = {
    '/': 'Dashboard',
    '/records': 'Patient Records',
    '/add-record': 'Add New Record',
    '/summary': 'Summary & Analytics',
    '/profile': 'Profile',
    '/settings': 'Settings',
  };
  
  return routes[pathname] || 'IVF Logbook Pro';
};

const Navbar: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  
  const getUserInitials = (): string => {
    if (!currentUser?.displayName) return '?';
    return currentUser.displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-[#222222] text-white shadow-md">
      <div className="h-16 flex items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <SidebarTrigger className="min-w-8 h-8 flex items-center justify-center rounded-md text-gray-300 hover:bg-gray-700 lg:hidden">
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </SidebarTrigger>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight truncate text-white">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white hover:bg-gray-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.photoURL || ''} alt={currentUser?.displayName || 'User'} />
                  <AvatarFallback className="bg-primary text-white">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{currentUser?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
