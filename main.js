import { summarizeText } from './brain.js';

const summarizeBtn = document.getElementById('summarize-btn');
const textInput = document.getElementById('text-input');
const summaryOutput = document.getElementById('summary-output');

summarizeBtn.addEventListener('click', () => {
 console.log('button pressed');
  const inputText = textInput.value;
  if (!inputText.trim()) {
    summaryOutput.textContent = 'Please paste or type some text first.';
    return;
  }

  const summarySentences = summarizeText(inputText);
  summaryOutput.textContent = summarySentences.length > 0 
    ? summarySentences.join(' ') 
    : 'Could not generate a summary. The text might be too short.';
});