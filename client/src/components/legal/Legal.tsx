import './Legal.css';

import { Container } from 'react-bootstrap';
import type { LanguageCode } from '../../constants/language';
import React from 'react';
import { selectLanguage } from '../../store/languageSlice';
import { useSelector } from 'react-redux';

const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-nd/4.0/';

const user = 'flokrates.online';
const domain = 'gmail.com';
const CONTACT_EMAIL = user + '[at]' + domain;
const SITE_NAME = 'Flokrates.Online';
const AUTHOR_NAME = 'P.L.F. John';

const IMPRINT = {
  name: AUTHOR_NAME,
  street: '',
  zipCity: '',
  country: '',
  email: CONTACT_EMAIL,
};

const PIXABAY_IMAGE = {
  title: 'Vorhang Kino Rot Theater',
  author: 'Gerd Altmann',
  url: 'https://pixabay.com/de/illustrations/vorhang-kino-rot-theater-595006/',
};

export default function Legal() {
  const lang = useSelector(selectLanguage) as LanguageCode; // 'DE' | 'EN'
  const t = CONTENT[lang] ?? CONTENT.EN;

  return (
    <Container className="legal-container">
      <Section title={t.imprint.h}>{t.imprint.body}</Section>
      <Section title={t.copyright.h}>{t.copyright.body}</Section>
      <Section title={t.license.h}>{t.license.body}</Section>
      <Section title={t.images.h}>{t.images.body}</Section>
      <Section title={t.privacy.h}>{t.privacy.body}</Section>

      <hr className="legal-separator" />
      <p className="legal-footer">{t.footer}</p>
    </Container>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="legal-section">
      <h2 className="legal-h2">{title}</h2>
      <div className="legal-body">{children}</div>
    </section>
  );
}

type Content = {
  imprint: { h: string; body: React.ReactNode };
  copyright: { h: string; body: React.ReactNode };
  license: { h: string; body: React.ReactNode };
  images: { h: string; body: React.ReactNode };
  privacy: { h: string; body: React.ReactNode };
  footer: string;
};

const CONTENT: Record<LanguageCode, Content> = {
  DE: {
    imprint: {
      h: 'Kontakt',
      body: (
        <>
          <p>
            Name: {IMPRINT.name}
            <br />
            Email: {IMPRINT.email}
            {/*<br />
            {IMPRINT.street}
            <br />
            {IMPRINT.zipCity}
            <br />
            {IMPRINT.country}*/}
          </p>
        </>
      ),
    },
    copyright: {
      h: 'Urheberrecht an Texten',
      body: (
        <>
          <p>
            Alle auf <strong>{SITE_NAME}</strong> veröffentlichten Texte sind –
            sofern nicht anders angegeben – urheberrechtlich geschützt.
          </p>
          <p>
            Urheber: <strong>{AUTHOR_NAME}</strong>.
          </p>
          <p>
            Du darfst Inhalte im Rahmen der gesetzlichen Schranken (z. B.
            Zitatrecht) nutzen. Für darüber hinausgehende Nutzungen (z. B.
            vollständige Übernahmen, Abdrucke in Publikationen, Bearbeitungen)
            kontaktiere mich bitte.
          </p>
        </>
      ),
    },
    license: {
      h: 'Lizenz für die Texte (CC BY-NC-ND 4.0)',
      body: (
        <>
          <p>
            Sofern bei einem Text nicht anders vermerkt, stehen die Texte unter
            der Lizenz{' '}
            <strong>
              Creative Commons Attribution-NonCommercial-NoDerivatives 4.0
              International (CC BY-NC-ND 4.0)
            </strong>
            .
          </p>
          <ul>
            <li>
              <strong>Erlaubt:</strong> Teilen/Weitergeben des unveränderten
              Textes (z. B. Weiterleitung, Ausdruck),
              <strong> nicht-kommerziell</strong> und mit{' '}
              <strong>Namensnennung</strong>.
            </li>
            <li>
              <strong>Nicht erlaubt:</strong> kommerzielle Nutzung,
              Bearbeitung/Umformulierung/Übersetzung, Kürzungen/Remixe ohne
              vorherige Zustimmung.
            </li>
            <li>
              <strong>Namensnennung:</strong> Bitte nenne mindestens Titel,
              Autor ({AUTHOR_NAME}) und einen Link zur Quelle.
            </li>
          </ul>
          <p>
            Lizenztext:{' '}
            <a
              href={LICENSE_URL}
              target="_blank"
              rel="noreferrer"
              id="legal-link"
            >
              {LICENSE_URL}
            </a>
          </p>
        </>
      ),
    },
    images: {
      h: 'Bildnachweis / Lizenzen',
      body: (
        <>
          <p>
            Hintergrundbild: <strong>{PIXABAY_IMAGE.title}</strong>{' '}
            {PIXABAY_IMAGE.author ? (
              <>
                von <strong>{PIXABAY_IMAGE.author}</strong>{' '}
              </>
            ) : null}
            (Quelle: Pixabay).
          </p>
          <p>
            Link:{' '}
            <a
              href={PIXABAY_IMAGE.url}
              target="_blank"
              rel="noreferrer"
              id="legal-link"
            >
              {PIXABAY_IMAGE.url}
            </a>
          </p>
        </>
      ),
    },
    privacy: {
      h: 'Datenschutz (Kurzfassung)',
      body: (
        <>
          <p>
            Diese Seite ist primär ein persönliches Projekt. Trotzdem fallen
            technisch bedingt Daten an, die für den Betrieb notwendig sind.
          </p>

          <h3 className="legal-h3">Server-Logfiles</h3>
          <p>
            Beim Aufruf der Seite verarbeitet der Server typischerweise
            technische Daten (z. B. IP-Adresse, Datum/Uhrzeit, angeforderte
            Seite, User-Agent), um die Seite auszuliefern und zu schützen.
          </p>

          <h3 className="legal-h3">Drittanbieter</h3>
          <p>
            Es werden keine externen Tracking- oder Werbedienste eingesetzt.
          </p>
        </>
      ),
    },
    footer: 'Stand: Januar 2026.',
  },

  EN: {
    imprint: {
      h: 'Contact',
      body: (
        <>
          <p>
            Name: {IMPRINT.name}
            <br />
            Email: {IMPRINT.email}
          </p>
        </>
      ),
    },
    copyright: {
      h: 'Copyright (Texts)',
      body: (
        <>
          <p>
            Unless stated otherwise, all texts published on{' '}
            <strong>{SITE_NAME}</strong> are protected by copyright.
          </p>
          <p>
            Author: <strong>{AUTHOR_NAME}</strong>.
          </p>
          <p>
            You may use excerpts where permitted by law (e.g., quotation with
            attribution). For any use beyond that (e.g., full reprints,
            republication, adaptations), please contact me.
          </p>
        </>
      ),
    },
    license: {
      h: 'License for texts (CC BY-NC-ND 4.0)',
      body: (
        <>
          <p>
            Unless a text states otherwise, texts are licensed under{' '}
            <strong>
              Creative Commons Attribution-NonCommercial-NoDerivatives 4.0
              International (CC BY-NC-ND 4.0)
            </strong>
            .
          </p>

          <ul>
            <li>
              <strong>Allowed:</strong> Share/redistribute the unmodified text
              for <strong>non-commercial</strong> purposes with{' '}
              <strong>attribution</strong>.
            </li>
            <li>
              <strong>Not allowed:</strong> commercial use,
              edits/adaptations/translations, excerpts/remixes as a new work
              without prior permission.
            </li>
            <li>
              <strong>Attribution:</strong> Please include at least title,
              author ({AUTHOR_NAME}), and a link to the source.
            </li>
          </ul>

          <p>
            License:{' '}
            <a
              href={LICENSE_URL}
              target="_blank"
              rel="noreferrer"
              id="legal-link"
            >
              {LICENSE_URL}
            </a>
          </p>
        </>
      ),
    },
    images: {
      h: 'Image credits / licenses',
      body: (
        <>
          <p>
            Background image: <strong>{PIXABAY_IMAGE.title}</strong>{' '}
            {PIXABAY_IMAGE.author ? (
              <>
                by <strong>{PIXABAY_IMAGE.author}</strong>{' '}
              </>
            ) : null}
            (source: Pixabay).
          </p>
          <p>
            Link:{' '}
            <a
              href={PIXABAY_IMAGE.url}
              target="_blank"
              rel="noreferrer"
              id="legal-link"
            >
              {PIXABAY_IMAGE.url}
            </a>
          </p>
        </>
      ),
    },
    privacy: {
      h: 'Privacy (Short version)',
      body: (
        <>
          <p>
            This is primarily a personal project. However, some technical data
            is processed to operate the website.
          </p>

          <h3 className="legal-h3">Server logs</h3>
          <p>
            When you access the site, the server typically processes technical
            data (e.g., IP address, timestamp, requested page, user agent) to
            deliver and secure the service.
          </p>

          <h3 className="legal-h3">Third-party services</h3>
          <p>No third-party tracking or advertising services are used.</p>
        </>
      ),
    },
    footer: 'Last updated: Jan 2026.',
  },
};
