import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import type { Chat } from '../../types/Chats';
import type { LanguageCode } from '../../constants/language';
import type { Message } from '../../types/Message';
import { actorStyles } from '../../types/ActorStyles';
import { useMemo } from 'react';

type RefLite = { chatId: number; chatNumber: number | null; title: string };

Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/16.0.1/72x72/',
});

type Props = {
  chat: Chat;
  messages: Message[];
  references?: RefLite[];
  lang: LanguageCode;
};

const LICENSE_SHORT = 'CC BY-NC-ND 4.0';
const WEBSITE_URL = 'flokrates.de';

function legalLine(lang: LanguageCode) {
  const year = new Date().getFullYear();
  return lang === 'DE'
    ? `© ${year} · ${WEBSITE_URL} · Lizenz: ${LICENSE_SHORT}`
    : `© ${year} · ${WEBSITE_URL} · License: ${LICENSE_SHORT}`;
}

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
  h1: { fontSize: 18, marginTop: 10, textAlign: 'center' },
  metaRow: { marginBottom: 6, fontSize: 8 },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  metaLabel: {
    width: 80, // Tab stop
    fontSize: 8,
    color: '#666',
    fontWeight: 700,
  },
  metaValue: {
    flex: 1,
    fontSize: 8,
    color: '#222',
    lineHeight: 1.35,
  },
  legalRow: {
    marginBottom: 6,
    fontSize: 8,
    color: '#666',
    justifyContent: 'center',
  },
  divider: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 32,
    right: 32,
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 8,
    color: '#999',
  },

  footerLeft: { width: '25%' },
  footerCenter: { width: '50%', textAlign: 'center' },
  footerRight: { width: '25%', textAlign: 'right' },
  msgList: { display: 'flex', flexDirection: 'column', gap: 8 },
  msgRow: { display: 'flex', flexDirection: 'row', marginBottom: 8 },
  msgBubble: {
    maxWidth: '70%',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },
  center: { justifyContent: 'center' },
  msgBubblePAB: { backgroundColor: '#fff1ec', borderColor: '#ff4500' },
  msgBubbleFLO: { backgroundColor: '#edf2ff', borderColor: '#4169e1' },
  msgBubbleLOT: { backgroundColor: '#ffe9f3', borderColor: '#ff1493' },
  msgHeader: { fontSize: 9, marginBottom: 4 },
  msgHeaderPAB: { color: '#ff4500' }, // orangered
  msgHeaderFLO: { color: '#4169e1' }, // royalblue
  msgHeaderLOT: { color: '#ff1493' }, // deeppink
  msgText: { fontSize: 11, lineHeight: 1.35, color: '#111' },
});

function formatDate(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso ?? '';
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function alignForActor(
  actor: string | null | undefined
): 'left' | 'right' | 'center' {
  switch (actor) {
    case 'PAB':
      return 'left';
    case 'LOT':
      return 'right';
    default:
      return 'center';
  }
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaLine}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

export default function ChatPdf({ chat, messages, lang }: Props) {
  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.messageNumber - b.messageNumber),
    [messages]
  );

  const msgNumById = useMemo(() => {
    const m = new Map<number, number>();
    for (const x of messages) m.set(x.messageId, x.messageNumber);
    return m;
  }, [messages]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>
          {(chat.chatNumber ? chat.chatNumber : '') + ' - ' + chat.title}
        </Text>
        <View style={styles.divider} />
        <View>
          <MetaLine
            label={lang === 'EN' ? 'Topic:' : 'Thema:'}
            value={chat.tags || ''}
          />

          <MetaLine
            label={lang === 'EN' ? 'Story:' : 'Handlung:'}
            value={chat.description || ''}
          />

          {chat.datePublished && (
            <MetaLine
              label={lang === 'EN' ? 'Published:' : 'Veröffentlicht:'}
              value={formatDate(chat.datePublished)}
            />
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

            const bubbleVariant =
              m.actor === 'PAB'
                ? styles.msgBubblePAB
                : m.actor === 'LOT'
                  ? styles.msgBubbleLOT
                  : styles.msgBubbleFLO; // default = Flokrates

            const headerVariant =
              m.actor === 'PAB'
                ? styles.msgHeaderPAB
                : m.actor === 'LOT'
                  ? styles.msgHeaderLOT
                  : styles.msgHeaderFLO;

            return (
              <View
                key={m.messageId}
                style={[styles.msgRow, styles[alignment]]}
              >
                <View wrap={false} style={[styles.msgBubble, bubbleVariant]}>
                  <Text style={[styles.msgHeader, headerVariant]}>
                    #{m.messageNumber} · {actorName}
                    {m.respId != null ? ` · >> #${respNum ?? '—'}` : ''}
                  </Text>
                  <Text style={styles.msgText}>{m.messageText ?? ''}</Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}></Text>
          <Text style={styles.footerCenter}>{legalLine(lang)}</Text>

          <Text
            style={styles.footerRight}
            render={({ pageNumber, totalPages }) =>
              `Seite ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
