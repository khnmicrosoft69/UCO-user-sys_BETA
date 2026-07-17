import React, { useState, useEffect } from 'react';
import FormStep1 from './FormStep1.jsx';
import FormStep2 from './FormStep2.jsx';
import FormStep3 from './FormStep3.jsx';
import FormStep4 from './FormStep4.jsx';
import MobileLanding from './MobileLanding.jsx';
import { useResponsiveLayout } from './layout/ResponsiveLayout';
import { DesktopFormWrapper } from './layout/DesktopViewing';
import { MobileFormWrapper } from './layout/MobileViewing';

export default function FormContainer() {
  const { isMobile } = useResponsiveLayout();
  const FormWrapper = isMobile ? MobileFormWrapper : DesktopFormWrapper;

  const [view, setView] = useState('landing'); // 'landing' or 'form'
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    acceptedGuidelines: false,
    requestType: '',
    requestDetails: {
      office_name: '',
      requestedByName: '',
      requestedByMobile: '',
      alternateContactName: '',
      alternateContactMobile: '',
      socialAccount: '',
      serviceType: '',
      otherService: ''
    },
    eventInfo: {
      eventDetails: '',
      files: []
    }
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setFormData(prev => ({
        ...prev,
        email: user.email,
        requestDetails: {
          ...prev.requestDetails,
          requestedByName: user.fullName,
          office_name: user.office
        }
      }));
    }
  }, []);

  const startForm = () => {
    setView('form');
    setStep(1);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => {
    if (step === 1) {
      setView('landing');
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      alert('You must be logged in to submit a request.');
      window.location.href = '/login';
      return;
    }
    const user = JSON.parse(savedUser);

    const data = new FormData();
    data.append('user_id', user.id);
    data.append('email', formData.email);
    
    const requestTypes = Array.isArray(formData.requestType) 
      ? formData.requestType 
      : (formData.requestType ? [formData.requestType] : []);
    data.append('requestType', requestTypes.join(', '));
    
    data.append('office_name', formData.requestDetails.office_name);
    data.append('requestedByName', formData.requestDetails.requestedByName);
    data.append('requestedByMobile', formData.requestDetails.requestedByMobile);
    data.append('alternateContactName', formData.requestDetails.alternateContactName || '');
    data.append('alternateContactMobile', formData.requestDetails.alternateContactMobile || '');

    const socialAccounts = Array.isArray(formData.requestDetails.socialAccount)
      ? formData.requestDetails.socialAccount
      : (formData.requestDetails.socialAccount ? [formData.requestDetails.socialAccount] : []);
    data.append('socialAccount', socialAccounts.join(', '));

    const servicesList = [];
    requestTypes.forEach(type => {
      if (type === 'Official AdZU Website') {
        servicesList.push(`Website (${formData.requestDetails.webFormOfPost || 'Post'})`);
      } else if (type === 'Official AdZU Social Media Accounts') {
        const socialServs = Array.isArray(formData.requestDetails.socialService) ? formData.requestDetails.socialService : [];
        servicesList.push(`Social Media (${socialServs.join(', ')})`);
      } else if (type === 'Print Media') {
        servicesList.push(`Print Media (${(formData.requestDetails.printSizes || []).join(', ')})`);
      } else if (type === 'Photo Documentation') {
        servicesList.push('Photo Doc');
      } else if (type === 'Video Documentation') {
        servicesList.push('Video Doc');
      } else if (type === 'Facebook Live') {
        servicesList.push('FB Live');
      } else {
        const genericServs = Array.isArray(formData.requestDetails.serviceType) ? formData.requestDetails.serviceType : [];
        servicesList.push(`${type} (${genericServs.join(', ')})`);
      }
    });
    data.append('serviceType', servicesList.join(' | '));

    let compiledDetails = "";
    requestTypes.forEach(type => {
      if (type === 'Official AdZU Website') {
        compiledDetails += `--- OFFICIAL ADZU WEBSITE ---\n`;
        compiledDetails += `Date Submitted: ${formData.requestDetails.webDateSubmitted || 'N/A'}\n`;
        compiledDetails += `Date required to be posted: ${formData.requestDetails.webDateRequired || 'N/A'}\n`;
        compiledDetails += `Name of Event/Project: ${formData.requestDetails.webEventName || 'N/A'}\n`;
        compiledDetails += `Where to post: ${(formData.requestDetails.webWhereToPost || []).join(', ')}${formData.requestDetails.webWhereToPostOther ? ` (Other: ${formData.requestDetails.webWhereToPostOther})` : ''}\n`;
        compiledDetails += `Form of post: ${formData.requestDetails.webFormOfPost || 'N/A'}\n\n`;
      } else if (type === 'Official AdZU Social Media Accounts') {
        compiledDetails += `--- OFFICIAL ADZU SOCIAL MEDIA ACCOUNTS ---\n`;
        compiledDetails += `Choose AdZU Social Media Account: ${(formData.requestDetails.socialAccount || []).join(', ')}\n`;
        compiledDetails += `Service: ${(formData.requestDetails.socialService || []).join(', ')}${formData.requestDetails.socialServiceOther ? ` (Other: ${formData.requestDetails.socialServiceOther})` : ''}\n\n`;
      } else if (type === 'Print Media') {
        compiledDetails += `--- PRINT MEDIA ---\n`;
        compiledDetails += `Date Requested: ${formData.requestDetails.printDateRequested || 'N/A'}\n`;
        compiledDetails += `Date Needed: ${formData.requestDetails.printDateNeeded || 'N/A'}\n`;
        compiledDetails += `Event Information: ${formData.requestDetails.printEventInfo || 'N/A'}\n`;
        compiledDetails += `Sizes and Prices: ${(formData.requestDetails.printSizes || []).join(', ')}${formData.requestDetails.printSizesOther ? ` (Other: ${formData.requestDetails.printSizesOther})` : ''}\n`;
        compiledDetails += `Number of Sheet/s: ${formData.requestDetails.printNumSheets || 'N/A'}\n\n`;
      } else if (type === 'Photo Documentation' || type === 'Video Documentation') {
        compiledDetails += `--- PHOTO/VIDEO DOCUMENTATION ---\n`;
        compiledDetails += `Event Point Person Name & Mobile: ${formData.requestDetails.photoVideoPointPerson || 'N/A'}\n`;
        compiledDetails += `Date of Event: ${formData.requestDetails.photoVideoDate || 'N/A'}\n`;
        compiledDetails += `Time of Event: ${formData.requestDetails.photoVideoTime || 'N/A'}\n`;
        compiledDetails += `Location of Event: ${formData.requestDetails.photoVideoLocation || 'N/A'}\n`;
        compiledDetails += `Name of Event: ${formData.requestDetails.photoVideoEventName || 'N/A'}\n`;
        compiledDetails += `Event Information/Press Release Template:\n${formData.requestDetails.photoVideoEventInfo || 'N/A'}\n\n`;
      } else if (type === 'Facebook Live') {
        compiledDetails += `--- FACEBOOK LIVE ---\n`;
        compiledDetails += `Event Point Person Name & Mobile: ${formData.requestDetails.fbLivePointPerson || 'N/A'}\n`;
        compiledDetails += `Event Title: ${formData.requestDetails.fbLiveEventTitle || 'N/A'}\n`;
        compiledDetails += `Event Date & Time: ${formData.requestDetails.fbLiveEventDate || 'N/A'} ${formData.requestDetails.fbLiveEventTime || 'N/A'}\n`;
        compiledDetails += `Event Duration: ${formData.requestDetails.fbLiveDuration || 'N/A'}\n`;
        compiledDetails += `Event Point Person/Coordinator: ${formData.requestDetails.fbLiveCoordinator || 'N/A'}\n\n`;
      }
    });

    const userEventDetails = formData.eventInfo.eventDetails || "";
    const finalEventDetails = compiledDetails 
      ? `${compiledDetails}--- ADDITIONAL CONTEXT ---\n${userEventDetails}`
      : userEventDetails;

    data.append('eventDetails', finalEventDetails);
    
    const allFiles = [
      ...(formData.eventInfo.files || []),
      ...(formData.requestDetails.printFiles || []),
      ...(formData.requestDetails.photoVideoFiles || []),
      ...(formData.requestDetails.fbLiveFlowFile || [])
    ];
    allFiles.forEach(file => data.append('files', file));
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: data
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorText = await response.text();
        console.error('Submission failed:', errorText);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">✓</div>
        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Request Submitted!</h2>
        <p className="text-slate-500 mb-10 text-sm font-medium">Thank you for your submission. Your request has been sent to the University Communications Office for review.</p>
        <div className="p-6 bg-slate-50 rounded-3xl mb-10 text-left border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirmation Note:</p>
          <p className="text-xs text-slate-600 leading-relaxed italic font-medium">"Please call UCO (local number 2025/2026) upon submission for confirmation of request/s."</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-5 bg-[#0A1C5C] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  if (view === 'landing') {
    return <MobileLanding onCreateRequest={startForm} />;
  }

  return (
    <FormWrapper>
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-100 h-2 flex">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-700 ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>
        
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-10">
            <button 
              onClick={prevStep}
              className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                ←
              </div>
              <span className="hidden sm:inline uppercase tracking-widest">Back</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-2">Step {step} of 4</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-indigo-600 w-5' : 'bg-slate-200'} transition-all duration-300`} />
                ))}
              </div>
            </div>
            <div className="w-16 hidden sm:block"></div>
          </div>


          <div className="min-h-[400px]">
            {step === 1 && <FormStep1 formData={formData} setFormData={setFormData} onNext={nextStep} />}
            {step === 2 && <FormStep2 formData={formData} setFormData={setFormData} onNext={nextStep} onPrev={prevStep} />}
            {step === 3 && <FormStep3 formData={formData} setFormData={setFormData} onNext={nextStep} onPrev={prevStep} />}
            {step === 4 && <FormStep4 formData={formData} setFormData={setFormData} onSubmit={handleSubmit} onPrev={prevStep} />}
          </div>
        </div>
      </div>
    </FormWrapper>
  );
}
