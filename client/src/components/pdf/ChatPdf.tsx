import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import React, { useMemo } from 'react';

import type { Chat } from '../../types/Chats';
import type { Message } from '../../types/Message';
import { actorStyles } from '../../types/ActorStyles';
import { statusMap } from '../../types/Chats';

type RefLite = { chatId: number; chatNumber: number | null; title: string };

type Props = {
  chat: Chat;
  messages: Message[];
  references?: RefLite[];
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    paddingBottom: 56,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
  },
  h1: { fontSize: 18, marginTop: 10 },
  metaRow: { marginBottom: 6, fontSize: 8 },
  metaLabel: { fontWeight: 700 },
  divider: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  msgList: { display: 'flex', flexDirection: 'column', gap: 8 },
  msgRow: { display: 'flex', flexDirection: 'row', marginBottom: 8 },
  msgBubble: {
    maxWidth: '70%',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  center: { justifyContent: 'center' },

  msgHeader: { fontSize: 9, color: '#666', marginBottom: 4 },
  msgText: { fontSize: 11, lineHeight: 1.35, whiteSpace: 'pre-wrap' as any },

  refBlock: { marginTop: 6, marginBottom: 4 },
  refRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  refChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#eef4ff',
    borderWidth: 1,
    borderColor: '#cfe1ff',
    fontSize: 9,
    marginRight: 6,
  },
});

function formatDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? '';
  return d.toLocaleString('de-DE', { dateStyle: 'short' });
}

function alignForActor(
  actor: string | null | undefined
): 'left' | 'right' | 'center' {
  switch (actor) {
    case 'PAB':
      return 'right';
    case 'LOT':
      return 'left';
    default:
      return 'center';
  }
}

export default function ChatPdf({ chat, messages, references = [] }: Props) {
  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.messageNumber - b.messageNumber),
    [messages]
  );

  const msgNumById = useMemo(() => {
    const m = new Map<number, number>();
    for (const x of messages) m.set(x.messageId, x.messageNumber);
    return m;
  }, [messages]);

  const refLabels =
    references.length > 0
      ? references.map((r) => `#${r.chatNumber ?? '—'} · ${r.title}`)
      : (chat.referencedChatIds ?? []).map((id) => `#${id}`);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {chat.datePublished && (
          <Text style={styles.metaRow}>{formatDate(chat.datePublished)}</Text>
        )}
        <Text style={styles.h1}>
          {'#' + (chat.chatNumber ? chat.chatNumber : '') + ' - ' + chat.title}
        </Text>
        <View style={styles.divider} />
        <View>
          <Text style={styles.metaRow}>{chat.tags || ''}</Text>
          <Text>{chat.description || ''}</Text>
          {refLabels.length > 0 && (
            <View style={styles.refBlock}>
              <View style={styles.refRow}>
                {refLabels.map((lbl, i) => (
                  <Text key={`${lbl}-${i}`} style={styles.refChip}>
                    {lbl}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.msgList}>
          {sorted.map((m) => {
            const alignment = alignForActor(m.actor);
            const actorName =
              (m.actor &&
                actorStyles[m.actor as keyof typeof actorStyles]?.actorName) ||
              m.actor ||
              '—';
            const respNum =
              m.respId != null ? msgNumById.get(m.respId) : undefined;
            return (
              <View
                key={m.messageId}
                style={[styles.msgRow, styles[alignment]]}
              >
                <View wrap={false} style={styles.msgBubble}>
                  {' '}
                  {/*Wrap=false -> Seitenumbruch */}
                  <Text style={styles.msgHeader}>
                    #{m.messageNumber} · {actorName}
                    {m.respId ? ` · resp -> ${respNum}` : ''}
                  </Text>
                  <Text style={styles.msgText}>{m.messageText ?? ''}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Seite ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
