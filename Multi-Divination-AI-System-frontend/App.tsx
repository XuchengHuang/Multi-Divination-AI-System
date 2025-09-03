
import React, { useState, useCallback, useEffect } from 'react';
import { DivinationMethod, UserInputs, Report, GeminiGenerateContentResponse, GroundingChunk, AppStep, LifePathNumberInputData, PalmistryInputData, AstrologyInputData, MBTIInputData, TarotInputData, ChatMessage } from './types';
import { DIVINATION_METHODS_CONFIG, APP_TITLE } from './constants';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DivinationMethodSelector } from './components/DivinationMethodSelector';
import { LifePathNumberInput } from './components/LifePathNumberInput';
import { PalmistryInput } from './components/PalmistryInput';
import { AstrologyInput } from './components/AstrologyInput';
import { MBTIInput } from './components/MBTIInput';
import { TarotInput } from './components/TarotInput';
import { ReportDisplay } from './components/ReportDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { ChatInterface } from './components/ChatInterface';
import { generateDivinationReport, generateIntegratedReport, generateCharacterTags, startChatSessionWithReports, sendMessageInChat, endChatSession } from './services/geminiService';
import { backendService, BatchReadingData } from './services/backendService';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { BookOpenIcon } from './components/icons/BookOpenIcon';
import { UserGroupIcon } from './components/icons/UserGroupIcon';
import { ChevronRightIcon } from './components/icons/ChevronRightIcon'; // For chat button

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('demographics');
  const [userName, setUserName] = useState<string>('');
  const [mainQuestion, setMainQuestion] = useState<string>('');
  
  const [selectedMethods, setSelectedMethods] = useState<Set<DivinationMethod>>(new Set());
  const [orderedSelectedMethods, setOrderedSelectedMethods] = useState<DivinationMethod[]>([]);
  const [currentInputMethodIndex, setCurrentInputMethodIndex] = useState<number>(0);

  const [userInputs, setUserInputs] = useState<UserInputs>({});
  const [individualReports, setIndividualReports] = useState<Report[]>([]);
  const [integratedReport, setIntegratedReport] = useState<Report | null>(null);
  const [characterTags, setCharacterTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For report generation
  const [error, setError] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingChunk[]>([]);

  // Chat specific state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);


  // *** 🆕 Backend saving state ***
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);


  const resetAppToBase = () => {
    setCurrentStep('demographics');
    setUserName('');
    setMainQuestion('');
    setSelectedMethods(new Set());
    setOrderedSelectedMethods([]);
    setCurrentInputMethodIndex(0);
    setUserInputs({});
    setIndividualReports([]);
    setIntegratedReport(null);
    setCharacterTags([]);
    setError(null);
    setGroundingSources([]);
    setChatMessages([]);
    setIsChatLoading(false);
    endChatSession(); // Tell service to clear its active session
  }

  const handleDemographicsSubmit = (name: string, question: string) => {
    setUserName(name);
    setMainQuestion(question);
    setCurrentStep('methodSelection');
    setError(null);
  };

  const handleMethodToggle = useCallback((method: DivinationMethod) => {
    setSelectedMethods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(method)) {
        newSet.delete(method);
        setUserInputs(currentInputs => {
          const updatedInputs = { ...currentInputs };
          delete updatedInputs[method];
          return updatedInputs;
        });
      } else {
        newSet.add(method);
      }
      return newSet;
    });
    setIndividualReports([]);
    setIntegratedReport(null);
    setCharacterTags([]);
    setGroundingSources([]);
    setError(null);
  }, []);

  const handleProceedToInputs = () => {
    if (selectedMethods.size === 0) {
      setError("Please select at least one divination method.");
      return;
    }
    const methodsArray = DIVINATION_METHODS_CONFIG
      .filter(config => selectedMethods.has(config.id))
      .map(config => config.id);
    setOrderedSelectedMethods(methodsArray);
    setCurrentInputMethodIndex(0);
    setCurrentStep('inputForm');
    setError(null);
  };

  const handleInputChange = useCallback((method: DivinationMethod, data: any) => {
    setUserInputs(prev => {
      const newInputs = { ...prev };

      // Start with the direct update
      newInputs[method] = data;

      // Synchronize Date of Birth if both methods are selected
      const isLifePathSelected = selectedMethods.has(DivinationMethod.LifePathNumber);
      const isAstrologySelected = selectedMethods.has(DivinationMethod.Astrology);

      if (isLifePathSelected && isAstrologySelected && 'dob' in data) {
        const newDob = (data as LifePathNumberInputData | AstrologyInputData).dob;

        if (method === DivinationMethod.LifePathNumber) {
          // Update Astrology's DOB
          const astrologyData = (newInputs[DivinationMethod.Astrology] || {}) as AstrologyInputData;
          newInputs[DivinationMethod.Astrology] = { ...astrologyData, dob: newDob };
        } else if (method === DivinationMethod.Astrology) {
          // Update Life Path's DOB
          const lifePathData = (newInputs[DivinationMethod.LifePathNumber] || {}) as LifePathNumberInputData;
          newInputs[DivinationMethod.LifePathNumber] = { ...lifePathData, dob: newDob };
        }
      }

      return newInputs;
    });

    if (orderedSelectedMethods.length > 0 && method === orderedSelectedMethods[currentInputMethodIndex]) {
        setError(null);
    }
  }, [selectedMethods, orderedSelectedMethods, currentInputMethodIndex]);
  
  const validateCurrentInput = (): boolean => {
    if (orderedSelectedMethods.length === 0) return true;
    const currentMethod = orderedSelectedMethods[currentInputMethodIndex];
    const inputs = userInputs[currentMethod];

    if (!inputs) { 
      setError(`Please provide inputs for ${currentMethod}.`);
      return false;
    }

    switch (currentMethod) {
      case DivinationMethod.LifePathNumber:
        if (!(inputs as LifePathNumberInputData).dob) {
           setError(`Date of Birth is required for ${currentMethod}.`); return false;
        }
        break;
      case DivinationMethod.Palmistry:
        if (!(inputs as PalmistryInputData).imageData) {
          setError(`Palm image is required for ${currentMethod}.`); return false;
        }
        break;
      case DivinationMethod.Astrology:
        const astroInputs = inputs as AstrologyInputData;
        if (!astroInputs.dob || !astroInputs.tob || !astroInputs.pob?.trim()) {
          setError(`Date of Birth, Time of Birth, and Place of Birth are required for ${currentMethod}.`); return false;
        }
        break;
      case DivinationMethod.MBTI:
        if (!(inputs as MBTIInputData).type) {
          setError(`MBTI type is required. Please complete the quiz or select your type for ${currentMethod}.`); return false;
        }
        break;
      case DivinationMethod.Tarot:
        if(!(inputs as TarotInputData).initiateReading){
            setError(`Please draw card(s) for the Tarot reading for ${currentMethod}.`); return false;
        }
        break;
      default:
        const _exhaustiveCheck: never = currentMethod; 
        setError(`Validation not implemented for method: ${_exhaustiveCheck}`); return false;
    }
    setError(null);
    return true;
  };

  const handleNextInput = () => {
    if (!validateCurrentInput()) return;
    if (currentInputMethodIndex < orderedSelectedMethods.length - 1) {
      setCurrentInputMethodIndex(prev => prev + 1);
    } else {
      generateAllReports();
    }
    setError(null); 
  };

  const handlePreviousInput = () => {
    if (currentInputMethodIndex > 0) {
      setCurrentInputMethodIndex(prev => prev - 1);
    } else {
      setCurrentStep('methodSelection');
    }
    setError(null); 
  };
  
  const handleGoBackToEdit = () => {
    setCurrentStep('inputForm');
    // Go to the last input form to allow quick edits before regenerating
    setCurrentInputMethodIndex(orderedSelectedMethods.length - 1);
    setError(null);
  };


  // *** 🆕 保存报告到后端 ***
  const saveReportsToBackend = async (
    individualReports: Report[],
    integratedReport: Report | null,
    characterTags: string[]
  ) => {
    try {
      setIsSaving(true);
      setSaveStatus('saving');
      setSaveError(null);

      // ① 前端方法枚举 -> 后端要求的枚举ID
      const BACKEND_METHOD_ID: Record<DivinationMethod, string> = {
        [DivinationMethod.LifePathNumber]: 'LifePathNumber',
        [DivinationMethod.Palmistry]: 'Palmistry',
        [DivinationMethod.Astrology]: 'Astrology',
        [DivinationMethod.MBTI]: 'MBTI',
        [DivinationMethod.Tarot]: 'Tarot',
      };

      // ② individual_reports：用“后端枚举ID”作为键
      const individualReportsDict: Record<string, string> = {};
      for (const m of orderedSelectedMethods) {
        const methodIdForBackend = BACKEND_METHOD_ID[m];
        const displayName = DIVINATION_METHODS_CONFIG.find(c => c.id === m)?.name || String(m);
        // 前面生成时的标题是 `${展示名} Analysis`
        const reportForThisMethod = individualReports.find(r => r.title === `${displayName} Analysis`);
        if (reportForThisMethod) {
          individualReportsDict[methodIdForBackend] = reportForThisMethod.content;
        }
      }

      // ③ input_data：按已选方法汇总入参（保持你原来的逻辑）
      const inputData: Record<string, any> = {};
      orderedSelectedMethods.forEach(method => {
        if (userInputs[method]) {
          switch (method) {
            case DivinationMethod.LifePathNumber: {
              const lifePathData = userInputs[method] as LifePathNumberInputData;
              if (lifePathData?.dob) inputData.birth_date = lifePathData.dob;
              break;
            }
            case DivinationMethod.Palmistry: {
              const palmData = userInputs[method] as PalmistryInputData;
              if (palmData?.imageData) inputData.palm_image_data = palmData.imageData;
              inputData.hand_type = "uploaded";
              break;
            }
            case DivinationMethod.Astrology: {
              const astroData = userInputs[method] as AstrologyInputData;
              if (astroData?.dob) inputData.birth_date = astroData.dob;
              if (astroData?.tob) inputData.birth_time = astroData.tob;
              if (astroData?.pob) inputData.birth_location = astroData.pob;
              break;
            }
            case DivinationMethod.MBTI: {
              const mbtiData = userInputs[method] as MBTIInputData;
              if (mbtiData?.type) inputData.mbti_type = mbtiData.type;
              break;
            }
            case DivinationMethod.Tarot: {
              inputData.tarot_question = mainQuestion;
              inputData.tarot_reading_initiated = true;
              break;
            }
          }
        }
      });

      // ④ selected_methods：必须使用后端的枚举ID（不能用“Life Path Number”）
      const selected_methods = orderedSelectedMethods.map(m => BACKEND_METHOD_ID[m]);

      // ⑤ 组装请求体；integrated_report / character_archetypes 没有就不传，避免 422
      const batchData: BatchReadingData = {
        user_name: userName,
        primary_question: mainQuestion,
        selected_methods,
        individual_reports: individualReportsDict,
        ...(integratedReport?.content ? { integrated_report: integratedReport.content } : {}),
        input_data: inputData,
        ...(characterTags?.length ? { character_archetypes: characterTags } : {}),
        ai_model_used: "gemini-2.5-flash",
        total_processing_time: Math.floor(Date.now() / 1000)
      };

      // 调试：打印最终 payload
      console.log('[payload to backend]', JSON.stringify(batchData, null, 2));

      const result = await backendService.saveBatchReadings(batchData);
      setSaveStatus('saved');
      console.log('✅ 报告保存成功:', result.message);

    } catch (error: any) {
      console.error('❌ 保存报告失败:', error);
      setSaveStatus('error');
      setSaveError(error.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };



  // const generateAllReports = async () => {
  //   if (orderedSelectedMethods.length === 0) {
  //     setError("No methods selected for analysis.");
  //     return;
  //   }
  //   for(let i=0; i < orderedSelectedMethods.length; i++){
  //       const method = orderedSelectedMethods[i];
  //       const currentInputs = userInputs[method];
  //       let isValid = true;
  //       let tempError = "";

  //       if (!currentInputs) {
  //           isValid = false;
  //           tempError = `Missing inputs for ${method}.`;
  //       } else {
  //           switch (method) {
  //               case DivinationMethod.LifePathNumber: if (!(currentInputs as LifePathNumberInputData).dob) { isValid = false; tempError = `Date of Birth is missing for Life Path Number.`; } break;
  //               case DivinationMethod.Palmistry: if (!(currentInputs as PalmistryInputData).imageData) { isValid = false; tempError = `Palm image is missing for Palmistry.`; } break;
  //               case DivinationMethod.Astrology: const ai = currentInputs as AstrologyInputData; if (!ai.dob || !ai.tob || !ai.pob?.trim()) { isValid = false; tempError = `DOB, TOB, or POB is missing for Astrology.`;} break;
  //               case DivinationMethod.MBTI: if (!(currentInputs as MBTIInputData).type) { isValid = false; tempError = `MBTI type is missing.`; } break;
  //               case DivinationMethod.Tarot: if (!(currentInputs as TarotInputData).initiateReading) { isValid = false; tempError = `Tarot reading not initiated.`; } break;
  //               default: const _e: never = method; tempError = `Unknown method: ${_e}`; isValid = false; break;
  //           }
  //       }
  //       if(!isValid){
  //           setError(`Cannot generate reports. ${tempError} Please go back and complete all required fields for ${method}.`);
  //           setCurrentInputMethodIndex(i); 
  //           setCurrentStep('inputForm');
  //           return;
  //       }
  //   }

  //   setCurrentStep('generatingReport');
  //   setIsLoading(true);
  //   setError(null);
  //   setIndividualReports([]);
  //   setIntegratedReport(null);
  //   setCharacterTags([]);
  //   setGroundingSources([]);

  //   try {
  //     const currentIndividualReports: Report[] = [];
  //     let allGroundingSourcesAccumulated: GroundingChunk[] = [];

  //     for (const method of orderedSelectedMethods) {
  //       const inputData = userInputs[method];
  //       if (inputData) {
  //         const response: GeminiGenerateContentResponse = await generateDivinationReport(method, inputData, mainQuestion, userName);
  //         currentIndividualReports.push({ title: `${DIVINATION_METHODS_CONFIG.find(m => m.id === method)?.name || method} Analysis`, content: response.text });
  //         if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
  //           allGroundingSourcesAccumulated = [...allGroundingSourcesAccumulated, ...response.candidates[0].groundingMetadata.groundingChunks];
  //         }
  //       }
  //     }
  //     setIndividualReports(currentIndividualReports);

  //     if (currentIndividualReports.length > 0) {
  //       const integratedResponse: GeminiGenerateContentResponse = await generateIntegratedReport(currentIndividualReports, userName, mainQuestion);
  //       setIntegratedReport({ title: "Integrated Comprehensive Analysis", content: integratedResponse.text });
  //        if (integratedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
  //           allGroundingSourcesAccumulated = [...allGroundingSourcesAccumulated, ...integratedResponse.candidates[0].groundingMetadata.groundingChunks];
  //       }

  //       const tagsResponse = await generateCharacterTags(integratedResponse.text, userName);
  //       try {
  //           let jsonStr = tagsResponse.text.trim();
  //           // No need for fence regex here as geminiService already handles it
  //           const parsedTags = JSON.parse(jsonStr);
  //           if (Array.isArray(parsedTags) && parsedTags.every(tag => typeof tag === 'string')) {
  //                setCharacterTags(parsedTags);
  //           } else if (typeof parsedTags === 'object' && parsedTags !== null && Object.values(parsedTags).every(tag => typeof tag === 'string')) {
  //                setCharacterTags(Object.values(parsedTags)); // Handle if AI returns an object like {"tags": [...]} or {"1": "tag1", ...}
  //           } else {
  //               console.warn("Parsed character tags are not an array of strings or expected object:", parsedTags);
  //               setCharacterTags([`Tags (preview): ${tagsResponse.text.substring(0, 100)}... (format error)`]);
  //           }
  //       } catch (e) {
  //           console.error("Failed to parse character tags JSON:", e);
  //           setCharacterTags([`Tags (preview): ${tagsResponse.text.substring(0,100)}... (parsing error)`]);
  //       }
  //     }
      
  //     const uniqueGroundingSources = Array.from(new Map(allGroundingSourcesAccumulated.filter(gs => gs.web?.uri).map(gs => [gs.web!.uri, gs])).values());
  //     setGroundingSources(uniqueGroundingSources);


  //     // *** 🆕 保存到后端（后台进行，不阻断用户查看）***
  //     try {
  //       await saveReportsToBackend(currentIndividualReports, currentIntegratedReport, characterTags);
  //     } catch (saveError) {
  //       // 静默处理保存错误，不影响用户查看报告
  //       console.warn('报告显示正常，但后端保存失败:', saveError);
  //     }


  //     setCurrentStep('displayReport');

  //   } catch (err: any) {
  //     console.error("Error during analysis:", err);
  //     setError(err.message || "An unexpected error occurred.");
  //     setCurrentStep(orderedSelectedMethods.length > 0 ? 'inputForm' : 'methodSelection'); 
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



  const generateAllReports = async () => {
    if (orderedSelectedMethods.length === 0) {
      setError("No methods selected for analysis.");
      return;
    }

    // 1) 逐项校验输入
    for (let i = 0; i < orderedSelectedMethods.length; i++) {
      const method = orderedSelectedMethods[i];
      const currentInputs = userInputs[method];
      let isValid = true;
      let tempError = "";

      if (!currentInputs) {
        isValid = false;
        tempError = `Missing inputs for ${method}.`;
      } else {
        switch (method) {
          case DivinationMethod.LifePathNumber:
            if (!(currentInputs as LifePathNumberInputData).dob) {
              isValid = false; tempError = `Date of Birth is missing for Life Path Number.`;
            }
            break;
          case DivinationMethod.Palmistry:
            if (!(currentInputs as PalmistryInputData).imageData) {
              isValid = false; tempError = `Palm image is missing for Palmistry.`;
            }
            break;
          case DivinationMethod.Astrology: {
            const ai = currentInputs as AstrologyInputData;
            if (!ai.dob || !ai.tob || !ai.pob?.trim()) {
              isValid = false; tempError = `DOB, TOB, or POB is missing for Astrology.`;
            }
            break;
          }
          case DivinationMethod.MBTI:
            if (!(currentInputs as MBTIInputData).type) {
              isValid = false; tempError = `MBTI type is missing.`;
            }
            break;
          case DivinationMethod.Tarot:
            if (!(currentInputs as TarotInputData).initiateReading) {
              isValid = false; tempError = `Tarot reading not initiated.`;
            }
            break;
          default:
            const _e: never = method;
            tempError = `Unknown method: ${_e}`; isValid = false;
            break;
        }
      }

      if (!isValid) {
        setError(`Cannot generate reports. ${tempError} Please go back and complete all required fields for ${method}.`);
        setCurrentInputMethodIndex(i);
        setCurrentStep('inputForm');
        return;
      }
    }

    // 2) 进入生成中状态
    setCurrentStep('generatingReport');
    setIsLoading(true);
    setError(null);
    setIndividualReports([]);
    setIntegratedReport(null);
    setCharacterTags([]);
    setGroundingSources([]);

    try {
      const currentIndividualReports: Report[] = [];
      let allGroundingSourcesAccumulated: GroundingChunk[] = [];

      // 3) 逐方法生成单项报告
      for (const method of orderedSelectedMethods) {
        const inputData = userInputs[method];
        if (!inputData) continue;

        const response: GeminiGenerateContentResponse =
          await generateDivinationReport(method, inputData, mainQuestion, userName);

        currentIndividualReports.push({
          title: `${DIVINATION_METHODS_CONFIG.find(m => m.id === method)?.name || method} Analysis`,
          content: response.text
        });

        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          allGroundingSourcesAccumulated = [
            ...allGroundingSourcesAccumulated,
            ...response.candidates[0].groundingMetadata.groundingChunks
          ];
        }
      }
      setIndividualReports(currentIndividualReports);

      // 4) 综合报告 + 标签（使用局部变量承接）
      let integratedObj: Report | null = null;
      let localTags: string[] = [];

      if (currentIndividualReports.length > 0) {
        // 4.1 综合报告
        const integratedResponse: GeminiGenerateContentResponse =
          await generateIntegratedReport(currentIndividualReports, userName, mainQuestion);

        integratedObj = {
          title: "Integrated Comprehensive Analysis",
          content: integratedResponse.text
        };
        setIntegratedReport(integratedObj);

        if (integratedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          allGroundingSourcesAccumulated = [
            ...allGroundingSourcesAccumulated,
            ...integratedResponse.candidates[0].groundingMetadata.groundingChunks
          ];
        }

        // 4.2 人格标签（解析到局部变量，避免拿到旧的 state）
        try {
          const tagsResponse = await generateCharacterTags(integratedResponse.text, userName);
          let jsonStr = tagsResponse.text.trim();
          const parsedTags = JSON.parse(jsonStr);

          if (Array.isArray(parsedTags) && parsedTags.every(tag => typeof tag === 'string')) {
            localTags = parsedTags;
          } else if (
            typeof parsedTags === 'object' &&
            parsedTags !== null &&
            Object.values(parsedTags).every(tag => typeof tag === 'string')
          ) {
            localTags = Object.values(parsedTags) as string[];
          } else {
            console.warn("Parsed character tags are not an array of strings or expected object:", parsedTags);
            localTags = [`Tags (preview): ${tagsResponse.text.substring(0, 100)}... (format error)`];
          }
        } catch (e) {
          console.error("Failed to parse character tags JSON:", e);
          localTags = [`Tags (preview): ${userName ? userName + ', ' : ''}parsing error`];
        }
        setCharacterTags(localTags);
      }

      // 5) grounding 源去重并展示
      const uniqueGroundingSources = Array.from(
        new Map(
          allGroundingSourcesAccumulated
            .filter(gs => gs.web?.uri)
            .map(gs => [gs.web!.uri, gs])
        ).values()
      );
      setGroundingSources(uniqueGroundingSources);

      // 6) 入库：使用刚刚的局部 integratedObj / localTags
      try {
        await saveReportsToBackend(currentIndividualReports, integratedObj, localTags);
      } catch (saveError) {
        // 静默，不影响用户查看
        console.warn('报告显示正常，但后端保存失败:', saveError);
      }

      // 7) 展示报告
      setCurrentStep('displayReport');
    } catch (err: any) {
      console.error("Error during analysis:", err);
      setError(err.message || "An unexpected error occurred.");
      setCurrentStep(orderedSelectedMethods.length > 0 ? 'inputForm' : 'methodSelection');
    } finally {
      setIsLoading(false);
    }
  };





  const handleInitiateChat = async () => {
    setIsChatLoading(true);
    setError(null);
    try {
      const reportsForChatContext = [...individualReports];
      if (integratedReport) {
        reportsForChatContext.unshift(integratedReport); // Prioritize integrated report
      }
      
      const initialAiGreeting = await startChatSessionWithReports(reportsForChatContext, characterTags, userName, mainQuestion);
      setChatMessages([{
        id: crypto.randomUUID(),
        sender: 'ai',
        text: initialAiGreeting,
        timestamp: new Date()
      }]);
      setCurrentStep('chatWithAI');
    } catch (err: any) {
      console.error("Error initiating chat:", err);
      setError(err.message || "Could not start chat session.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendChatMessage = async (messageText: string) => {
    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);
    setError(null);

    try {
      const aiResponseText = await sendMessageInChat(messageText);
      const newAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newAiMessage]);
    } catch (err: any) {
      console.error("Error sending chat message:", err);
      const errorAiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: `Sorry, I encountered an issue: ${err.message || "Could not process your message."} Please try again.`,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  const handleEndChatSession = () => {
    endChatSession(); // Inform service to clear chat state
    setChatMessages([]); // Clear messages from UI
    setCurrentStep('displayReport'); 
  };
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'demographics':
        return <WelcomeScreen onSubmit={handleDemographicsSubmit} />;
      case 'methodSelection':
        return (
          <>
            <DivinationMethodSelector
              selectedMethods={selectedMethods}
              onMethodToggle={handleMethodToggle}
            />
            <div className="mt-8 text-center flex flex-col sm:flex-row-reverse justify-center items-center gap-4">
              <button
                onClick={handleProceedToInputs}
                disabled={selectedMethods.size === 0}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                Proceed to Enter Details ({selectedMethods.size} selected)
              </button>
              <button
                onClick={() => setCurrentStep('demographics')}
                className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md transition-colors w-full sm:w-auto"
              >
                Back
              </button>
            </div>
          </>
        );
      case 'inputForm':
        if (orderedSelectedMethods.length === 0 || currentInputMethodIndex >= orderedSelectedMethods.length) {
            setError("Error: No method selected or index out of bounds. Please re-select methods.");
            setCurrentStep('methodSelection'); 
            return null; 
        }
        const currentMethod = orderedSelectedMethods[currentInputMethodIndex];
        const methodConfig = DIVINATION_METHODS_CONFIG.find(mc => mc.id === currentMethod);
        return (
            <section className="bg-slate-800 bg-opacity-70 p-6 rounded-xl shadow-2xl backdrop-blur-md w-full">
              <h2 className="text-2xl font-semibold mb-2 text-purple-300">
                {methodConfig?.name || 'Enter Information'}
              </h2>
              <p className="text-sm text-slate-400 mb-6">Step {currentInputMethodIndex + 1} of {orderedSelectedMethods.length} for divination method: <span className="font-semibold">{methodConfig?.name}</span></p>
              
              <div className="bg-slate-700 bg-opacity-50 p-4 rounded-lg shadow-inner mb-6 min-h-[150px]">
                {renderInputComponent(currentMethod)}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePreviousInput}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextInput}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center"
                >
                  {currentInputMethodIndex === orderedSelectedMethods.length - 1 ? 'Generate AI Analysis' : 'Next'}
                  {currentInputMethodIndex === orderedSelectedMethods.length - 1 && <SparklesIcon className="w-5 h-5 ml-2" />}
                </button>
              </div>
            </section>
        );
      case 'generatingReport':
        return (
          <div className="flex flex-col justify-center items-center py-8 text-center">
            <LoadingSpinner large={true} />
            <p className="ml-4 text-xl text-purple-300 mt-4">Generating insights for {userName}... this may take a moment.</p>
            <p className="text-md text-slate-300">Considering your question: "{mainQuestion}"</p>
          </div>
        );
      case 'displayReport':
        return (
          <>
            {/* 🆕 保存状态指示器 */}
            {saveStatus === 'saving' && (
              <div className="bg-blue-600 bg-opacity-20 border border-blue-400 p-4 rounded-lg mb-6">
                <div className="flex items-center text-blue-300">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300 mr-3"></div>
                  正在保存报告到云端...
                </div>
              </div>
            )}
            
            {saveStatus === 'saved' && (
              <div className="bg-green-600 bg-opacity-20 border border-green-400 p-4 rounded-lg mb-6">
                <div className="flex items-center text-green-300">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ✅ 报告已成功保存到云端
                </div>
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="bg-red-600 bg-opacity-20 border border-red-400 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between text-red-300">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    ❌ 云端保存失败: {saveError}
                  </div>
                  <button
                    onClick={() => saveReportsToBackend(individualReports, integratedReport, characterTags)}
                    className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                  >
                    重试
                  </button>
                </div>
              </div>
            )}


            
            {integratedReport && (
              <ReportDisplay 
                icon={<BookOpenIcon className="w-8 h-8 mr-3 text-purple-300" />} 
                report={integratedReport} 
                className="bg-slate-800 bg-opacity-70 backdrop-blur-md border border-purple-700" 
              />
            )}
            {characterTags.length > 0 && (
              <section className="bg-slate-800 bg-opacity-70 p-6 rounded-xl shadow-2xl backdrop-blur-md mt-6">
                <h2 className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center">
                  <UserGroupIcon className="w-7 h-7 mr-2" /> {userName}'s Character Archetypes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {characterTags.map((tag, index) => (
                    <span key={index} className="bg-cyan-600 bg-opacity-80 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
            {individualReports.length > 0 && (
              <section className="bg-slate-800 bg-opacity-70 p-6 rounded-xl shadow-2xl backdrop-blur-md mt-6">
                 <h2 className="text-2xl font-semibold mb-4 text-blue-300">Individual Method Reports</h2>
                 <div className="space-y-6">
                    {individualReports.map((report, index) => (
                        <ReportDisplay key={index} report={report} isIndividual={true} className="bg-slate-700 bg-opacity-60 shadow-lg"/>
                    ))}
                 </div>
              </section>
            )}
            {groundingSources.length > 0 && (
              <section className="bg-slate-800 bg-opacity-70 p-6 rounded-xl shadow-2xl backdrop-blur-md mt-6">
                <h3 className="text-lg font-semibold mb-3 text-teal-300">Information Sources:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {groundingSources.map((source, index) => (
                    source.web && (
                      <li key={index} className="text-sm">
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-200 hover:underline">
                          {source.web.title || source.web.uri}
                        </a>
                      </li>
                    )
                  ))}
                </ul>
              </section>
            )}
             <div className="mt-8 text-center flex flex-wrap justify-center items-center gap-4">
                <button
                    onClick={handleGoBackToEdit}
                    className="px-6 py-3 order-3 sm:order-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    Back to Edit Inputs
                </button>
                <button
                    onClick={resetAppToBase}
                    className="px-6 py-3 order-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    Start New Divination
                </button>
                {(integratedReport || individualReports.length > 0) && (
                   <button
                    onClick={handleInitiateChat}
                    disabled={isChatLoading}
                    className="w-full sm:w-auto order-1 sm:order-3 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 flex items-center justify-center"
                  >
                    Chat about your Reports
                    {isChatLoading ? <LoadingSpinner /> : <ChevronRightIcon className="w-5 h-5 ml-2" />}
                  </button>
                )}
            </div>
          </>
        );
      case 'chatWithAI':
        return (
          <ChatInterface 
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isLoading={isChatLoading}
            userName={userName}
            onEndChat={handleEndChatSession}
          />
        );
      default:
        const _exhaustiveCheck: never = currentStep;
        return <p>Unknown application state: {_exhaustiveCheck}</p>;
    }
  };

  const renderInputComponent = (method: DivinationMethod) => {
    switch (method) {
      case DivinationMethod.LifePathNumber:
        return <LifePathNumberInput onChange={(data) => handleInputChange(method, data)} initialData={userInputs[DivinationMethod.LifePathNumber]} />;
      case DivinationMethod.Palmistry:
        return <PalmistryInput onChange={(data) => handleInputChange(method, data)} initialData={userInputs[DivinationMethod.Palmistry]} />;
      case DivinationMethod.Astrology:
        return <AstrologyInput onChange={(data) => handleInputChange(method, data)} initialData={userInputs[DivinationMethod.Astrology]} />;
      case DivinationMethod.MBTI:
        return <MBTIInput onChange={(data) => handleInputChange(method, data)} initialData={userInputs[DivinationMethod.MBTI]} />;
      case DivinationMethod.Tarot:
        return <TarotInput onChange={(data) => handleInputChange(method, data)} initialData={userInputs[DivinationMethod.Tarot]} question={mainQuestion} />;
      default:
        const _exhaustiveCheck: never = method; 
        return <p>Unknown input component for method: {_exhaustiveCheck}</p>;
    }
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center ${currentStep === 'chatWithAI' ? 'justify-start' : 'items-center'}`}>
      <Header title={APP_TITLE} />
      <main className={`w-full ${currentStep === 'chatWithAI' ? 'max-w-4xl' : 'max-w-3xl'} space-y-8`}>
        {error && currentStep !== 'chatWithAI' && <ErrorMessage message={error} />} {/* Don't show global error in chat, chat handles its own */}
        {renderCurrentStep()}
      </main>
      <footer className={`w-full ${currentStep === 'chatWithAI' ? 'hidden' : 'max-w-5xl text-center mt-12 py-6 border-t border-slate-700'}`}>
        <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved (conceptually).</p>
      </footer>
    </div>
  );
};

export default App;
