
'use client';

import {
  Home,
  Wallet,
  LogOut,
  User,
  BrainCircuit,
  Rocket,
  Globe,
  MessagesSquare,
} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {useLanguage} from '@/hooks/use-language';
import {useAuth} from '@/context/auth-provider';

type SidebarProps = {
  onLinkClick?: () => void;
  isCollapsed?: boolean;
};

export default function Sidebar({
  onLinkClick,
  isCollapsed = false,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {language, setLanguage, translations} = useLanguage();
  const {signOut, userProfile} = useAuth();

  const isMsme = userProfile?.role === 'msme';

  const navItems = [
    {href: '/', label: translations.sidebar.dashboard, icon: Home},
    {
      href: '/transactions',
      label: translations.sidebar.transactions,
      icon: Wallet,
    },
    {
      href: '/brainstorm',
      label: translations.sidebar.brainstorm,
      icon: BrainCircuit,
    },
    {
      href: '/ai-advisor',
      label: 'AI Advisor',
      icon: MessagesSquare,
    },
    {
      href: '/launchpad',
      label: isMsme
        ? translations.sidebar.growthHub
        : translations.sidebar.launchpad,
      icon: Rocket,
    },
  ];

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const NavLink = ({item}: {item: (typeof navItems)[0]}) => {
    const isActive = pathname === item.href;
    const linkContent = (
      <>
        <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
        <span className={cn({'hidden': isCollapsed})}>{item.label}</span>
      </>
    );

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              asChild
              className={cn(
                'w-full justify-start text-base font-normal text-muted-foreground hover:text-primary hover:bg-primary/10',
                isActive && 'font-semibold text-primary bg-primary/10',
                isCollapsed && 'justify-center'
              )}
              onClick={handleLinkClick}
            >
              <Link href={item.href}>{linkContent}</Link>
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <aside className="w-full h-full glassmorphic flex flex-col p-4">
      <div
        className={cn(
          'flex items-center gap-2 p-2',
          isCollapsed ? 'justify-center' : 'justify-start'
        )}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-primary"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            d="M12 7C9.24 7 7 9.24 7 12H9C9 10.34 10.34 9 12 9V7Z"
            fill="currentColor"
          />
          <path
            d="M12 11C10.9 11 10 11.9 10 13H14C14 11.9 13.1 11 12 11Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M12 15C10.34 15 9 16.34 9 18H15C15 16.34 13.66 15 12 15Z"
            fill="currentColor"
          />
        </svg>
        <h1 className={cn('text-xl font-bold', {'hidden': isCollapsed})}>
          EmpowerMintt
        </h1>
      </div>
      <nav className="flex-1 px-0 py-2 space-y-1 mt-4">
        {navItems.map(item => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className={cn('border-t', isCollapsed ? 'p-0' : 'p-4')}>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start text-muted-foreground font-normal hover:text-primary hover:bg-primary/10',
                      isCollapsed && 'justify-center'
                    )}
                  >
                    <Globe className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                    <span className={cn({'hidden': isCollapsed})}>
                      {language === 'en' ? 'English' : 'తెలుగు'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('te')}>
                    తెలుగు
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p>Language</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  'w-full justify-start text-muted-foreground font-normal hover:text-primary hover:bg-primary/10',
                  isCollapsed && 'justify-center'
                )}
                onClick={handleLinkClick}
              >
                <Link href="/profile">
                  <User className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                  <span className={cn({'hidden': isCollapsed})}>
                    {translations.sidebar.myProfile}
                  </span>
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p>{translations.sidebar.myProfile}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10',
                      isCollapsed && 'justify-center'
                    )}
                  >
                    <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                    <span className={cn({'hidden': isCollapsed})}>
                      {translations.sidebar.logout}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {translations.logoutDialog.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {translations.logoutDialog.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {translations.logoutDialog.cancel}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      {translations.logoutDialog.confirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p>{translations.sidebar.logout}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
