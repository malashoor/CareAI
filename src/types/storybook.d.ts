declare module '@storybook/react-native' {
  import { ComponentType, ReactNode, JSX } from 'react';

  export type StoryObj<T> = {
    args?: Partial<T>;
    parameters?: {
      direction?: 'ltr' | 'rtl';
      viewport?: {
        defaultViewport?: string;
      };
      theme?: 'light' | 'dark';
    };
  };

  export type Meta<T> = {
    title: string;
    component: ComponentType<T>;
    decorators?: Array<(Story: () => JSX.Element) => JSX.Element>;
    args: T;
  };
} 