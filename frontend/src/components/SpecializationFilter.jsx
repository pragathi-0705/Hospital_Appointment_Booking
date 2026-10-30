import React from 'react';
import { Heart, Sparkles, Bone, Baby, Brain, ShieldPlus, Layers } from 'lucide-react';

const SPEC_ICONS = {
  All: Layers,
  Cardiology: Heart,
  Dermatology: Sparkles,
  Orthopedics: Bone,
  Pediatrics: Baby,
  Neurology: Brain,
  'General Medicine': ShieldPlus,
};

export const SpecializationFilter = ({
  specializations = [],
  selected,
  onSelect,
}) => {
  const allList = ['All', ...specializations.map((s) => (typeof s === 'string' ? s : s.name))];
  const uniqueList = Array.from(new Set(allList));

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      padding: '4px 0 12px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {uniqueList.map((spec) => {
        const isSelected = selected === spec;
        const IconComponent = SPEC_ICONS[spec] || ShieldPlus;

        return (
          <button
            key={spec}
            onClick={() => onSelect(spec)}
            className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
            style={{
              padding: '8px 16px',
              fontSize: '0.88rem',
              whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-full)',
              borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
              color: isSelected ? '#ffffff' : 'var(--text-dark)',
              background: isSelected ? 'var(--primary)' : '#ffffff',
              boxShadow: isSelected ? '0 3px 8px rgba(37, 99, 235, 0.25)' : 'none',
            }}
          >
            <IconComponent size={15} color={isSelected ? '#ffffff' : 'var(--primary)'} />
            {spec}
          </button>
        );
      })}
    </div>
  );
};
