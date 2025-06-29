'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Class, Survey, ChatMessage as ChatMessageType, Constraint } from '@/src/lib/interfaces';
import ChatMessage from '../ChatMessage';

interface ConstraintSettingPhaseProps {
  selectedClass: Class | null;
  selectedSurvey: Survey | null;
  onNext: () => void;
  messages: ChatMessageType[];
  onSendMessage: (content: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  isLoading: boolean;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ConstraintSettingPhase: React.FC<ConstraintSettingPhaseProps> = ({
  selectedClass,
  selectedSurvey,
  onNext,
  messages,
  onSendMessage,
  inputValue,
  onInputChange,
  isLoading,
  isTyping,
  messagesEndRef
}) => {
  const [constraintTemplate, setConstraintTemplate] = useState<Constraint>({
    max_num_teams: 8,
    members_per_team: 4,
    at_least_one_pair_sex: true,
    girl_geq_boy: false,
    boy_geq_girl: false,
    at_least_one_leader: true,
    unique_previous: 2,
    group_diff_coeff: 0.5
  });
  const [showTemplate, setShowTemplate] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize with system prompt when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      // Add initial system message with constraint template
      const systemMessage = `班分け制約条件テンプレート

現在の設定:
- 最大班数: ${constraintTemplate.max_num_teams}班
- 1班あたりの人数: ${constraintTemplate.members_per_team}人
- 男女ペアを含む: ${constraintTemplate.at_least_one_pair_sex ? 'はい' : 'いいえ'}
- 女子≥男子: ${constraintTemplate.girl_geq_boy ? 'はい' : 'いいえ'}
- 男子≥女子: ${constraintTemplate.boy_geq_girl ? 'はい' : 'いいえ'}
- 各班にリーダーを配置: ${constraintTemplate.at_least_one_leader ? 'はい' : 'いいえ'}
- 前回と異なるメンバー数: ${constraintTemplate.unique_previous}人以上
- スコア差調整係数: ${constraintTemplate.group_diff_coeff}

このテンプレートを元に、自然言語で制約条件を調整してください。
例: "1班5人にして、リーダーは不要にしてください"`;
      
      // This would typically trigger a system message, but for now we'll show the template
    }
  }, []);

  const handleTemplateUpdate = (field: keyof Constraint, value: any) => {
    setConstraintTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendConstraints = () => {
    const constraintText = `制約条件を以下に設定しました:
- 最大班数: ${constraintTemplate.max_num_teams}班
- 1班あたりの人数: ${constraintTemplate.members_per_team}人
- 男女ペアを含む: ${constraintTemplate.at_least_one_pair_sex ? 'はい' : 'いいえ'}
- 女子≥男子: ${constraintTemplate.girl_geq_boy ? 'はい' : 'いいえ'}
- 男子≥女子: ${constraintTemplate.boy_geq_girl ? 'はい' : 'いいえ'}
- 各班にリーダーを配置: ${constraintTemplate.at_least_one_leader ? 'はい' : 'いいえ'}
- 前回と異なるメンバー数: ${constraintTemplate.unique_previous}人以上
- スコア差調整係数: ${constraintTemplate.group_diff_coeff}

これで最適化を実行してください。`;
    
    onSendMessage(constraintText);
  };

  if (!selectedClass || !selectedSurvey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">クラスまたはアンケートが選択されていません</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">制約条件設定</h2>
        <p className="text-gray-600">
          班分けの制約条件をAIと協力して設定してください
        </p>
      </div>

      {/* Constraint Template */}
      {showTemplate && (
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">制約条件テンプレート</h3>
            <button
              onClick={() => setShowTemplate(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大班数
              </label>
              <input
                type="number"
                value={constraintTemplate.max_num_teams || ''}
                onChange={(e) => handleTemplateUpdate('max_num_teams', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1班あたりの人数
              </label>
              <input
                type="number"
                value={constraintTemplate.members_per_team || ''}
                onChange={(e) => handleTemplateUpdate('members_per_team', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                前回と異なるメンバー数
              </label>
              <input
                type="number"
                value={constraintTemplate.unique_previous || ''}
                onChange={(e) => handleTemplateUpdate('unique_previous', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                スコア差調整係数
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={constraintTemplate.group_diff_coeff || ''}
                onChange={(e) => handleTemplateUpdate('group_diff_coeff', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraintTemplate.at_least_one_pair_sex}
                onChange={(e) => handleTemplateUpdate('at_least_one_pair_sex', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">男女ペアを含む</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraintTemplate.at_least_one_leader}
                onChange={(e) => handleTemplateUpdate('at_least_one_leader', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">各班にリーダーを配置</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraintTemplate.girl_geq_boy}
                onChange={(e) => handleTemplateUpdate('girl_geq_boy', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">女子≥男子</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={constraintTemplate.boy_geq_girl}
                onChange={(e) => handleTemplateUpdate('boy_geq_girl', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">男子≥女子</span>
            </label>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSendConstraints}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              この設定で開始
            </button>
            <button
              onClick={() => setShowTemplate(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              自然言語で調整
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0"
      >
        {/* System prompt message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-2">制約条件設定について</p>
              <div className="text-sm text-blue-800 space-y-2">
                <p>上記のテンプレートを参考に、班分けの制約条件を設定してください。</p>
                <p>自然言語で以下のような指示ができます：</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>"1班5人にして、リーダーは不要にしてください"</li>
                  <li>"男女比を同じくらいにして、前回とは全く違うメンバーにしてください"</li>
                  <li>"スコアの差を小さくして、視力の配慮が必要な生徒を分散させてください"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message}
            onActionClick={(action, data) => {
              console.log('Action clicked:', action, data);
            }}
          />
        ))}

        {isTyping && (
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>アシスタントが入力中...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Next Button */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              制約条件の設定が完了したら次に進んでください
            </p>
          </div>
          <div className="flex gap-2">
            {!showTemplate && (
              <button
                onClick={() => setShowTemplate(true)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                テンプレートを表示
              </button>
            )}
            <button
              onClick={onNext}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              最適化実行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstraintSettingPhase;