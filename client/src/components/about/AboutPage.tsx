import './About.css';

import React, { useEffect, useMemo, useState } from 'react';
import {
  createAbout,
  deleteAbout as deleteAboutThunk,
  fetchAbouts,
  patchAbout,
  selectAllAbouts,
} from '../../store/aboutSlice';
import { useDispatch, useSelector } from 'react-redux';

import type { About } from '../../types/About';
import AboutText from './AboutText';
import { AppDispatch } from '../../store/store';
import { LanguageCode } from '../../constants/language';
import { SquarePen } from 'lucide-react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

export const AboutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectAllAbouts) ?? [];
  const [activeKey, setActiveKey] = useState<string>('project');
  const [draft, setDraft] = useState<{
    title: string;
    text: string;
    language: LanguageCode;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchAbouts());
  }, [dispatch]);

  const itemsForActive = useMemo(
    () => items.filter((a) => a.sectionKey === activeKey),
    [items, activeKey]
  );

  // --- CRUD Handler ---
  const handleStartNew = () => {
    setDraft({ title: '', text: '', language: 'DE' }); // zeigt unten einen AboutText im Editmodus
  };

  const handleSave = async (payload: {
    id?: number;
    title: string;
    text: string;
    language: LanguageCode;
  }) => {
    if (!payload.title.trim() && !payload.text.trim()) return;

    if (payload.id == null) {
      // Neuer Eintrag
      await dispatch(
        createAbout({
          // New payload (entspricht deinem DTO ohne id)
          title: payload.title,
          text: payload.text,
          sectionKey: activeKey,
          language: payload.language,
          dateCreated: new Date().toISOString(),
          dateModified: null,
        } as Omit<About, 'id'>) // falls dein Typ das so erwartet
      );
      setDraft(null);
    } else {
      // Update bestehend
      await dispatch(
        patchAbout({
          id: payload.id,
          updates: {
            title: payload.title,
            text: payload.text,
            language: payload.language,
          },
        })
      );
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteAboutThunk(id));
  };

  const handleCancelDraft = () => setDraft(null);

  const renderTab = (key: string, title: string) => (
    <Tab eventKey={key} title={title}>
      {/* vorhandene Elemente */}
      {itemsForActive
        .filter((a) => a.sectionKey === key)
        .map((item) => (
          <AboutText
            key={item.id}
            id={item.id}
            title={item.title}
            text={item.text}
            language={item.language as 'DE' | 'EN'}
            imageUrl={item.imageUrl}
            isAdmin={true}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}

      {/* Draft nur im aktiven Tab anzeigen */}
      {activeKey === key && draft && (
        <AboutText
          title={draft.title}
          text={draft.text}
          language={draft.language}
          isAdmin={true}
          isEditing={true}
          onSave={handleSave} // führt create aus
          onCancel={handleCancelDraft} // Draft verwerfen
        />
      )}

      {/* Neuer Eintrag-Button nur im aktiven Tab */}
      {activeKey === key && (
        <div>
          <button
            className="about-edit-btn"
            id="about-edit-btn-new"
            onClick={handleStartNew}
            title="Neuen Text hinzufügen"
          >
            <SquarePen size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </Tab>
  );

  return (
    <div className="about-wrapper">
      <Tabs
        id="about-tabs"
        className="mb-3"
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || 'project')}
      >
        {renderTab('project', 'Project')}
        {renderTab('author', 'Author')}
        {renderTab('flokrates', 'Flokrates')}
        {renderTab('lotharius', 'Lotharius')}
        {renderTab('pablo', 'Pablo')}
      </Tabs>
    </div>
  );
};

export default AboutPage;
