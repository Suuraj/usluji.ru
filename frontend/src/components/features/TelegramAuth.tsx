import {useEffect, useRef} from 'react';

interface Props {
    botName: string;
    onAuth: (user: any) => void;
}

export const TelegramAuth = ({botName, onAuth}: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (window as any).onTelegramAuth = (user: any) => {
            onAuth(user);
        };

        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        containerRef.current?.appendChild(script);
    }, [botName, onAuth]);

    return <div ref={containerRef} className='flex justify-center p-4'/>;
};
