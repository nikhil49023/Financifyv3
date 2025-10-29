
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
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-primary"
        >
          <path
            d="M32 58.6667C46.7276 58.6667 58.6667 46.7276 58.6667 32C58.6667 17.2724 46.7276 5.33334 32 5.33334C17.2724 5.33334 5.33334 17.2724 5.33334 32C5.33334 46.7276 17.2724 58.6667 32 58.6667Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M21.3333 42.6667C21.3333 42.6667 24 34.6667 32 34.6667C40 34.6667 42.6667 42.6667 42.6667 42.6667"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M40 26.6667C40 28.8758 38.2091 30.6667 36 30.6667C33.7909 30.6667 32 28.8758 32 26.6667C32 24.4576 33.7909 22.6667 36 22.6667C38.2091 22.6667 40 24.4576 40 26.6667Z"
            fill="currentColor"
          />
          <path
            d="M28 26.6667C28 28.8758 26.2091 30.6667 24 30.6667C21.7909 30.6667 20 28.8758 20 26.6667C20 24.4576 21.7909 22.6667 24 22.6667C26.2091 22.6667 28 24.4576 28 26.6667Z"
            fill="currentColor"
          />
        </svg>
        <h1 className={cn('text-xl font-bold', {'hidden': isCollapsed})}>
          EmpowerMint
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
