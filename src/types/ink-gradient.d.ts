/**
 * Type declarations for ink-gradient package
 */

declare module 'ink-gradient' {
  import { ReactNode } from 'react';

  interface GradientProps {
    colors?: string[];
    name?: string;
    direction?: 'horizontal' | 'vertical';
    children: ReactNode;
  }

  const Gradient: React.FC<GradientProps>;
  export default Gradient;
}