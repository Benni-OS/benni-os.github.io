// src/main.ts
import './wave14/performance';
import './genesis-ide.css';
import './spatial-story-v2.css';
import { acquireExperienceBus } from './sovereign-ui/experience-bus';
import { sovereignUI } from './sovereign-ui';
import { SpatialStoryEngine } from './spatial-story-v2';

declare global {
  interface Window {
    __BENNI_SOVEREIGN_UI__?: typeof sovereignUI;
    __BENNI_SPATIAL_STORY_V2__?: SpatialStoryEngine;
  }
}

window.__BENNI_SOVEREIGN_UI__ = sovereignUI;

const bootSovereignExperience = () => {
  acquireExperienceBus(window);
  sovereignUI.boot();
  new SpatialStoryEngine().init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootSovereignExperience);
} else {
  bootSovereignExperience();
}

console.log('🏛️ BENNI·OS Sovereign UI Orchestrator & Shared Experience Bus Online');
