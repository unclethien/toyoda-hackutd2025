interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo = ({ size = 36, className = '' }: LogoProps) => {
  return (
    <img
      src="/toyoda-logo-removebg.png"
      alt="TOYODA Logo"
      width={size}
      height={size}
      className={`flex-shrink-0 ${className}`}
    />
  );
};
