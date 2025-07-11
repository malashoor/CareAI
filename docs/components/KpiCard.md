# KpiCard Component

A large-font, senior-friendly card component designed to display key performance indicators with accessibility support.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | ReactNode | Yes | Icon to display in the card |
| `label` | string | Yes | Label text describing what the KPI represents |
| `value` | string | Yes | Value to display (e.g., "72 bpm") |
| `accessibilityLabel` | string | No | Custom accessibility label (defaults to "{label}: {value}") |

## Usage

```tsx
import KpiCard from '@/components/KpiCard';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/theme/colors';

// Heart Rate KPI
<KpiCard 
  icon={<Ionicons name="heart-outline" size={24} color={COLORS.primary} />} 
  label="Heart Rate" 
  value="72 bpm" 
/>

// Steps KPI
<KpiCard 
  icon={<Ionicons name="walk-outline" size={24} color={COLORS.primary} />} 
  label="Steps Today" 
  value="3,421" 
/>
```

## Accessibility

The KpiCard component is designed with accessibility in mind:

- Each card announces its label and value to screen readers
- Proper contrast ratios are maintained in both light and dark modes
- Font scaling is supported for users with custom text size settings

## Theming

KpiCard automatically adapts to light and dark themes:

- Light mode: White background with dark text
- Dark mode: Dark background with light text

## Examples

### Basic KPI Card
```tsx
<KpiCard 
  icon={<Ionicons name="heart-outline" size={24} color={COLORS.primary} />} 
  label="Heart Rate" 
  value="72 bpm" 
/>
```

### With Custom Accessibility Label
```tsx
<KpiCard 
  icon={<Ionicons name="heart-outline" size={24} color={COLORS.primary} />} 
  label="Heart Rate" 
  value="72 bpm" 
  accessibilityLabel="Your current heart rate is 72 beats per minute"
/>
``` 