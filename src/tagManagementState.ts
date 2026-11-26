import { useState } from 'react';

// UI state of the tag management page. Kept in App so it survives leaving the page.
export function useTagManagementState() {
  const [tagCategory, setTagCategory] = useState<'food' | 'activity'>('food');
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [tagIcon, setTagIcon] = useState('tag');
  const [deleteTag, setDeleteTag] = useState<string | null>(null);
  const [tagHintOpen, setTagHintOpen] = useState(false);
  const [orphanTagsOpen, setOrphanTagsOpen] = useState(false);
  const [replacingOrphan, setReplacingOrphan] = useState<string | null>(null);
  const [orphanTarget, setOrphanTarget] = useState('');
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [dragOverTag, setDragOverTag] = useState<string | null>(null);
  return {
    tagCategory, setTagCategory, tagEditorOpen, setTagEditorOpen, editingTag, setEditingTag, tagDraft, setTagDraft, tagIcon, setTagIcon, deleteTag, setDeleteTag, tagHintOpen, setTagHintOpen, orphanTagsOpen, setOrphanTagsOpen, replacingOrphan, setReplacingOrphan, orphanTarget, setOrphanTarget, draggedTag, setDraggedTag, dragOverTag, setDragOverTag,
  };
}

export type TagManagementState = ReturnType<typeof useTagManagementState>;
