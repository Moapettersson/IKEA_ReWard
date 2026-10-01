import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'emphasised' | 'primary' | 'secondary' | 'tertiary';

interface CommonProps {
  variant?: Variant;
  size?: 'l' | 'm';
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };
type LinkProps = CommonProps & { to: string; href?: undefined };
type AnchorProps = CommonProps & { href: string; to?: undefined; external?: boolean };

function classes({ variant = 'primary', size = 'm', fullWidth, className }: CommonProps) {
  return [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ');
}

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const { variant, size, fullWidth, children, className } = props;
  const cls = classes({ variant, size, fullWidth, className, children });
  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={cls}>
        {children}
      </Link>
    );
  }
  if ('href' in props && props.href !== undefined) {
    const external = 'external' in props && props.external;
    return (
      <a
        href={props.href}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  const { type = 'button', disabled, onClick, form, name, value, id } = props as ButtonProps;
  const aria = Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('aria-')));
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      form={form}
      name={name}
      value={value}
      id={id}
      {...aria}
      className={cls}
    >
      {children}
    </button>
  );
}
