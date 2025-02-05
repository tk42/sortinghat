import Link from 'next/link';

type Props = {
    href: string;
    name: string;
    icon: React.ElementType; // アイコンの型を設定
    handleClick: () => void;
};

export const NavigationItem = (props: Props) => {

    return (
        <Link 
            href={props.href} 
            onClick={props.handleClick}
            className={`w-full rounded-lg flex items-center p-3 text-sm transition duration-200 text-blue-900 hover:bg-indigo-500 hover:text-white hover:shadow-lg hover:shadow-indigo-500/50`}
        >
            <props.icon className="w-6 h-6 mr-2" />
            {props.name}
        </Link>
    );
};