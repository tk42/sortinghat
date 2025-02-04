import Link from 'next/link';
import { useMatchingDrawer } from '@/src/contexts/MatchingDrawerContext';

type Props = {
    href: string;
    name: string;
    icon: React.ElementType; // アイコンの型を設定
    matchingDrawer: boolean;
};

export const NavigationItem = (props: Props) => {
    const matchingDrawer = useMatchingDrawer();

    const handleClick = (e: React.MouseEvent) => {
        if (props.matchingDrawer && matchingDrawer) {
            matchingDrawer.setIsDrawerOpen(true);
        }
    };

    return (
        <Link 
            href={props.href} 
            onClick={handleClick}
            className={`w-full rounded-lg flex items-center p-3 text-sm transition duration-200 text-blue-900 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/50`}
        >
            <props.icon className="w-6 h-6 mr-2" />
            {props.name}
        </Link>
    );
};