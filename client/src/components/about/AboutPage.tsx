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
import portrait from '../../../public/img/portrait.jpg';
import { selectIsAuthenticated } from '../../store/authSlice';
import { selectLanguage } from '../../store/languageSlice';

export const AboutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const lang = useSelector(selectLanguage);
  const items = useSelector(selectAllAbouts) ?? [];
  const itemsLang = useMemo(
    () => items.filter((a) => a.language === lang),
    [items, lang]
  );
  const isAuth = useSelector(selectIsAuthenticated);
  const [activeKey, setActiveKey] = useState<string>('project');
  const [aboutText, setAboutText] = useState<{
    title: string;
    text: string;
    language: LanguageCode;
  } | null>(null);

  const handleStartNew = () => {
    if (!isAuth) return;
    setAboutText({ title: '', text: '', language: lang });
  };

  const handleSave = async (payload: {
    id?: number;
    title: string;
    text: string;
    language: LanguageCode;
  }) => {
    if (!isAuth) return;
    if (!payload.title.trim() && !payload.text.trim()) return;

    if (payload.id == null) {
      await dispatch(
        createAbout({
          title: payload.title,
          text: payload.text,
          sectionKey: activeKey,
          language: payload.language,
          dateCreated: new Date().toISOString(),
          dateModified: null,
        } as Omit<About, 'id'>)
      );
      setAboutText(null);
    } else {
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
    if (!isAuth) return;
    await dispatch(deleteAboutThunk(id));
  };

  const handleCancelDraft = () => setAboutText(null);

  useEffect(() => {
    setAboutText((d) => (d ? { ...d, language: lang } : d));
  }, [lang]);

  useEffect(() => {
    dispatch(fetchAbouts());
  }, [dispatch]);

  const renderTab = (key: string, title: string, withPortrait?: boolean) => {
    const tabItems = itemsLang.filter((a) => a.sectionKey === key);

    return (
      <Tab eventKey={key} title={title}>
        {withPortrait && tabItems.length > 0 ? (
          <>
            <AboutText
              key={tabItems[0].id}
              id={tabItems[0].id}
              title={tabItems[0].title}
              text={tabItems[0].text}
              language={tabItems[0].language as LanguageCode}
              imageUrl={portrait}
              withImage={true}
              isAdmin={isAuth}
              onSave={handleSave}
              onDelete={handleDelete}
            />
            {tabItems.slice(1).map((item) => (
              <AboutText
                key={item.id}
                id={item.id}
                title={item.title}
                text={item.text}
                language={item.language as LanguageCode}
                isAdmin={isAuth}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </>
        ) : (
          tabItems.map((item) => (
            <AboutText
              key={item.id}
              id={item.id}
              title={item.title}
              text={item.text}
              language={item.language as LanguageCode}
              isAdmin={isAuth}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))
        )}

        {activeKey === key && aboutText && isAuth && (
          <AboutText
            title={aboutText.title}
            text={aboutText.text}
            language={aboutText.language}
            isAdmin={isAuth}
            isEditing={true}
            onSave={handleSave}
            onCancel={handleCancelDraft}
          />
        )}

        {activeKey === key && isAuth && (
          <div className="about-edit-new">
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
  };

  return (
    <div className="about-wrapper fade-in">
      <Tabs
        id="about-tabs"
        className="mb-3"
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k || 'project')}
      >
        {renderTab('project', lang === 'EN' ? 'Project' : 'Projekt')}
        {renderTab('author', lang === 'EN' ? 'Author' : 'Autor', true)}{' '}
        {/* nur hier mit Portrait */}
        {renderTab('flokrates', 'Flokrates')}
        {renderTab('lotharius', 'Lotharius')}
        {renderTab('pablo', 'Pablo')}
      </Tabs>
    </div>
  );
};

export default AboutPage;
