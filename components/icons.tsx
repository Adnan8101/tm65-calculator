type P = { className?: string };

const svg = (d: React.ReactNode) =>
  function Icon({ className = "h-4 w-4" }: P) {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        {d}
      </svg>
    );
  };

export const Plus = svg(<path d="M10 4.5v11M4.5 10h11" />);
export const Trash = svg(<path d="M4 6h12M8.5 6V4.5h3V6M5.5 6l.8 9.5h7.4l.8-9.5M8.5 9v4M11.5 9v4" />);
export const Close = svg(<path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />);
export const Pencil = svg(<path d="M12.5 4.5l3 3L7.5 15.5H4.5v-3z" />);
export const Down = svg(<path d="M6 8l4 4 4-4" />);
export const Menu = svg(<path d="M3.5 6h13M3.5 10h13M3.5 14h13" />);
export const Pin = svg(
  <>
    <path d="M10 17s5-4.6 5-8.5a5 5 0 10-10 0C5 12.4 10 17 10 17z" />
    <circle cx="10" cy="8.5" r="1.8" />
  </>,
);
export const Print = svg(<path d="M6 7.5V3.5h8v4M6 13.5H4.5v-6h11v6H14M6 11.5h8v5H6z" />);
export const Check = svg(<path d="M4.5 10.5l3.5 3.5 7.5-8" />);
export const Right = svg(<path d="M4.5 10h11M11 5.5l4.5 4.5-4.5 4.5" />);
export const Left = svg(<path d="M15.5 10h-11M9 5.5L4.5 10 9 14.5" />);
export const Search = svg(
  <>
    <circle cx="9" cy="9" r="5" />
    <path d="M12.8 12.8l3.2 3.2" />
  </>,
);
export const Alert = svg(<path d="M10 3.5l7 12.5H3zM10 8.5v3M10 13.8v.2" />);
export const Info = svg(
  <>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 9v4.5M10 6.5v.2" />
  </>,
);
export const Reset = svg(<path d="M4 10a6 6 0 106-6 6.3 6.3 0 00-4.5 2L4 7.5M4 4v3.5h3.5" />);
export const Sparkle = svg(<path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6zM15.5 14l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />);
export const Box = svg(<path d="M10 2.8l6.5 3.6v7.2L10 17.2l-6.5-3.6V6.4zM3.5 6.4L10 10l6.5-3.6M10 10v7.2" />);
export const Layers = svg(<path d="M10 3l7 3.8-7 3.8-7-3.8zM3 10.2l7 3.8 7-3.8M3 13.6l7 3.8 7-3.8" />);
export const Drop = svg(<path d="M10 2.8s5 5.3 5 9a5 5 0 01-10 0c0-3.7 5-9 5-9z" />);
export const Factory = svg(<path d="M2.5 16.5V9l4.5 3V9l4.5 3V4.5h3l1 12zM6 14h1.5M10 14h1.5" />);
export const Clipboard = svg(<path d="M7.5 4H5.5v13h9V4h-2M7.5 3h5v2.5h-5zM8 10l1.5 1.5L12.5 8.5" />);
export const Sliders = svg(<path d="M4 6h7M15 6h1M4 14h1M9 14h7M11 4v4M7 12v4" />);

export function Logo({ className = "h-7 w-7" }: P) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="var(--accent)" />
      <path d="M8 20c0-7 4.4-12 12-12 0 7.6-4.6 12-11.2 12M8 20l6-6" fill="none" stroke="var(--on-accent)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const Truck = svg(
  <>
    <path d="M2.5 5.5h9v8h-9zM11.5 8h3.2l2.8 3v2.5h-6" />
    <circle cx="6" cy="14.5" r="1.7" />
    <circle cx="14" cy="14.5" r="1.7" />
  </>,
);
export const Bolt = svg(<path d="M11 2.5L4.5 11h4.5l-1 6.5L15.5 9H11z" />);
export const Wrench = svg(<path d="M12.5 3.5a4 4 0 00-4 5.3L3.5 13.8a1.7 1.7 0 002.4 2.4l5-5a4 4 0 005.3-4l-2.3 2.3-2-.5-.5-2z" />);
export const Recycle = svg(
  <>
    <path d="M7.5 5.5L10 3l2.5 2.5M10 3v6M13.5 14.5H16l-2.5-5M6.5 14.5H4l1.8-3.6M8 16.5l-2-2 2-2M12 16.5l2-2" />
  </>,
);
export const Sheet = svg(<path d="M5 2.5h7l3 3v12H5zM12 2.5v3h3M7.5 9h5M7.5 12h5M7.5 15h3" />);
export const PieIcon = svg(
  <>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 10V3M10 10l5 5" />
  </>,
);