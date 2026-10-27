import { useEffect, useState } from 'react';

// Form state that follows a store section (re-filled whenever the section loads or changes)
export const useSectionForm = (section) => {
  const [form, setForm] = useState(section || {});
  useEffect(() => {
    setForm(section || {});
  }, [section]);
  return [form, setForm];
};
