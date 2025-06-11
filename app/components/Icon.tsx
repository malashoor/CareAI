import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface IconProps {
  name: IconName;
  size: number;
  color: string;
}

export function Icon({ name, size, color }: IconProps) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
} 