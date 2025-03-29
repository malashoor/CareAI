import { useAuth } from './useAuth';

type NavigationItem = {
  name: string;
  title: string;
  icon: string;
  roles: string[];
};

const navigationConfig: Record<string, NavigationItem[]> = {
  tabs: [
    // Senior tabs
    {
      name: 'index',
      title: 'Home',
      icon: 'home',
      roles: ['senior']
    },
    {
      name: 'health',
      title: 'Health',
      icon: 'heart',
      roles: ['senior']
    },
    {
      name: 'cognitive',
      title: 'Mind',
      icon: 'brain',
      roles: ['senior']
    },
    {
      name: 'monitoring',
      title: 'Safety',
      icon: 'shield',
      roles: ['senior']
    },
    
    // Family Member tabs
    {
      name: 'index',
      title: 'Overview',
      icon: 'activity',
      roles: ['child']
    },
    {
      name: 'monitoring',
      title: 'Monitor',
      icon: 'shield',
      roles: ['child']
    },
    {
      name: 'chat',
      title: 'Messages',
      icon: 'message-square',
      roles: ['child']
    },
    {
      name: 'alerts',
      title: 'Alerts',
      icon: 'bell',
      roles: ['child']
    },
    
    // Healthcare Professional tabs
    {
      name: 'index',
      title: 'Dashboard',
      icon: 'stethoscope',
      roles: ['medical']
    },
    {
      name: 'appointments',
      title: 'Schedule',
      icon: 'calendar',
      roles: ['medical']
    },
    {
      name: 'patients',
      title: 'Patients',
      icon: 'users',
      roles: ['medical']
    },
    {
      name: 'chat',
      title: 'Consult',
      icon: 'message-square',
      roles: ['medical']
    },
    
    // Common tabs
    {
      name: 'settings',
      title: 'Settings',
      icon: 'settings',
      roles: ['senior', 'child', 'medical']
    }
  ]
};

export function useNavigationAccess() {
  const { user } = useAuth();

  const getAccessibleTabs = () => {
    if (!user?.role) return [];
    return navigationConfig.tabs.filter(tab => 
      tab.roles.includes(user.role)
    );
  };

  const canAccess = (routeName: string) => {
    if (!user?.role) return false;
    const item = navigationConfig.tabs.find(tab => tab.name === routeName);
    return item ? item.roles.includes(user.role) : false;
  };

  return {
    accessibleTabs: getAccessibleTabs(),
    canAccess
  };
}