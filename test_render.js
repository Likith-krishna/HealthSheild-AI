import React from 'react';
import { renderToString } from 'react-dom/server';
import HealthCollectionForm from './src/components/HealthCollectionForm.js';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback,
    i18n: { language: 'en' }
  })
}));

try {
  const html = renderToString(React.createElement(HealthCollectionForm, { userId: "test" }));
  console.log("RENDER SUCCESSFUL");
} catch (err) {
  console.error("RENDER ERROR:", err);
}
