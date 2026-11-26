import { useState } from 'react';

// Fields of the entry being added or edited.
export function useEntryDraft() {
  const [entryDate, setEntryDate] = useState(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; });
  const [entryTime, setEntryTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [entryFood, setEntryFood] = useState('');
  const [entryCarbs, setEntryCarbs] = useState('');
  const [entryComment, setEntryComment] = useState('');
  const [showAllFields, setShowAllFields] = useState(false);
  const [showAllFoodTags, setShowAllFoodTags] = useState(false);
  const [showAllActivityTags, setShowAllActivityTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hunger, setHunger] = useState<number | undefined>(undefined);
  const [mood, setMood] = useState('');
  const [entryWeight, setEntryWeight] = useState('');
  return {
    entryDate, setEntryDate, entryTime, setEntryTime, entryFood, setEntryFood, entryCarbs, setEntryCarbs, entryComment, setEntryComment, showAllFields, setShowAllFields, showAllFoodTags, setShowAllFoodTags, showAllActivityTags, setShowAllActivityTags, selectedTags, setSelectedTags, hunger, setHunger, mood, setMood, entryWeight, setEntryWeight,
  };
}

export type EntryDraft = ReturnType<typeof useEntryDraft>;
