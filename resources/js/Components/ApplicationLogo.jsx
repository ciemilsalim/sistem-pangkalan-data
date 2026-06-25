export default function ApplicationLogo(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* Bottom Disk */}
            <ellipse cx="12" cy="18.5" rx="9" ry="2.5" fill="currentColor" fillOpacity="0.6" />
            <path d="M 3 18.5 v 3 a 9 2.5 0 0 0 18 0 v -3 a 9 2.5 0 0 1 -18 0 Z" fill="currentColor" fillOpacity="0.25" />
            
            {/* Middle Disk */}
            <ellipse cx="12" cy="11.5" rx="9" ry="2.5" fill="currentColor" fillOpacity="0.8" />
            <path d="M 3 11.5 v 3 a 9 2.5 0 0 0 18 0 v -3 a 9 2.5 0 0 1 -18 0 Z" fill="currentColor" fillOpacity="0.45" />
            
            {/* Top Disk */}
            <ellipse cx="12" cy="4.5" rx="9" ry="2.5" fill="currentColor" />
            <path d="M 3 4.5 v 3 a 9 2.5 0 0 0 18 0 v -3 a 9 2.5 0 0 1 -18 0 Z" fill="currentColor" fillOpacity="0.65" />
        </svg>
    );
}
