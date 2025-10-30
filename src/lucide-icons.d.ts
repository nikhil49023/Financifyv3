
// lucide-icons.d.ts
declare module 'lucide-react' {
    import { SVGProps } from 'react';
  
    // Define the type for an icon component
    type LucideIcon = (props: SVGProps<SVGSVGElement> & {
      size?: number | string;
      color?: string;
      strokeWidth?: number | string;
    }) => JSX.Element;
  
    // List all the icons you use here to get type-checking
    export const Home: LucideIcon;
    export const Wallet: LucideIcon;
    export const LogOut: LucideIcon;
    export const User: LucideIcon;
    export const BrainCircuit: LucideIcon;
    export const Rocket: LucideIcon;
    export const Globe: LucideIcon;
    export const MessagesSquare: LucideIcon;
    export const TrendingUp: LucideIcon;
    export const PiggyBank: LucideIcon;
    export const TrendingDown: LucideIcon;
    export const Lightbulb: LucideIcon;
    export const Target: LucideIcon;
    export const PlusCircle: LucideIcon;
    export const ShoppingBag: LucideIcon;
    export const Film: LucideIcon;
    export const HeartPulse: LucideIcon;
    export const Trash2: LucideIcon;
    export const ShieldAlert: LucideIcon;
    export const FilePieChart: LucideIcon;
    export const Loader2: LucideIcon;
    export const Bell: LucideIcon;
    export const Info: LucideIcon;
    export const DollarSign: LucideIcon;
    export const Briefcase: LucideIcon;
    export const Search: LucideIcon;
    export const Phone: LucideIcon;
    export const Mail: LucideIcon;
    export const MessageSquare: LucideIcon;
    export const Building: LucideIcon;
    export const Banknote: LucideIcon;
    export const Megaphone: LucideIcon;
    export const LogIn: LucideIcon;
    export const X: LucideIcon;
    export const Link: LucideIcon;
    export const FileText: LucideIcon;
    export const Share2: LucideIcon;
    export const CheckCircle: LucideIcon;
    export const ChevronsRight: LucideIcon;
    export const Landmark: LucideIcon;
    export const Save: LucideIcon;
    export const Shield: LucideIcon;
    export const ArrowLeft: LucideIcon;
    export const Leaf: LucideIcon;
    export const Laptop: LucideIcon;
    export const Recycle: LucideIcon;
    export const Users: LucideIcon;
    export const Eye: LucideIcon;
    export const Send: LucideIcon;
    export const Users2: LucideIcon;
    export const Edit: LucideIcon;
    export const Sparkles: LucideIcon;
    export const FileDown: LucideIcon;
    export const Star: LucideIcon;


    // Add any other icons you might use
  }
