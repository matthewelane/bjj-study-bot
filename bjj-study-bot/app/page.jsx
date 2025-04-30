'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function BJJStudyApp() {
  const [curriculum, setCurriculum] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [current, setCurrent] = useState(0);
  const [step, setStep] = useState(0);
  const [showStep, setShowStep] = useState(true);
  const [speakEnabled, setSpeakEnabled] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    fetch('/BJJ_Blue_Belt_Curriculum_Long_Form.csv')
      .then(response => response.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            const cleaned = results.data.filter(row => row.Section && row.Technique && row["Step #"] && row["Step Text"]);
            setCurriculum(cleaned);
            if (cleaned.length > 0) setSelectedSection(cleaned[0].Section);
          }
        });
      });
  }, []);

  const filteredTechniques = curriculum.filter(t => t.Section === selectedSection);
  const uniqueSections = [...new Set(curriculum.map(t => t.Section))];

  const groupedByTechnique = filteredTechniques.reduce((acc, item) => {
    const key = item.Technique;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const techniqueNames = Object.keys(groupedByTechnique);
  const currentTechniqueName = techniqueNames[current];
  const steps = groupedByTechnique[currentTechniqueName] || [];
  const currentStep = steps[step]?.["Step Text"] || "";

  const speak = (text) => {
    if (!speakEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (showStep && currentStep) speak(currentStep);
  }, [showStep, currentStep]);

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      setShowStep(false);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      setShowStep(false);
    }
  };

  const nextTechnique = () => {
    if (current < techniqueNames.length - 1) {
      setCurrent(current + 1);
      setStep(0);
      setShowStep(false);
    }
  };

  const prevTechnique = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setStep(0);
      setShowStep(false);
    }
  };

  const toggleProgress = () => {
    const key = `${selectedSection}__${currentTechniqueName}`;
    setProgress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const shuffledTechniques = [...techniqueNames];
  if (quizMode) shuffledTechniques.sort(() => Math.random() - 0.5);

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>BJJ Blue Belt Study Bot</h1>

      <label>
        Section:
        <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
          {uniqueSections.map(section => (
            <option key={section} value={section}>{section}</option>
          ))}
        </select>
      </label>

      <h2 style={{ marginTop: 16 }}>Technique: {currentTechniqueName} {progress[`${selectedSection}__${currentTechniqueName}`] && '✅'}</h2>

      <div style={{ margin: '12px 0' }}>
        {showStep ? (
          <p><strong>Step {step + 1}:</strong> {currentStep}</p>
        ) : (
          <button onClick={() => setShowStep(true)}>Reveal Step {step + 1}</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <button onClick={prevStep} disabled={step === 0}>Previous Step</button>
        <button onClick={nextStep} disabled={step === steps.length - 1}>Next Step</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <button onClick={prevTechnique} disabled={current === 0}>Previous Technique</button>
        <button onClick={nextTechnique} disabled={current === techniqueNames.length - 1}>Next Technique</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button onClick={() => setSpeakEnabled(!speakEnabled)}>
          {speakEnabled ? 'Disable Voice' : 'Enable Voice'}
        </button>
        <button onClick={() => setQuizMode(!quizMode)}>
          {quizMode ? 'Disable Quiz Mode' : 'Enable Quiz Mode (Shuffle)'}
        </button>
        <button onClick={toggleProgress}>
          Mark {progress[`${selectedSection}__${currentTechniqueName}`] ? 'Incomplete' : 'Reviewed'}
        </button>
      </div>
    </div>
  );
}

