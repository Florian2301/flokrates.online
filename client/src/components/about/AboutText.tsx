import { LanguageCode, languageMap } from '../../constants/language';
import { PencilLine, Save, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type Props = {
  id?: number;
  title: string;
  text: string;
  language: LanguageCode;
  imageUrl?: string | null;
  isAdmin?: boolean;
  isEditing?: boolean;
  onSave?: (payload: {
    id?: number;
    title: string;
    text: string;
    language: LanguageCode;
  }) => void;
  onDelete?: (id: number) => void;
  onCancel?: () => void;
};

const AboutText: React.FC<Props> = ({
  id,
  title,
  text,
  language,
  imageUrl,
  isAdmin = false,
  isEditing = false,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [editing, setEditing] = useState(isEditing && isAdmin);
  const [editTitle, setEditTitle] = useState(title);
  const [editText, setEditText] = useState(text);
  const [editLanguage, setEditLanguage] = useState<LanguageCode>(
    language ?? 'DE'
  );

  const handleEdit = () => {
    if (!isAdmin) return;
    setEditing(true);
  };

  const handleSave = () => {
    if (!isAdmin) return;
    onSave?.({
      id,
      title: editTitle.trim(),
      text: editText.trim(),
      language: editLanguage,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!isAdmin) return;
    if (id != null) onDelete?.(id);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditTitle(title);
    setEditText(text);
    setEditLanguage(language ?? 'DE');
    onCancel?.();
  };

  useEffect(() => {
    setEditTitle(title);
    setEditText(text);
    setEditLanguage(language ?? 'DE');
  }, [title, text, language]);

  useEffect(() => {
    if (!isAdmin && editing) setEditing(false);
  }, [isAdmin, editing]);

  return (
    <section className="about-text-block">
      {imageUrl && (
        <div className="about-text-image">
          <img src={imageUrl} alt={editTitle} />
        </div>
      )}

      <div className="about-text-content">
        {!editing ? (
          <>
            <h4 id="about-title">{title}</h4>
            <p id="about-text">{text}</p>
          </>
        ) : (
          <>
            <input
              className="about-input"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Titel eingeben..."
            />
            <textarea
              className="about-textarea"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Text eingeben..."
              rows={10}
            />
          </>
        )}
      </div>

      {isAdmin && (
        <div className="about-action">
          {!editing ? (
            <button
              className="about-edit-btn"
              onClick={handleEdit}
              title="Bearbeiten"
            >
              <PencilLine size={18} strokeWidth={1.5} />
            </button>
          ) : (
            <>
              <button
                className="about-edit-btn"
                onClick={handleSave}
                title="Speichern"
              >
                <Save size={18} strokeWidth={1.5} />
              </button>
              <button
                className="about-edit-btn"
                onClick={handleCancel}
                title="Abbrechen"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
              {id != null && (
                <button
                  className="about-edit-btn"
                  onClick={handleDelete}
                  title="Löschen"
                >
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
              )}
              <select
                className="about-input-language"
                value={editLanguage}
                onChange={(e) =>
                  setEditLanguage(e.target.value as LanguageCode)
                }
              >
                {Object.entries(languageMap).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default AboutText;
