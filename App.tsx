import React, { useState } from 'react';
import { BrandGenerator } from './components/BrandGenerator';
import { ChatBot } from './components/ChatBot';
import { AdaComplianceDashboard } from './components/AdaComplianceDashboard';
import { BrandIcon, ChatIcon, AccessibilityIcon } from './components/Icons';
import { BrandBible } from './types';

type Tab = 'generator' | 'chatbot' | 'ada';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('generator');
  const [brandBible, setBrandBible] = useState<BrandBible | null>(null);

  const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Branding Bible
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            AI-powered branding at your fingertips.
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-gray-800 rounded-lg shadow-md">
            <TabButton tab="generator" label="Brand Generator" icon={<BrandIcon />} />
            <TabButton tab="chatbot" label="Branding Chat" icon={<ChatIcon />} />
            <TabButton tab="ada" label="ADA Compliance" icon={<AccessibilityIcon />} />
          </div>
        </div>

        <main>
          {activeTab === 'generator' && <BrandGenerator onBibleChange={setBrandBible} />}
          {activeTab === 'chatbot' && <ChatBot />}
          {activeTab === 'ada' && <AdaComplianceDashboard brandBible={brandBible} />}
        </main>
      </div>
    </div>
  );
};

export default App;
